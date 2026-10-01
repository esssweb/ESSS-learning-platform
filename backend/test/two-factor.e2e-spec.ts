import { Global, INestApplication, Module, ValidationPipe } from '@nestjs/common';
import { getModelToken } from '@nestjs/sequelize';
import { Test } from '@nestjs/testing';
import { authenticator } from 'otplib';
import { AppModule } from '../src/app.module';
import {
  AUTH_REPOSITORY,
  DEVICE_TOKEN_REPOSITORY,
  EMAIL_SERVICE,
  ENCRYPTION_SERVICE,
  REFRESH_TOKEN_REPOSITORY,
  USER_REPOSITORY,
} from '../src/core/application/ports/tokens';
import { UserRole } from '../src/core/domain/enums/user-role.enum';
import { DatabaseModule } from '../src/infrastructure/database/database.module';
import { databaseProviders } from '../src/infrastructure/database/database.providers';
import {
  AuthEntity,
  DeviceTokenEntity,
  RefreshTokenEntity,
  UserEntity,
} from '../src/infrastructure/database/entities';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const request = require('supertest');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const jwt = require('jsonwebtoken');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const bcrypt = require('bcrypt');

type Row = Record<string, any>;

// One mutable row per table, shared by the fake models and the assertions, so
// state persisted by a request is visible to the next one.
let authRow: Row;
let userRow: Row;
// Plaintext OTP captured from the overridden email service.
let sentOtp: string;

const PASSWORD = 'Admin@123';
const EMAIL = 'admin@esss.local';

const makeAuthModel = () => ({
  findOne: async () => authRow,
  findByPk: async () => authRow,
  create: async () => authRow,
  // Mirrors the transaction the repository opens for its row lock.
  sequelize: {
    transaction: async (fn: (t: unknown) => Promise<unknown>) => fn({ LOCK: { UPDATE: 'UPDATE' } }),
  },
});
const makeUserModel = () => ({
  findOne: async () => userRow,
  findByPk: async () => userRow,
  findAndCountAll: async () => ({ rows: [], count: 0 }),
  create: async () => userRow,
});
const passthroughModel = () => ({
  create: async (v: unknown) => ({ id: 'row-1', ...(v as object) }),
  findOne: async () => null,
  findByPk: async () => null,
  findAll: async () => [],
  update: async () => [1],
});

@Global()
@Module({
  providers: [
    { provide: getModelToken(AuthEntity), useFactory: makeAuthModel },
    { provide: getModelToken(UserEntity), useFactory: makeUserModel },
    { provide: getModelToken(RefreshTokenEntity), useFactory: passthroughModel },
    { provide: getModelToken(DeviceTokenEntity), useFactory: passthroughModel },
    ...databaseProviders,
  ],
  exports: [AUTH_REPOSITORY, USER_REPOSITORY, REFRESH_TOKEN_REPOSITORY, DEVICE_TOKEN_REPOSITORY],
})
class FakeDatabaseModule {}

