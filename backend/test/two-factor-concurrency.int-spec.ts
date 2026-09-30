/**
 * Proves the two-factor attempt caps and rate limits hold under concurrent
 * requests against a REAL Postgres (row lock in AuthRepository.updateExclusively).
 * Skipped unless TEST_DB_PORT is set. The database is wiped and rebuilt from
 * the migrations, so point it only at a scratch database.
 */
import { readdirSync } from 'fs';
import { join } from 'path';
import { Sequelize as SequelizeTs } from 'sequelize-typescript';
import { Sequelize } from 'sequelize';
import { authenticator } from 'otplib';
import { randomBytes } from 'crypto';
import { AuthEntity } from '../src/infrastructure/database/entities/auth.entity';
import { UserEntity } from '../src/infrastructure/database/entities/user.entity';
import { RefreshTokenEntity } from '../src/infrastructure/database/entities/refresh-token.entity';
import { DeviceTokenEntity } from '../src/infrastructure/database/entities/device-token.entity';
import { AuthRepository } from '../src/infrastructure/database/repositories/auth/auth.repository';
import { UserRepository } from '../src/infrastructure/database/repositories/user/user.repository';
import { RefreshTokenRepository } from '../src/infrastructure/database/repositories/auth/refresh-token.repository';
import { DeviceTokenRepository } from '../src/infrastructure/database/repositories/auth/device-token.repository';
import { BcryptHashService } from '../src/infrastructure/security/services/bcrypt-hash.service';
import { JwtTokenService } from '../src/infrastructure/security/services/jwt-token.service';
import { OtplibTotpService } from '../src/infrastructure/security/services/totp.service';
import { AesEncryptionService } from '../src/infrastructure/security/services/encryption.service';
import { VerifyTwoFactorUseCase } from '../src/core/application/use-cases/auth/verify-two-factor.use-case';
import { issueTwoFactorChallenge } from '../src/core/application/use-cases/auth/two-factor-challenge.helper';
import { Auth } from '../src/core/domain/models/auth/auth.model';
import { User } from '../src/core/domain/models/user/user.model';
import { UserRole } from '../src/core/domain/enums/user-role.enum';
import { OtpRateLimitException } from '../src/core/domain/exceptions/otp-rate-limit.exception';

const enabled = !!process.env.TEST_DB_PORT;
const describeIf = enabled ? describe : describe.skip;