describe('Admin two-factor authentication (e2e)', () => {
  let app: INestApplication;
  let http: any;

  const withUpdate = (row: Row): Row => ({
    ...row,
    update(values: Row) {
      Object.assign(this, values);
      return this;
    },
  });

  const buildAuthRow = () =>
    withUpdate({
      id: 'auth-1',
      email: EMAIL,
      password: bcrypt.hashSync(PASSWORD, 4),
      emailVerified: true,
      otpCode: null,
      otpExpiresAt: null,
      otpAttemptCount: 0,
      otpRequestCount: 0,
      lastOtpSentAt: null,
      verificationToken: null,
      isActive: true,
      totpSecret: null,
      totpEnabledAt: null,
      totpLastUsedStep: null,
      loginOtpCode: null,
      loginOtpExpiresAt: null,
      loginOtpAttemptCount: 0,
      loginOtpRequestCount: 0,
      loginOtpLastSentAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

  const mint = (userId: string, role: UserRole) =>
    jwt.sign({ userId, email: EMAIL, role }, process.env.JWT_SECRET, { expiresIn: '5m' });

  const login = () => request(http).post('/auth/login').send({ email: EMAIL, password: PASSWORD });
  const verify = (challengeToken: string, code: string) =>
    request(http).post('/auth/2fa/verify').send({ challengeToken, code });

  // Seeds a confirmed authenticator using the app's own encryption service.
  const enableTotp = (): string => {
    const secret = authenticator.generateSecret();
    authRow.totpSecret = app.get(ENCRYPTION_SERVICE, { strict: false }).encrypt(secret);
    authRow.totpEnabledAt = new Date();
    return secret;
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideModule(DatabaseModule)
      .useModule(FakeDatabaseModule)
      // The OTP is bcrypt-hashed before storage, so the happy path can only be
      // asserted by capturing the plaintext on its way to the mail service.
      .overrideProvider(EMAIL_SERVICE)
      .useValue({
        sendLoginOtp: async (_email: string, code: string) => {
          sentOtp = code;
        },
      })
      .compile();

    app = moduleRef.createNestApplication();
    // main.ts applies this globally; Test.createTestingModule does not.
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    await app.init();
    http = app.getHttpServer();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    sentOtp = '';
    authRow = buildAuthRow();
    userRow = withUpdate({
      id: 'user-1',
      authId: 'auth-1',
      firstName: 'Admin',
      lastName: 'Demo',
      phoneNumber: null,
      profilePicture: null,
      gender: null,
      role: UserRole.ADMIN,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // Freezes Date.now() mid-way through a 30s TOTP step so a code and its replay
  // can never straddle a step boundary. Only Date.now is stubbed (not timers),
  // so bcrypt and supertest keep working.
  const pinClockMidStep = () => {
    const now = Date.now();
    jest.spyOn(Date, 'now').mockReturnValue(Math.floor(now / 30000) * 30000 + 15000);
  };

  describe('login', () => {
    it('returns a challenge instead of tokens for an admin', async () => {
      const res = await login();

      expect(res.status).toBe(200);
      expect(res.body.data).toMatchObject({ twoFactorRequired: true, method: 'EMAIL' });
      expect(res.body.data.challengeToken).toEqual(expect.any(String));
      expect(res.body.data.accessToken).toBeUndefined();
      expect(res.body.data.refreshToken).toBeUndefined();
    });

    it('returns tokens directly for a student', async () => {
      userRow.role = UserRole.STUDENT;

      const res = await login();

      expect(res.status).toBe(200);
      expect(res.body.data.accessToken).toEqual(expect.any(String));
      expect(res.body.data.refreshToken).toEqual(expect.any(String));
      expect(res.body.data.twoFactorRequired).toBeUndefined();
    });
  });

  describe('email factor', () => {
    it('exchanges a valid emailed OTP for tokens', async () => {
      const challenge = (await login()).body.data.challengeToken;

      const res = await verify(challenge, sentOtp);

      expect(res.status).toBe(200);
      expect(res.body.data.accessToken).toEqual(expect.any(String));
      expect(res.body.data.refreshToken).toEqual(expect.any(String));
    });

    it('rejects a wrong code with 401', async () => {
      const challenge = (await login()).body.data.challengeToken;

      const res = await verify(challenge, sentOtp === '000000' ? '111111' : '000000');

      expect(res.status).toBe(401);
    });

    it('rejects a replay of the consumed OTP', async () => {
      const challenge = (await login()).body.data.challengeToken;
      const code = sentOtp;

      expect((await verify(challenge, code)).status).toBe(200);
      expect((await verify(challenge, code)).status).toBe(401);
    });

    it('kills the challenge after five wrong codes, even for the correct one', async () => {
      const challenge = (await login()).body.data.challengeToken;
      const correct = sentOtp;
      const wrong = correct === '000000' ? '111111' : '000000';

      for (let i = 0; i < 5; i += 1) {
        expect((await verify(challenge, wrong)).status).toBe(401);
      }

      expect((await verify(challenge, correct)).status).toBe(401);
    });

    it('resend returns a new challenge token that verifies with the newly emailed OTP', async () => {
      const first = (await login()).body.data.challengeToken;
      const firstOtp = sentOtp;

      const resend = await request(http).post('/auth/2fa/resend').send({ challengeToken: first });
      expect(resend.status).toBe(200);
      const fresh = resend.body.data.challengeToken;
      expect(fresh).toEqual(expect.any(String));
      expect(sentOtp).not.toBe('');

      // The resend replaced the stored OTP, so the old code no longer works
      // (the guard skips the 1-in-900000 case of two identical random codes).
      if (firstOtp !== sentOtp) {
        expect((await verify(fresh, firstOtp)).status).toBe(401);
      }
      const res = await verify(fresh, sentOtp);
      expect(res.status).toBe(200);
      expect(res.body.data.accessToken).toEqual(expect.any(String));
    });
  });

  describe('TOTP factor', () => {
    it('challenges with TOTP, accepts a valid code, and rejects its replay', async () => {
      pinClockMidStep();
      const secret = enableTotp();

      const loginRes = await login();
      expect(loginRes.status).toBe(200);
      expect(loginRes.body.data.method).toBe('TOTP');
      expect(sentOtp).toBe('');
      const challenge = loginRes.body.data.challengeToken;
      const code = authenticator.generate(secret);

      const first = await verify(challenge, code);
      expect(first.status).toBe(200);
      expect(first.body.data.accessToken).toEqual(expect.any(String));

      expect((await verify(challenge, code)).status).toBe(401);
    });

    it('invalidates a stale TOTP challenge after a SUPER_ADMIN resets 2FA', async () => {
      pinClockMidStep();
      const secret = enableTotp();
      const challenge = (await login()).body.data.challengeToken;

      const reset = await request(http)
        .post('/users/user-1/2fa/reset')
        .set('Authorization', `Bearer ${mint('user-2', UserRole.SUPER_ADMIN)}`);
      expect(reset.status).toBe(200);

      // The account is back on the email factor; the TOTP challenge is bound to the old one.
      expect((await verify(challenge, authenticator.generate(secret))).status).toBe(401);
    });

    it('does not let a stale TOTP challenge be redeemed with the new email OTP', async () => {
      pinClockMidStep();
      enableTotp();
      const staleTotpChallenge = (await login()).body.data.challengeToken;

      await request(http)
        .post('/users/user-1/2fa/reset')
        .set('Authorization', `Bearer ${mint('user-2', UserRole.SUPER_ADMIN)}`);

      // A fresh email login now holds a valid OTP; the old challenge must not accept it.
      expect((await login()).body.data.method).toBe('EMAIL');
      expect((await verify(staleTotpChallenge, sentOtp)).status).toBe(401);
    });
  });

  describe('challenge token is not a session token', () => {
    it('is rejected as a bearer on GET /users and POST /auth/logout', async () => {
      const challenge = (await login()).body.data.challengeToken;

      const users = await request(http).get('/users').set('Authorization', `Bearer ${challenge}`);
      expect(users.status).toBe(401);

      const logout = await request(http)
        .post('/auth/logout')
        .set('Authorization', `Bearer ${challenge}`);
      expect(logout.status).toBe(401);
    });

    it('rejects any bearer carrying a purpose claim, even with a user identity', async () => {
      const token = jwt.sign(
        { userId: 'user-1', email: EMAIL, role: UserRole.ADMIN, purpose: '2fa-challenge' },
        process.env.JWT_SECRET,
        { expiresIn: '5m' },
      );

      const res = await request(http).get('/users').set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(401);
    });

    it('rejects an access token presented as a challenge', async () => {
      const res = await verify(mint('user-1', UserRole.ADMIN), '123456');

      expect(res.status).toBe(401);
    });
  });

  describe('TOTP enrollment', () => {
    const enroll = (token: string, body?: object) => {
      const req = request(http)
        .post('/auth/2fa/totp/enroll')
        .set('Authorization', `Bearer ${token}`);
      return body === undefined ? req : req.send(body);
    };

    it('requires the current password, using a real access token', async () => {
      const challenge = (await login()).body.data.challengeToken;
      const access = (await verify(challenge, sentOtp)).body.data.accessToken;

      expect((await enroll(access)).status).toBe(400);
      expect((await enroll(access, { password: 'wrong-password' })).status).toBe(401);

      const ok = await enroll(access, { password: PASSWORD });
      expect(ok.status).toBe(200);
      expect(ok.body.data.otpauthUri).toMatch(/^otpauth:\/\//);
    });

    it('is forbidden for a STUDENT', async () => {
      const res = await enroll(mint('user-1', UserRole.STUDENT), { password: PASSWORD });

      expect(res.status).toBe(403);
    });
  });

  describe('two-factor reset', () => {
    it('is forbidden for ADMIN and allowed for SUPER_ADMIN', async () => {
      const forbidden = await request(http)
        .post('/users/user-1/2fa/reset')
        .set('Authorization', `Bearer ${mint('user-1', UserRole.ADMIN)}`);
      expect(forbidden.status).toBe(403);

      const allowed = await request(http)
        .post('/users/user-1/2fa/reset')
        .set('Authorization', `Bearer ${mint('user-2', UserRole.SUPER_ADMIN)}`);
      expect(allowed.status).toBe(200);
    });

    it('forbids a SUPER_ADMIN resetting their own two-factor', async () => {
      const res = await request(http)
        .post('/users/user-2/2fa/reset')
        .set('Authorization', `Bearer ${mint('user-2', UserRole.SUPER_ADMIN)}`);

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('SelfTwoFactorResetException');
    });
  });

  it('still requires authentication on user routes', async () => {
    const res = await request(http).get('/users');

    expect(res.status).toBe(401);
  });
});