describeIf('two-factor concurrency (real Postgres)', () => {
  jest.setTimeout(120_000);

  let sequelize: SequelizeTs;
  let authRepository: AuthRepository;
  let userRepository: UserRepository;
  let refreshRepo: RefreshTokenRepository;
  let deviceRepo: DeviceTokenRepository;
  let realHash: BcryptHashService;
  let compareCalls: number;
  let hashService: {
    hash: (p: string) => Promise<string>;
    compare: (p: string, h: string) => Promise<boolean>;
  };
  let tokenService: JwtTokenService;
  let totpService: OtplibTotpService;
  let encryption: AesEncryptionService;
  let sentOtps: string[];
  let emailService: { sendOtp: (e: string, c: string) => Promise<void> };
  let verify: VerifyTwoFactorUseCase;
  let seq = 0;

  beforeAll(async () => {
    sequelize = new SequelizeTs({
      dialect: 'postgres',
      host: process.env.TEST_DB_HOST ?? '127.0.0.1',
      port: Number(process.env.TEST_DB_PORT),
      username: process.env.TEST_DB_USER ?? 'postgres',
      password: process.env.TEST_DB_PASSWORD ?? '',
      database: process.env.TEST_DB_NAME ?? 'esss_test',
      logging: false,
      pool: { max: 20 },
      models: [AuthEntity, UserEntity, RefreshTokenEntity, DeviceTokenEntity],
    });

    await sequelize.query('DROP SCHEMA public CASCADE');
    await sequelize.query('CREATE SCHEMA public');

    const dir = join(__dirname, '../src/infrastructure/database/migrations');
    const files = readdirSync(dir)
      .filter((f) => f.endsWith('.js'))
      .sort();
    for (const file of files) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const migration = require(join(dir, file));
      await migration.up(sequelize.getQueryInterface(), Sequelize);
    }

    const config = {
      get: (key: string) =>
        ({
          JWT_SECRET: 'int-test-access-secret',
          REFRESH_TOKEN_SECRET: 'int-test-refresh-secret',
          TOTP_ENCRYPTION_KEY: randomBytes(32).toString('base64'),
        })[key],
    };

    authRepository = new AuthRepository(AuthEntity);
    userRepository = new UserRepository(UserEntity);
    refreshRepo = new RefreshTokenRepository(RefreshTokenEntity);
    deviceRepo = new DeviceTokenRepository(DeviceTokenEntity);
    realHash = new BcryptHashService();
    hashService = {
      hash: (p) => realHash.hash(p),
      compare: async (p, h) => {
        compareCalls += 1;
        return realHash.compare(p, h);
      },
    };
    tokenService = new JwtTokenService(config as never);
    totpService = new OtplibTotpService();
    encryption = new AesEncryptionService(config as never);
    emailService = {
      sendOtp: async (_email, code) => {
        sentOtps.push(code);
      },
    };
    verify = new VerifyTwoFactorUseCase(
      authRepository,
      userRepository,
      refreshRepo,
      deviceRepo,
      hashService as never,
      tokenService,
      totpService,
      encryption,
    );
  });

  afterAll(async () => {
    if (sequelize) await sequelize.close();
  });

  beforeEach(() => {
    compareCalls = 0;
    sentOtps = [];
  });

  const seedAdmin = async (opts: { totpSecret?: string; emailOtp?: string } = {}) => {
    seq += 1;
    const auth = await authRepository.create(
      new Auth({
        email: `admin${seq}@esss.local`,
        password: 'x',
        emailVerified: true,
        otpAttemptCount: 0,
        otpRequestCount: 0,
        isActive: true,
        loginOtpAttemptCount: 0,
        loginOtpRequestCount: 0,
      }),
    );
    await userRepository.create(
      new User({ authId: auth.id!, firstName: 'A', lastName: 'B', role: UserRole.ADMIN }),
    );
    if (opts.emailOtp) {
      auth.setLoginOtp(await realHash.hash(opts.emailOtp), new Date(Date.now() + 5 * 60_000));
      await authRepository.update(auth.id!, auth);
    }
    if (opts.totpSecret) {
      auth.enrollTotp(encryption.encrypt(opts.totpSecret));
      auth.confirmTotp();
      await authRepository.update(auth.id!, auth);
    }
    return auth;
  };

  const challengeFor = (authId: string, method: string) =>
    tokenService.generateTwoFactorChallengeToken({ authId, method });

  const dbRow = async (authId: string) => {
    const [rows] = (await sequelize.query(
      'SELECT login_otp_attempt_count AS attempts, login_otp_request_count AS requests, login_otp_code AS code FROM auth WHERE id = :id',
      { replacements: { id: authId } },
    )) as [Array<{ attempts: number; requests: number; code: string | null }>, unknown];
    return rows[0];
  };

  const settle = (promises: Promise<unknown>[]) => Promise.allSettled(promises);

  it('runs the migrations on real Postgres (auth table has the 2FA columns)', async () => {
    const auth = await seedAdmin();
    const row = await dbRow(auth.id!);
    expect(row.attempts).toBe(0);
  });

  it('EMAIL: 60 concurrent guesses with the correct one at ~46 -> at most 5 compares, no tokens, count 5', async () => {
    const auth = await seedAdmin({ emailOtp: '123456' });
    const token = challengeFor(auth.id!, 'EMAIL');

    const calls: Promise<unknown>[] = [];
    for (let i = 0; i < 60; i++) {
      const code = i === 46 ? '123456' : String(100000 + i);
      calls.push(verify.execute({ challengeToken: token, code }));
    }
    const results = await settle(calls);

    expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(0);
    expect(compareCalls).toBeLessThanOrEqual(5);
    const row = await dbRow(auth.id!);
    // The fifth failure clears the OTP, which also resets the counter; the challenge is dead.
    expect(row.code).toBeNull();
    expect(compareCalls).toBe(5);
  });

  it('EMAIL: 10 sequential wrong guesses -> exactly 5 compares', async () => {
    const auth = await seedAdmin({ emailOtp: '123456' });
    const token = challengeFor(auth.id!, 'EMAIL');

    for (let i = 0; i < 10; i++) {
      await expect(
        verify.execute({ challengeToken: token, code: String(200000 + i) }),
      ).rejects.toBeDefined();
    }

    expect(compareCalls).toBe(5);
    // And the correct code no longer works.
    await expect(verify.execute({ challengeToken: token, code: '123456' })).rejects.toBeDefined();
    expect(compareCalls).toBe(5);
  });

  it('EMAIL: 5 concurrent verifies with the SAME correct code -> exactly one succeeds', async () => {
    const auth = await seedAdmin({ emailOtp: '123456' });
    const token = challengeFor(auth.id!, 'EMAIL');

    const results = await settle(
      Array.from({ length: 5 }, () => verify.execute({ challengeToken: token, code: '123456' })),
    );

    expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
    expect((await dbRow(auth.id!)).code).toBeNull();
  });

  it('TOTP: 60 concurrent guesses with a valid code at ~46 -> no tokens, count exactly 5', async () => {
    const secret = totpService.generateSecret();
    const auth = await seedAdmin({ totpSecret: secret });
    // A challenge issuance gives the TOTP attempt budget its fresh start.
    const token = challengeFor(auth.id!, 'TOTP');
    const valid = new Set<string>();
    const now = Date.now();
    for (const offset of [-30_000, 0, 30_000]) {
      authenticator.options = { epoch: now + offset };
      valid.add(authenticator.generate(secret));
    }
    authenticator.resetOptions();
    authenticator.options = { step: 30, window: 1 };
    const validCode = authenticator.generate(secret);

    const wrong: string[] = [];
    for (let n = 0; wrong.length < 60; n++) {
      const c = String(300000 + n);
      if (!valid.has(c)) wrong.push(c);
    }

    const calls: Promise<unknown>[] = [];
    for (let i = 0; i < 60; i++) {
      calls.push(verify.execute({ challengeToken: token, code: i === 46 ? validCode : wrong[i] }));
    }
    const results = await settle(calls);

    expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(0);
    expect((await dbRow(auth.id!)).attempts).toBe(5);
  });

  it('challenge issuance: 10 concurrent requests with 2 of 3 used -> exactly 1 succeeds, count 3', async () => {
    const auth = await seedAdmin();
    await sequelize.query(
      'UPDATE auth SET login_otp_request_count = 2, login_otp_last_sent_at = now() WHERE id = :id',
      { replacements: { id: auth.id } },
    );
    const deps = {
      authRepository,
      hashService: hashService as never,
      tokenService,
      emailService,
    };
    const stale = (await authRepository.findById(auth.id!))!;

    const results = await settle(
      Array.from({ length: 10 }, () => issueTwoFactorChallenge(deps, stale)),
    );

    expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
    const rejected = results.filter((r) => r.status === 'rejected') as PromiseRejectedResult[];
    expect(rejected).toHaveLength(9);
    for (const r of rejected) expect(r.reason).toBeInstanceOf(OtpRateLimitException);
    expect((await dbRow(auth.id!)).requests).toBe(3);
    expect(sentOtps).toHaveLength(1);
  });
});
