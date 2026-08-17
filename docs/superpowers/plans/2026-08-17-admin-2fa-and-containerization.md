# Admin 2FA, Containerization, and Doc Cleanup — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Require a second authentication factor for every ADMIN/SUPER_ADMIN login, containerize the backend for Azure, move configuration to `.env.dev`, and delete three stale planning docs.

**Architecture:** Login becomes a discriminated union — admins receive a short-lived signed challenge token instead of access/refresh tokens, and exchange it plus a code at `POST /auth/2fa/verify`. Email OTP is the default factor and needs no enrollment; TOTP is an opt-in upgrade that replaces it. All 2FA state lives in dedicated columns on the existing `auth` table, deliberately separate from the registration OTP columns.

**Tech Stack:** NestJS 10, Sequelize 6 + sequelize-typescript, PostgreSQL, `otplib` (TOTP), `jsonwebtoken`, `bcrypt`, Node 20, Docker.

**Spec:** `docs/superpowers/specs/2026-08-17-admin-2fa-and-containerization-design.md`

## Global Constraints

- `src/core/domain/` must contain **zero** framework imports. No `@nestjs/*`, no `sequelize`, no `class-validator`, no `bcrypt`. Verify with `grep -rn "@nestjs\|sequelize\|class-validator" src/core/domain/` returning nothing.
- `src/core/application/` may import `@nestjs/common` for `@Injectable`/`@Inject` only.
- DI tokens are string constants in `src/core/application/ports/tokens.ts`.
- Entities use `underscored: true`; DB columns are snake_case with explicit `field:` on the entity.
- Domain exceptions extend `DomainException` and carry only a message. HTTP status mapping lives solely in `DomainExceptionFilter`. Use cases and controllers never throw `HttpException`.
- Controllers never catch domain exceptions; they propagate to the global filter.
- Never edit an existing migration — always add a new one.
- Config is read through `ConfigService`, never `process.env` directly in new application code.
- All work happens on branch `feat/admin-2fa-and-containerization`. Never run `git push`, `npm run db:migrate`, or `npm run db:seed` — the user runs database commands manually.
- After every task: `./node_modules/.bin/tsc --noEmit -p tsconfig.json`, `npm run build`, and `npx jest --silent` must all pass. All commands run from `backend/`.

---

## File Structure

**Phase A — docs (delete only)**
- Delete: `backend/TASK_ALLOCATION.md`, `backend/PROGRESS_REPORT.md`, `backend/PLAN.md`

**Phase B — config & containers**
- Modify: `backend/src/app.module.ts` (envFilePath), `backend/src/infrastructure/database/config/database.config.js` (dotenv), `backend/src/infrastructure/config/env/env.validation.ts` (new key), `backend/package.json` (deps), `backend/.gitignore`
- Create: `backend/.env.dev.example`, `backend/Dockerfile`, `backend/.dockerignore`, `docker-compose.yml` (repo root)
- Delete: `backend/.env.example`

**Phase C — 2FA**
- Create: migration `…-add-two-factor-columns.js`; `two-factor-method.enum.ts`; three domain exceptions; `encryption.service.interface.ts` + `encryption.service.ts`; `totp.service.interface.ts` + `totp.service.ts`; five use cases; challenge/verify/enroll HTTP DTOs; integration spec
- Modify: `auth.entity.ts`, `auth.mapper.ts`, `auth.model.ts`, `token.service.interface.ts`, `jwt-token.service.ts`, `login.use-case.ts`, `login-response.dto.ts`, `tokens.ts`, `domain-exception.filter.ts`, `auth.controller.ts`, `users.controller.ts`, `auth.module.ts`, `users.module.ts`

---

# Phase A — Documentation cleanup

### Task 1: Delete stale planning docs

**Files:**
- Delete: `backend/TASK_ALLOCATION.md`, `backend/PROGRESS_REPORT.md`, `backend/PLAN.md`

**Interfaces:**
- Consumes: nothing
- Produces: nothing

- [ ] **Step 1: Confirm nothing outside these files references them**

Run: `cd /Users/nathnaeltefera/Code/projects/ESSS-learning-platform && grep -rn "PLAN\.md\|TASK_ALLOCATION\|PROGRESS_REPORT" --include="*.md" --include="*.ts" --include="*.json" . | grep -v node_modules`

Expected: the only hit is line 501 inside `backend/TASK_ALLOCATION.md` itself. If any *other* file references them, fix that reference in this task.

- [ ] **Step 2: Delete the three files**

```bash
cd backend
git rm TASK_ALLOCATION.md PROGRESS_REPORT.md PLAN.md
```

- [ ] **Step 3: Verify READMEs and architecture docs survived**

Run: `ls README.md docs/`
Expected: `README.md`, `docs/ARCHITECTURE_OPTIONS.md`, `docs/CLEAN_ARCHITECTURE_STRUCTURE.md` all still present.

- [ ] **Step 4: Commit**

```bash
git commit -m "docs: remove stale planning documents"
```

---

# Phase B — Configuration and containerization

### Task 2: Migrate configuration to `.env.dev`

**Files:**
- Modify: `backend/src/app.module.ts`, `backend/src/infrastructure/database/config/database.config.js`, `backend/src/infrastructure/config/env/env.validation.ts`, `backend/package.json`, `backend/.gitignore`
- Create: `backend/.env.dev.example`
- Delete: `backend/.env.example`

**Interfaces:**
- Consumes: nothing
- Produces: `TOTP_ENCRYPTION_KEY` available via `ConfigService.get<string>('TOTP_ENCRYPTION_KEY')`, consumed by Task 6.

- [ ] **Step 1: Declare `dotenv` explicitly**

It is currently used only transitively via `@nestjs/config`. In `backend/package.json`, add to `dependencies` (keep alphabetical position near `class-validator`):

```json
    "dotenv": "^16.4.5",
```

- [ ] **Step 2: Point NestJS at `.env.dev`**

In `backend/src/app.module.ts`, change the single line:

```typescript
      envFilePath: '.env.dev',
```

NestJS does not let env-file values override existing `process.env`, so Azure app settings continue to take precedence with no extra code.

- [ ] **Step 3: Make sequelize-cli load the same file**

`database.config.js` currently reads `process.env` but loads no env file at all, so `npm run db:migrate` has only ever worked with shell-exported vars. Add as the first lines of `backend/src/infrastructure/database/config/database.config.js`:

```javascript
require('dotenv').config({ path: require('path').resolve(process.cwd(), '.env.dev') });
```

- [ ] **Step 4: Ignore `.env.dev`**

`.env.dev` is NOT matched by the existing patterns. Append to `backend/.gitignore` under the env section:

```
.env.dev
```

- [ ] **Step 5: Prove the ignore actually works**

Run:
```bash
cd backend && touch .env.dev && git check-ignore -v .env.dev && rm .env.dev
```
Expected: prints a `.gitignore:<line>:.env.dev` match. If it prints nothing, the pattern is wrong — fix before continuing.

- [ ] **Step 6: Create the committed template**

Create `backend/.env.dev.example`:

```bash
# Database — Azure Database for PostgreSQL
DB_HOST=your-server.postgres.database.azure.com
DB_PORT=5432
DB_USERNAME=esss_admin
DB_PASSWORD=
DB_DATABASE=esss_learning

# JWT
JWT_SECRET=
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=
REFRESH_TOKEN_EXPIRES_IN=7d

# Two-factor authentication
# 32-byte key, base64 encoded. Generate with:
#   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
TOTP_ENCRYPTION_KEY=

# Application
PORT=3000
NODE_ENV=development
CORS_ORIGIN=*

# Email — Google Apps Script (preferred)
GOOGLE_SCRIPT_URL=
FRONTEND_URL=http://localhost:3001

# Email — SMTP fallback. With neither configured, OTPs are logged to
# console (development only — invisible inside a container).
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=

# Optional integrations
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=
SUPABASE_URL=
SUPABASE_KEY=
```

- [ ] **Step 7: Delete the superseded template**

```bash
cd backend && git rm .env.example
```

- [ ] **Step 8: Require the new key in env validation**

In `backend/src/infrastructure/config/env/env.validation.ts`, add to the `EnvironmentVariables` class after `REFRESH_TOKEN_EXPIRES_IN`:

```typescript
  @IsString()
  @IsNotEmpty()
  TOTP_ENCRYPTION_KEY: string;
```

- [ ] **Step 9: Install and verify**

```bash
cd backend && npm install
./node_modules/.bin/tsc --noEmit -p tsconfig.json && npm run build && npx jest --silent
```
Expected: all pass.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "chore: read configuration from .env.dev"
```

---

### Task 3: Containerize the backend and add a local dev database

**Files:**
- Create: `backend/Dockerfile`, `backend/.dockerignore`, `docker-compose.yml` (repo root)

**Interfaces:**
- Consumes: `.env.dev` from Task 2
- Produces: nothing consumed by later tasks

- [ ] **Step 1: Create `backend/.dockerignore`**

`.env*` matters most — without it a built image would carry real Azure credentials.

```
node_modules
dist
coverage
.git
.gitignore
.env
.env.*
!.env.dev.example
*.md
test
.vscode
```

- [ ] **Step 2: Create `backend/Dockerfile`**

Both stages use the same Debian base on purpose: `bcrypt` is a native module, and a musl/glibc mismatch fails at **runtime**, not build time.

```dockerfile
# syntax=docker/dockerfile:1

# ---- build ----
FROM node:20.18-bookworm-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY tsconfig*.json nest-cli.json ./
COPY src ./src
RUN npm run build

# ---- runtime ----
FROM node:20.18-bookworm-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=build /app/dist ./dist
COPY .sequelizerc ./
COPY src/infrastructure/database/migrations ./src/infrastructure/database/migrations
COPY src/infrastructure/database/seeders ./src/infrastructure/database/seeders

USER node
EXPOSE 3000
CMD ["node", "dist/main"]
```

- [ ] **Step 3: Create `docker-compose.yml` at the repository root**

The backend service overrides `DB_HOST` so compose uses the local container while `.env.dev` keeps the Azure host. Production Postgres is Azure-managed and is never containerized.

```yaml
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: localdev
      POSTGRES_DB: esss_learning
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d esss_learning"]
      interval: 5s
      timeout: 5s
      retries: 10

  backend:
    build:
      context: ./backend
    env_file:
      - ./backend/.env.dev
    environment:
      DB_HOST: db
      DB_PORT: "5432"
      DB_USERNAME: postgres
      DB_PASSWORD: localdev
      DB_DATABASE: esss_learning
      NODE_ENV: development
    ports:
      - "3000:3000"
    depends_on:
      db:
        condition: service_healthy

volumes:
  pgdata:
```

- [ ] **Step 4: Verify the image builds**

Run: `docker --version`

If Docker is available:
```bash
cd backend && docker build -t esss-backend:dev .
```
Expected: build succeeds.

If Docker is NOT available, say so explicitly in your report rather than claiming the Dockerfile works. Then at minimum verify the app still compiles: `npm run build`.

- [ ] **Step 5: Commit**

```bash
git add backend/Dockerfile backend/.dockerignore docker-compose.yml
git commit -m "feat: containerize backend with local postgres for development"
```

---

# Phase C — Admin two-factor authentication

### Task 4: Two-factor schema — migration, entity, mapper

**Files:**
- Create: `backend/src/infrastructure/database/migrations/20260817000100-add-two-factor-columns.js`
- Modify: `backend/src/infrastructure/database/entities/auth.entity.ts`, `backend/src/infrastructure/database/mappers/auth.mapper.ts`, `backend/src/core/domain/models/auth/auth.model.ts` (props + getters only)

**Interfaces:**
- Consumes: nothing
- Produces: `AuthProps` gains `totpSecret?: string`, `totpEnabledAt?: Date`, `totpLastUsedStep?: number`, `loginOtpCode?: string`, `loginOtpExpiresAt?: Date`, `loginOtpAttemptCount: number`, `loginOtpRequestCount: number`, `loginOtpLastSentAt?: Date`, each with a matching getter. Task 5 adds behaviour on top of these.

- [ ] **Step 1: Create the migration**

```javascript
'use strict';

/**
 * Two-factor state for admin login.
 *
 * The login_otp_* columns deliberately mirror the registration otp_* columns
 * rather than sharing them: send-verification-otp rejects fully-registered
 * accounts and markEmailVerified clears the registration fields, so one shared
 * slot would let the two flows clobber each other and share a rate limit.
 */
const COLUMNS = {
  totp_secret: { type: 'TEXT', allowNull: true },
  totp_enabled_at: { type: 'DATE', allowNull: true },
  totp_last_used_step: { type: 'BIGINT', allowNull: true },
  login_otp_code: { type: 'TEXT', allowNull: true },
  login_otp_expires_at: { type: 'DATE', allowNull: true },
  login_otp_attempt_count: { type: 'INTEGER', allowNull: false, defaultValue: 0 },
  login_otp_request_count: { type: 'INTEGER', allowNull: false, defaultValue: 0 },
  login_otp_last_sent_at: { type: 'DATE', allowNull: true },
};

module.exports = {
  async up(queryInterface, Sequelize) {
    for (const [name, spec] of Object.entries(COLUMNS)) {
      await queryInterface.addColumn('auth', name, {
        ...spec,
        type: Sequelize[spec.type],
      });
    }
  },

  async down(queryInterface) {
    for (const name of Object.keys(COLUMNS).reverse()) {
      await queryInterface.removeColumn('auth', name);
    }
  },
};
```

- [ ] **Step 2: Add the columns to `auth.entity.ts`**

Append inside the `AuthEntity` class, matching the existing `@Column` style:

```typescript
  @Column({ type: DataType.TEXT, allowNull: true, field: 'totp_secret' })
  totpSecret: string;

  @Column({ type: DataType.DATE, allowNull: true, field: 'totp_enabled_at' })
  totpEnabledAt: Date;

  @Column({ type: DataType.BIGINT, allowNull: true, field: 'totp_last_used_step' })
  totpLastUsedStep: number;

  @Column({ type: DataType.TEXT, allowNull: true, field: 'login_otp_code' })
  loginOtpCode: string;

  @Column({ type: DataType.DATE, allowNull: true, field: 'login_otp_expires_at' })
  loginOtpExpiresAt: Date;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'login_otp_attempt_count',
  })
  loginOtpAttemptCount: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'login_otp_request_count',
  })
  loginOtpRequestCount: number;

  @Column({ type: DataType.DATE, allowNull: true, field: 'login_otp_last_sent_at' })
  loginOtpLastSentAt: Date;
```

- [ ] **Step 3: Add props and getters to `auth.model.ts`**

Add to the `AuthProps` interface:

```typescript
  totpSecret?: string;
  totpEnabledAt?: Date;
  totpLastUsedStep?: number;
  loginOtpCode?: string;
  loginOtpExpiresAt?: Date;
  loginOtpAttemptCount: number;
  loginOtpRequestCount: number;
  loginOtpLastSentAt?: Date;
```

`loginOtpAttemptCount` and `loginOtpRequestCount` are required, matching how `otpAttemptCount` / `otpRequestCount` are declared. Add matching getters in the same style as the existing ones, e.g.:

```typescript
  get totpSecret(): string | undefined {
    return this.props.totpSecret;
  }

  get totpEnabledAt(): Date | undefined {
    return this.props.totpEnabledAt;
  }

  get totpLastUsedStep(): number | undefined {
    return this.props.totpLastUsedStep;
  }

  get loginOtpCode(): string | undefined {
    return this.props.loginOtpCode;
  }

  get loginOtpExpiresAt(): Date | undefined {
    return this.props.loginOtpExpiresAt;
  }

  get loginOtpAttemptCount(): number {
    return this.props.loginOtpAttemptCount;
  }

  get loginOtpRequestCount(): number {
    return this.props.loginOtpRequestCount;
  }

  get loginOtpLastSentAt(): Date | undefined {
    return this.props.loginOtpLastSentAt;
  }
```

- [ ] **Step 4: Map the new fields in `auth.mapper.ts`**

In `toDomain`, add inside the `new Auth({...})` literal:

```typescript
      totpSecret: entity.totpSecret ?? undefined,
      totpEnabledAt: entity.totpEnabledAt ?? undefined,
      totpLastUsedStep:
        entity.totpLastUsedStep != null ? Number(entity.totpLastUsedStep) : undefined,
      loginOtpCode: entity.loginOtpCode ?? undefined,
      loginOtpExpiresAt: entity.loginOtpExpiresAt ?? undefined,
      loginOtpAttemptCount: entity.loginOtpAttemptCount ?? 0,
      loginOtpRequestCount: entity.loginOtpRequestCount ?? 0,
      loginOtpLastSentAt: entity.loginOtpLastSentAt ?? undefined,
```

`totpLastUsedStep` is wrapped in `Number()` because Postgres `BIGINT` comes back from Sequelize as a string.

In `toEntity`, add:

```typescript
      totpSecret: domain.totpSecret ?? null,
      totpEnabledAt: domain.totpEnabledAt ?? null,
      totpLastUsedStep: domain.totpLastUsedStep ?? null,
      loginOtpCode: domain.loginOtpCode ?? null,
      loginOtpExpiresAt: domain.loginOtpExpiresAt ?? null,
      loginOtpAttemptCount: domain.loginOtpAttemptCount,
      loginOtpRequestCount: domain.loginOtpRequestCount,
      loginOtpLastSentAt: domain.loginOtpLastSentAt ?? null,
```

- [ ] **Step 5: Fix every existing `new Auth({...})` construction site**

`loginOtpAttemptCount` and `loginOtpRequestCount` are required, so TypeScript will now error at every construction. Run:

```bash
cd backend && ./node_modules/.bin/tsc --noEmit -p tsconfig.json
```

Add `loginOtpAttemptCount: 0, loginOtpRequestCount: 0,` at each reported site (expected: `send-verification-otp.use-case.ts` and `create-user.use-case.ts`).

- [ ] **Step 6: Verify**

```bash
cd backend && ./node_modules/.bin/tsc --noEmit -p tsconfig.json && npm run build && npx jest --silent
```
Expected: all pass. Do **not** run `db:migrate` — the user runs migrations manually.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add two-factor columns to auth table"
```

---

### Task 5: `Auth` domain behaviour for two-factor

**Files:**
- Create: `backend/src/core/domain/enums/two-factor-method.enum.ts`
- Modify: `backend/src/core/domain/models/auth/auth.model.ts`, `backend/src/core/domain/enums/index.ts`
- Test: `backend/src/core/domain/models/auth/auth.model.spec.ts`

**Interfaces:**
- Consumes: props/getters from Task 4
- Produces: `TwoFactorMethod` enum (`EMAIL`, `TOTP`); on `Auth` — `activeTwoFactorMethod(): TwoFactorMethod`, `isTotpEnrollmentPending(): boolean`, `setLoginOtp(hashedOtp: string, expiresAt: Date): void`, `canAttemptLoginOtp(): boolean`, `canRequestLoginOtp(): boolean`, `incrementLoginOtpAttempts(): void`, `clearLoginOtp(): void`, `isLoginOtpExpired(): boolean`, `enrollTotp(encryptedSecret: string): void`, `confirmTotp(): void`, `disableTotp(): void`, `hasTotpStepBeenUsed(step: number): boolean`, `consumeTotpStep(step: number): void`

- [ ] **Step 1: Create the enum**

`backend/src/core/domain/enums/two-factor-method.enum.ts`:

```typescript
export enum TwoFactorMethod {
  EMAIL = 'EMAIL',
  TOTP = 'TOTP',
}
```

Export it from `backend/src/core/domain/enums/index.ts`:

```typescript
export * from './two-factor-method.enum';
```

- [ ] **Step 2: Write the failing tests**

Create `backend/src/core/domain/models/auth/auth.model.spec.ts`:

```typescript
import { Auth, AuthProps } from './auth.model';
import { TwoFactorMethod } from '../../enums/two-factor-method.enum';

const baseProps = (overrides: Partial<AuthProps> = {}): AuthProps => ({
  email: 'admin@esss.local',
  emailVerified: true,
  otpAttemptCount: 0,
  otpRequestCount: 0,
  isActive: true,
  loginOtpAttemptCount: 0,
  loginOtpRequestCount: 0,
  ...overrides,
});

describe('Auth two-factor behaviour', () => {
  it('defaults to the EMAIL factor when TOTP is not enabled', () => {
    const auth = new Auth(baseProps());
    expect(auth.activeTwoFactorMethod()).toBe(TwoFactorMethod.EMAIL);
  });

  it('uses TOTP only once enrollment is confirmed', () => {
    const auth = new Auth(baseProps());

    auth.enrollTotp('encrypted-secret');
    expect(auth.isTotpEnrollmentPending()).toBe(true);
    expect(auth.activeTwoFactorMethod()).toBe(TwoFactorMethod.EMAIL);

    auth.confirmTotp();
    expect(auth.isTotpEnrollmentPending()).toBe(false);
    expect(auth.activeTwoFactorMethod()).toBe(TwoFactorMethod.TOTP);
  });

  it('reverts to EMAIL when TOTP is disabled', () => {
    const auth = new Auth(baseProps());
    auth.enrollTotp('encrypted-secret');
    auth.confirmTotp();

    auth.disableTotp();

    expect(auth.activeTwoFactorMethod()).toBe(TwoFactorMethod.EMAIL);
    expect(auth.totpSecret).toBeUndefined();
    expect(auth.totpLastUsedStep).toBeUndefined();
  });

  it('rejects a TOTP step at or below the last consumed step', () => {
    const auth = new Auth(baseProps());
    auth.consumeTotpStep(100);

    expect(auth.hasTotpStepBeenUsed(99)).toBe(true);
    expect(auth.hasTotpStepBeenUsed(100)).toBe(true);
    expect(auth.hasTotpStepBeenUsed(101)).toBe(false);
  });

  it('allows login OTP attempts until the fifth failure', () => {
    const auth = new Auth(baseProps());
    auth.setLoginOtp('hash', new Date(Date.now() + 60_000));

    for (let i = 0; i < 4; i += 1) {
      expect(auth.canAttemptLoginOtp()).toBe(true);
      auth.incrementLoginOtpAttempts();
    }

    expect(auth.canAttemptLoginOtp()).toBe(false);
  });

  it('treats an expired login OTP as unusable', () => {
    const auth = new Auth(baseProps());
    auth.setLoginOtp('hash', new Date(Date.now() - 1_000));

    expect(auth.isLoginOtpExpired()).toBe(true);
    expect(auth.canAttemptLoginOtp()).toBe(false);
  });

  it('rate limits to three login OTP requests per hour', () => {
    const auth = new Auth(baseProps());
    const later = () => new Date(Date.now() + 600_000);

    auth.setLoginOtp('a', later());
    auth.setLoginOtp('b', later());
    auth.setLoginOtp('c', later());

    expect(auth.canRequestLoginOtp()).toBe(false);
  });

  it('clears login OTP state', () => {
    const auth = new Auth(baseProps());
    auth.setLoginOtp('hash', new Date(Date.now() + 60_000));

    auth.clearLoginOtp();

    expect(auth.loginOtpCode).toBeUndefined();
    expect(auth.loginOtpAttemptCount).toBe(0);
    expect(auth.canAttemptLoginOtp()).toBe(false);
  });

  it('keeps registration OTP state independent of login OTP state', () => {
    const auth = new Auth(baseProps({ otpCode: 'registration-hash' }));

    auth.setLoginOtp('login-hash', new Date(Date.now() + 60_000));
    auth.clearLoginOtp();

    expect(auth.otpCode).toBe('registration-hash');
  });
});
```

- [ ] **Step 3: Run the tests to verify they fail**

Run: `cd backend && npx jest src/core/domain/models/auth/auth.model.spec.ts`
Expected: FAIL — `auth.activeTwoFactorMethod is not a function`.

- [ ] **Step 4: Implement the methods**

Add to the `Auth` class in `auth.model.ts`. Import the enum at the top (`import { TwoFactorMethod } from '../../enums/two-factor-method.enum';` — a domain-internal import, so the no-framework rule still holds).

```typescript
  activeTwoFactorMethod(): TwoFactorMethod {
    return this.props.totpEnabledAt != null ? TwoFactorMethod.TOTP : TwoFactorMethod.EMAIL;
  }

  isTotpEnrollmentPending(): boolean {
    return this.props.totpSecret != null && this.props.totpEnabledAt == null;
  }

  enrollTotp(encryptedSecret: string): void {
    this.props.totpSecret = encryptedSecret;
    this.props.totpEnabledAt = undefined;
    this.props.totpLastUsedStep = undefined;
  }

  confirmTotp(): void {
    this.props.totpEnabledAt = new Date();
  }

  disableTotp(): void {
    this.props.totpSecret = undefined;
    this.props.totpEnabledAt = undefined;
    this.props.totpLastUsedStep = undefined;
  }

  hasTotpStepBeenUsed(step: number): boolean {
    if (this.props.totpLastUsedStep == null) return false;
    return step <= this.props.totpLastUsedStep;
  }

  consumeTotpStep(step: number): void {
    this.props.totpLastUsedStep = step;
  }

  isLoginOtpExpired(): boolean {
    if (!this.props.loginOtpExpiresAt) return true;
    return new Date() > this.props.loginOtpExpiresAt;
  }

  canAttemptLoginOtp(): boolean {
    return (
      this.props.loginOtpAttemptCount < 5 &&
      !this.isLoginOtpExpired() &&
      this.props.loginOtpCode != null
    );
  }

  canRequestLoginOtp(): boolean {
    if (this.props.loginOtpRequestCount < 3) return true;
    if (!this.props.loginOtpLastSentAt) return true;
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    return this.props.loginOtpLastSentAt < oneHourAgo;
  }

  incrementLoginOtpAttempts(): void {
    this.props.loginOtpAttemptCount += 1;
  }

  setLoginOtp(hashedOtp: string, expiresAt: Date): void {
    this.props.loginOtpCode = hashedOtp;
    this.props.loginOtpExpiresAt = expiresAt;
    this.props.loginOtpAttemptCount = 0;

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    if (!this.props.loginOtpLastSentAt || this.props.loginOtpLastSentAt < oneHourAgo) {
      this.props.loginOtpRequestCount = 1;
    } else {
      this.props.loginOtpRequestCount += 1;
    }
    this.props.loginOtpLastSentAt = new Date();
  }

  clearLoginOtp(): void {
    this.props.loginOtpCode = undefined;
    this.props.loginOtpExpiresAt = undefined;
    this.props.loginOtpAttemptCount = 0;
  }
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `cd backend && npx jest src/core/domain/models/auth/auth.model.spec.ts`
Expected: 9 passing.

- [ ] **Step 6: Confirm the domain layer stayed framework-free**

Run: `cd backend && grep -rn "@nestjs\|sequelize\|class-validator" src/core/domain/`
Expected: no output.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add two-factor behaviour to Auth domain model"
```

---

### Task 6: Encryption service for TOTP secrets at rest

**Files:**
- Create: `backend/src/core/application/ports/output/encryption.service.interface.ts`, `backend/src/infrastructure/security/services/encryption.service.ts`, `backend/src/infrastructure/security/services/encryption.service.spec.ts`
- Modify: `backend/src/core/application/ports/output/index.ts`, `backend/src/core/application/ports/tokens.ts`

**Interfaces:**
- Consumes: `TOTP_ENCRYPTION_KEY` from Task 2
- Produces: `ENCRYPTION_SERVICE` DI token; `EncryptionServiceInterface { encrypt(plainText: string): string; decrypt(cipherText: string): string; }`; class `AesEncryptionService`

- [ ] **Step 1: Define the port and DI token**

`backend/src/core/application/ports/output/encryption.service.interface.ts`:

```typescript
export interface EncryptionServiceInterface {
  encrypt(plainText: string): string;
  decrypt(cipherText: string): string;
}
```

Add to `backend/src/core/application/ports/output/index.ts`:

```typescript
export * from './encryption.service.interface';
```

Add to `backend/src/core/application/ports/tokens.ts`:

```typescript
export const ENCRYPTION_SERVICE = 'ENCRYPTION_SERVICE';
export const TOTP_SERVICE = 'TOTP_SERVICE';
```

(`TOTP_SERVICE` is declared here so Task 7 does not have to reopen this file.)

- [ ] **Step 2: Write the failing test**

`backend/src/infrastructure/security/services/encryption.service.spec.ts`:

```typescript
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';
import { AesEncryptionService } from './encryption.service';

const configWithKey = (key: string) =>
  ({ get: () => key }) as unknown as ConfigService;

describe('AesEncryptionService', () => {
  const key = randomBytes(32).toString('base64');

  it('round-trips a secret', () => {
    const service = new AesEncryptionService(configWithKey(key));
    const cipher = service.encrypt('JBSWY3DPEHPK3PXP');

    expect(cipher).not.toContain('JBSWY3DPEHPK3PXP');
    expect(service.decrypt(cipher)).toBe('JBSWY3DPEHPK3PXP');
  });

  it('produces a different ciphertext each time', () => {
    const service = new AesEncryptionService(configWithKey(key));

    expect(service.encrypt('same')).not.toBe(service.encrypt('same'));
  });

  it('rejects a tampered ciphertext rather than returning garbage', () => {
    const service = new AesEncryptionService(configWithKey(key));
    const cipher = service.encrypt('JBSWY3DPEHPK3PXP');
    const tampered = `${cipher.slice(0, -2)}00`;

    expect(() => service.decrypt(tampered)).toThrow();
  });

  it('refuses to start with a key that is not 32 bytes', () => {
    expect(() => new AesEncryptionService(configWithKey('dG9vLXNob3J0'))).toThrow(
      /32 bytes/,
    );
  });
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `cd backend && npx jest src/infrastructure/security/services/encryption.service.spec.ts`
Expected: FAIL — cannot find module `./encryption.service`.

- [ ] **Step 4: Implement the service**

`backend/src/infrastructure/security/services/encryption.service.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import { EncryptionServiceInterface } from '../../../core/application/ports/output/encryption.service.interface';

/**
 * AES-256-GCM encryption for secrets that must survive a database leak in
 * unusable form — currently TOTP seeds, which would otherwise let an attacker
 * mint valid codes indefinitely.
 *
 * Format: base64(iv).base64(authTag).base64(ciphertext)
 */
@Injectable()
export class AesEncryptionService implements EncryptionServiceInterface {
  private static readonly ALGORITHM = 'aes-256-gcm';
  private static readonly IV_BYTES = 12;

  private readonly key: Buffer;

  constructor(private readonly configService: ConfigService) {
    const configured = this.configService.get<string>('TOTP_ENCRYPTION_KEY') ?? '';
    const key = Buffer.from(configured, 'base64');

    if (key.length !== 32) {
      throw new Error(
        'TOTP_ENCRYPTION_KEY must decode to exactly 32 bytes. Generate one with: ' +
          'node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'base64\'))"',
      );
    }

    this.key = key;
  }

  encrypt(plainText: string): string {
    const iv = randomBytes(AesEncryptionService.IV_BYTES);
    const cipher = createCipheriv(AesEncryptionService.ALGORITHM, this.key, iv);
    const encrypted = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);

    return [
      iv.toString('base64'),
      cipher.getAuthTag().toString('base64'),
      encrypted.toString('base64'),
    ].join('.');
  }

  decrypt(cipherText: string): string {
    const [ivPart, tagPart, dataPart] = cipherText.split('.');

    if (!ivPart || !tagPart || !dataPart) {
      throw new Error('Malformed ciphertext');
    }

    const decipher = createDecipheriv(
      AesEncryptionService.ALGORITHM,
      this.key,
      Buffer.from(ivPart, 'base64'),
    );
    decipher.setAuthTag(Buffer.from(tagPart, 'base64'));

    return Buffer.concat([
      decipher.update(Buffer.from(dataPart, 'base64')),
      decipher.final(),
    ]).toString('utf8');
  }
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `cd backend && npx jest src/infrastructure/security/services/encryption.service.spec.ts`
Expected: 4 passing.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add AES-256-GCM encryption service for TOTP secrets"
```

---

### Task 7: TOTP service

**Files:**
- Create: `backend/src/core/application/ports/output/totp.service.interface.ts`, `backend/src/infrastructure/security/services/totp.service.ts`, `backend/src/infrastructure/security/services/totp.service.spec.ts`
- Modify: `backend/src/core/application/ports/output/index.ts`, `backend/package.json`

**Interfaces:**
- Consumes: `TOTP_SERVICE` token from Task 6
- Produces: `TotpServiceInterface { generateSecret(): string; buildOtpauthUri(secret: string, email: string): string; verify(secret: string, code: string): number | null; }` — `verify` returns the consumed time-step on success, `null` on failure. Class `OtplibTotpService`.

- [ ] **Step 1: Add the dependency**

In `backend/package.json` `dependencies`:

```json
    "otplib": "^12.0.1",
```

Then: `cd backend && npm install`

- [ ] **Step 2: Define the port**

`backend/src/core/application/ports/output/totp.service.interface.ts`:

```typescript
export interface TotpServiceInterface {
  generateSecret(): string;
  buildOtpauthUri(secret: string, email: string): string;
  /** Returns the consumed 30-second time-step, or null when the code is invalid. */
  verify(secret: string, code: string): number | null;
}
```

Add to `backend/src/core/application/ports/output/index.ts`:

```typescript
export * from './totp.service.interface';
```

- [ ] **Step 3: Write the failing test**

`backend/src/infrastructure/security/services/totp.service.spec.ts`:

```typescript
import { authenticator } from 'otplib';
import { OtplibTotpService } from './totp.service';

describe('OtplibTotpService', () => {
  const service = new OtplibTotpService();

  it('accepts a freshly generated code and reports its time-step', () => {
    const secret = service.generateSecret();
    const code = authenticator.generate(secret);

    const step = service.verify(secret, code);

    expect(step).toBe(Math.floor(Date.now() / 1000 / 30));
  });

  it('rejects an incorrect code', () => {
    const secret = service.generateSecret();

    expect(service.verify(secret, '000000')).toBeNull();
  });

  it('builds an otpauth URI carrying the issuer and account', () => {
    const uri = service.buildOtpauthUri('JBSWY3DPEHPK3PXP', 'admin@esss.local');

    expect(uri).toMatch(/^otpauth:\/\/totp\//);
    expect(uri).toContain('admin%40esss.local');
    expect(uri).toContain('secret=JBSWY3DPEHPK3PXP');
  });

  it('generates a distinct secret each call', () => {
    expect(service.generateSecret()).not.toBe(service.generateSecret());
  });
});
```

- [ ] **Step 4: Run the test to verify it fails**

Run: `cd backend && npx jest src/infrastructure/security/services/totp.service.spec.ts`
Expected: FAIL — cannot find module `./totp.service`.

- [ ] **Step 5: Implement the service**

`backend/src/infrastructure/security/services/totp.service.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { authenticator } from 'otplib';
import { TotpServiceInterface } from '../../../core/application/ports/output/totp.service.interface';

/**
 * TOTP with a +/-1 step tolerance for clock skew. `verify` returns the time-step
 * a code belongs to so the caller can record it and reject a replay of the same
 * code inside its own 30-second window.
 */
@Injectable()
export class OtplibTotpService implements TotpServiceInterface {
  private static readonly STEP_SECONDS = 30;
  private static readonly ISSUER = 'ESSS Learning';

  constructor() {
    authenticator.options = {
      step: OtplibTotpService.STEP_SECONDS,
      window: 1,
    };
  }

  generateSecret(): string {
    return authenticator.generateSecret();
  }

  buildOtpauthUri(secret: string, email: string): string {
    return authenticator.keyuri(email, OtplibTotpService.ISSUER, secret);
  }

  verify(secret: string, code: string): number | null {
    if (!authenticator.check(code, secret)) {
      return null;
    }

    const currentStep = Math.floor(Date.now() / 1000 / OtplibTotpService.STEP_SECONDS);

    // window:1 means the accepted code may belong to the previous, current, or
    // next step. Identify which, so the caller records the right one. otplib
    // has no per-call epoch argument — it is set through options, so save and
    // restore it around the probe.
    const originalEpoch = authenticator.options.epoch;
    try {
      for (const candidate of [currentStep, currentStep - 1, currentStep + 1]) {
        authenticator.options = {
          ...authenticator.options,
          epoch: candidate * OtplibTotpService.STEP_SECONDS * 1000,
        };
        if (authenticator.generate(secret) === code) {
          return candidate;
        }
      }
    } finally {
      authenticator.options = { ...authenticator.options, epoch: originalEpoch };
    }

    return currentStep;
  }
}
```

- [ ] **Step 6: Run the test to verify it passes**

Run: `cd backend && npx jest src/infrastructure/security/services/totp.service.spec.ts`
Expected: 4 passing.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add TOTP service with replay-aware verification"
```

---

### Task 8: Two-factor domain exceptions and status mapping

**Files:**
- Create: `backend/src/core/domain/exceptions/invalid-two-factor-code.exception.ts`, `backend/src/core/domain/exceptions/two-factor-challenge-invalid.exception.ts`, `backend/src/core/domain/exceptions/two-factor-not-enrolled.exception.ts`
- Modify: `backend/src/core/domain/exceptions/index.ts`, `backend/src/presentation/http/fillters/domain-exception.filter.ts`

**Interfaces:**
- Consumes: nothing
- Produces: `InvalidTwoFactorCodeException` (→ 401), `TwoFactorChallengeInvalidException` (→ 401), `TwoFactorNotEnrolledException` (→ 400)

- [ ] **Step 1: Create the three exceptions**

```typescript
// invalid-two-factor-code.exception.ts
import { DomainException } from './domain.exception';

export class InvalidTwoFactorCodeException extends DomainException {
  constructor() {
    super('Invalid or expired verification code');
  }
}
```

```typescript
// two-factor-challenge-invalid.exception.ts
import { DomainException } from './domain.exception';

export class TwoFactorChallengeInvalidException extends DomainException {
  constructor() {
    super('Two-factor challenge is invalid or has expired. Please log in again.');
  }
}
```

```typescript
// two-factor-not-enrolled.exception.ts
import { DomainException } from './domain.exception';

export class TwoFactorNotEnrolledException extends DomainException {
  constructor() {
    super('No pending authenticator enrollment for this account');
  }
}
```

Add all three to `backend/src/core/domain/exceptions/index.ts`.

- [ ] **Step 2: Map them to status codes**

In `backend/src/presentation/http/fillters/domain-exception.filter.ts`, import the three classes and add to `STATUS_BY_EXCEPTION`:

```typescript
    [InvalidTwoFactorCodeException, HttpStatus.UNAUTHORIZED],
    [TwoFactorChallengeInvalidException, HttpStatus.UNAUTHORIZED],
    [TwoFactorNotEnrolledException, HttpStatus.BAD_REQUEST],
```

- [ ] **Step 3: Verify**

```bash
cd backend && ./node_modules/.bin/tsc --noEmit -p tsconfig.json && npx jest --silent
```
Expected: all pass.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add two-factor domain exceptions and status mapping"
```

---

### Task 9: Challenge token support on the token service

**Files:**
- Modify: `backend/src/core/application/ports/output/token.service.interface.ts`, `backend/src/infrastructure/security/services/jwt-token.service.ts`
- Test: `backend/src/infrastructure/security/services/jwt-token.service.spec.ts` (create)

**Interfaces:**
- Consumes: `TwoFactorMethod` from Task 5
- Produces: on `TokenServiceInterface` — `generateTwoFactorChallengeToken(payload: { authId: string; method: string }): string` and `verifyTwoFactorChallengeToken(token: string): { authId: string; method: string }`

- [ ] **Step 1: Extend the port**

Add to `TokenServiceInterface` in `token.service.interface.ts`:

```typescript
  generateTwoFactorChallengeToken(payload: TwoFactorChallengePayload): string;
  verifyTwoFactorChallengeToken(token: string): TwoFactorChallengePayload;
```

and above the interface:

```typescript
export interface TwoFactorChallengePayload {
  authId: string;
  method: string;
}
```

- [ ] **Step 2: Write the failing test**

`backend/src/infrastructure/security/services/jwt-token.service.spec.ts`:

```typescript
import { ConfigService } from '@nestjs/config';
import { JwtTokenService } from './jwt-token.service';

const config = {
  get: (key: string) =>
    ({
      JWT_SECRET: 'access-secret',
      JWT_EXPIRES_IN: '15m',
      REFRESH_TOKEN_SECRET: 'refresh-secret',
      REFRESH_TOKEN_EXPIRES_IN: '7d',
    })[key],
} as unknown as ConfigService;

describe('JwtTokenService two-factor challenge tokens', () => {
  const service = new JwtTokenService(config);

  it('round-trips a challenge payload', () => {
    const token = service.generateTwoFactorChallengeToken({
      authId: 'auth-1',
      method: 'EMAIL',
    });

    expect(service.verifyTwoFactorChallengeToken(token)).toMatchObject({
      authId: 'auth-1',
      method: 'EMAIL',
    });
  });

  it('refuses a token issued for a different purpose', () => {
    const verification = service.generateVerificationToken({ email: 'a@b.co' });

    expect(() => service.verifyTwoFactorChallengeToken(verification)).toThrow();
  });

  it('refuses an access token as a challenge', () => {
    const access = service.generateAccessToken({
      userId: 'u-1',
      email: 'a@b.co',
      role: 'ADMIN',
    });

    expect(() => service.verifyTwoFactorChallengeToken(access)).toThrow();
  });
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `cd backend && npx jest src/infrastructure/security/services/jwt-token.service.spec.ts`
Expected: FAIL — `generateTwoFactorChallengeToken is not a function`.

- [ ] **Step 4: Implement**

Add to `JwtTokenService` in `jwt-token.service.ts`, following the existing `generateVerificationToken` pattern:

```typescript
  generateTwoFactorChallengeToken(payload: TwoFactorChallengePayload): string {
    return jwt.sign(
      { authId: payload.authId, method: payload.method, purpose: '2fa-challenge' },
      this.accessTokenSecret,
      { expiresIn: '5m' },
    );
  }

  verifyTwoFactorChallengeToken(token: string): TwoFactorChallengePayload {
    const decoded = jwt.verify(token, this.accessTokenSecret) as jwt.JwtPayload;

    if (decoded.purpose !== '2fa-challenge') {
      throw new Error('Invalid two-factor challenge token');
    }

    return { authId: decoded.authId, method: decoded.method };
  }
```

Import `TwoFactorChallengePayload` alongside the existing `TokenPayload` import.

- [ ] **Step 5: Run the test to verify it passes**

Run: `cd backend && npx jest src/infrastructure/security/services/jwt-token.service.spec.ts`
Expected: 3 passing.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add two-factor challenge tokens to JwtTokenService"
```

---

### Task 10: Login issues a challenge for admins

**Files:**
- Modify: `backend/src/core/application/use-cases/auth/login.use-case.ts`, `backend/src/core/application/dto/auth/login-response.dto.ts`
- Create: `backend/src/core/application/use-cases/auth/two-factor-challenge.helper.ts`
- Test: `backend/src/core/application/use-cases/auth/login.use-case.spec.ts`

**Interfaces:**
- Consumes: Tasks 5, 6, 7, 9
- Produces: `LoginResult = LoginResponseDto | TwoFactorChallengeDto`; `TwoFactorChallengeDto { twoFactorRequired: true; method: string; challengeToken: string; expiresAt: Date }`; exported helper `issueTwoFactorChallenge(deps, auth)` reused by Task 11's resend use case.

- [ ] **Step 1: Add the challenge DTO**

Append to `backend/src/core/application/dto/auth/login-response.dto.ts`:

```typescript
export class TwoFactorChallengeDto {
  twoFactorRequired: true;
  method: string;
  challengeToken: string;
  expiresAt: Date;
}

export type LoginResult = LoginResponseDto | TwoFactorChallengeDto;
```

- [ ] **Step 2: Create the shared challenge helper**

`backend/src/core/application/use-cases/auth/two-factor-challenge.helper.ts` — shared so login and resend cannot drift apart:

```typescript
import { randomInt } from 'crypto';
import { Auth } from '../../../domain/models/auth/auth.model';
import { TwoFactorMethod } from '../../../domain/enums/two-factor-method.enum';
import { OtpRateLimitException } from '../../../domain/exceptions/otp-rate-limit.exception';
import { AuthRepositoryInterface } from '../../../domain/repositories/auth.repository.interface';
import { EmailServiceInterface } from '../../ports/output/email.service.interface';
import { HashServiceInterface } from '../../ports/output/hash.service.interface';
import { TokenServiceInterface } from '../../ports/output/token.service.interface';
import { TwoFactorChallengeDto } from '../../dto/auth/login-response.dto';

export const LOGIN_OTP_TTL_MS = 10 * 60 * 1000;

export interface TwoFactorChallengeDeps {
  authRepository: AuthRepositoryInterface;
  hashService: HashServiceInterface;
  tokenService: TokenServiceInterface;
  emailService: EmailServiceInterface;
}

/**
 * Issues a two-factor challenge. For the EMAIL factor this also generates,
 * stores, and sends a fresh OTP. Never returns access or refresh tokens.
 */
export async function issueTwoFactorChallenge(
  deps: TwoFactorChallengeDeps,
  auth: Auth,
): Promise<TwoFactorChallengeDto> {
  const method = auth.activeTwoFactorMethod();
  const expiresAt = new Date(Date.now() + LOGIN_OTP_TTL_MS);

  if (method === TwoFactorMethod.EMAIL) {
    if (!auth.canRequestLoginOtp()) {
      throw new OtpRateLimitException();
    }

    const otpCode = randomInt(100000, 1000000).toString();
    auth.setLoginOtp(await deps.hashService.hash(otpCode), expiresAt);
    await deps.authRepository.update(auth.id!, auth);
    await deps.emailService.sendOtp(auth.email, otpCode);
  }

  return {
    twoFactorRequired: true,
    method,
    challengeToken: deps.tokenService.generateTwoFactorChallengeToken({
      authId: auth.id!,
      method,
    }),
    expiresAt,
  };
}
```

- [ ] **Step 3: Write the failing test**

`backend/src/core/application/use-cases/auth/login.use-case.spec.ts`:

```typescript
import { LoginUseCase } from './login.use-case';
import { Auth } from '../../../domain/models/auth/auth.model';
import { User } from '../../../domain/models/user/user.model';
import { UserRole } from '../../../domain/enums/user-role.enum';

const makeAuth = () =>
  new Auth({
    id: 'auth-1',
    email: 'admin@esss.local',
    password: 'hashed',
    emailVerified: true,
    otpAttemptCount: 0,
    otpRequestCount: 0,
    isActive: true,
    loginOtpAttemptCount: 0,
    loginOtpRequestCount: 0,
  });

const makeUser = (role: UserRole) =>
  new User({ id: 'user-1', authId: 'auth-1', firstName: 'A', lastName: 'B', role });

const build = (role: UserRole) => {
  const auth = makeAuth();
  const authRepository = {
    findByEmail: jest.fn().mockResolvedValue(auth),
    update: jest.fn().mockResolvedValue(auth),
  };
  const userRepository = { findByAuthId: jest.fn().mockResolvedValue(makeUser(role)) };
  const refreshTokenRepository = { create: jest.fn().mockResolvedValue({}) };
  const deviceTokenRepository = { create: jest.fn() };
  const hashService = {
    compare: jest.fn().mockResolvedValue(true),
    hash: jest.fn().mockResolvedValue('hashed-otp'),
  };
  const tokenService = {
    generateAccessToken: jest.fn().mockReturnValue('access'),
    generateRefreshToken: jest.fn().mockReturnValue('refresh'),
    generateTwoFactorChallengeToken: jest.fn().mockReturnValue('challenge'),
  };
  const emailService = { sendOtp: jest.fn().mockResolvedValue(undefined) };

  const useCase = new LoginUseCase(
    authRepository as never,
    userRepository as never,
    refreshTokenRepository as never,
    deviceTokenRepository as never,
    hashService as never,
    tokenService as never,
    emailService as never,
  );

  return { useCase, tokenService, emailService };
};

describe('LoginUseCase two-factor branch', () => {
  it('returns a challenge and no tokens for an admin', async () => {
    const { useCase, emailService } = build(UserRole.ADMIN);

    const result: never = (await useCase.execute({
      email: 'admin@esss.local',
      password: 'pw',
    })) as never;

    expect(result).toMatchObject({ twoFactorRequired: true, method: 'EMAIL' });
    expect(result).not.toHaveProperty('accessToken');
    expect(emailService.sendOtp).toHaveBeenCalledTimes(1);
  });

  it('returns a challenge for a super admin', async () => {
    const { useCase } = build(UserRole.SUPER_ADMIN);

    const result = await useCase.execute({ email: 'a@b.co', password: 'pw' });

    expect(result).toMatchObject({ twoFactorRequired: true });
  });

  it('returns tokens directly for a student', async () => {
    const { useCase, emailService } = build(UserRole.STUDENT);

    const result = await useCase.execute({ email: 'a@b.co', password: 'pw' });

    expect(result).toMatchObject({ accessToken: 'access', refreshToken: 'refresh' });
    expect(emailService.sendOtp).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 4: Run the test to verify it fails**

Run: `cd backend && npx jest src/core/application/use-cases/auth/login.use-case.spec.ts`
Expected: FAIL — the admin case returns tokens.

- [ ] **Step 5: Implement the branch**

In `login.use-case.ts`: add `@Inject(EMAIL_SERVICE) private readonly emailService: EmailServiceInterface` as the **last** constructor parameter (matching the test's argument order), change the return type to `Promise<LoginResult>`, and insert immediately after the existing `const user = await this.userRepository.findByAuthId(auth.id!)` null check:

```typescript
    const requiresTwoFactor =
      user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN;

    if (requiresTwoFactor) {
      // Admins receive a challenge, never tokens. Device registration is
      // deferred to POST /auth/2fa/verify, where tokens are actually issued.
      return issueTwoFactorChallenge(
        {
          authRepository: this.authRepository,
          hashService: this.hashService,
          tokenService: this.tokenService,
          emailService: this.emailService,
        },
        auth,
      );
    }
```

Leave everything below it unchanged — non-admin login keeps its existing device-token and refresh-token behaviour.

- [ ] **Step 6: Run the test to verify it passes**

Run: `cd backend && npx jest src/core/application/use-cases/auth/login.use-case.spec.ts`
Expected: 3 passing.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: issue a two-factor challenge instead of tokens for admin login"
```

---

### Task 11: Verify and resend use cases

**Files:**
- Create: `backend/src/core/application/use-cases/auth/verify-two-factor.use-case.ts`, `backend/src/core/application/use-cases/auth/resend-two-factor-otp.use-case.ts`, `backend/src/core/application/use-cases/auth/verify-two-factor.use-case.spec.ts`
- Modify: `backend/src/core/application/use-cases/auth/index.ts`

**Interfaces:**
- Consumes: Tasks 5–10
- Produces: `VerifyTwoFactorUseCase.execute(dto: { challengeToken: string; code: string; deviceToken?: string; deviceName?: string; deviceType?: string }): Promise<LoginResponseDto>`; `ResendTwoFactorOtpUseCase.execute(dto: { challengeToken: string }): Promise<{ message: string; expiresAt: Date }>`

- [ ] **Step 1: Write the failing test**

`backend/src/core/application/use-cases/auth/verify-two-factor.use-case.spec.ts`:

```typescript
import { VerifyTwoFactorUseCase } from './verify-two-factor.use-case';
import { Auth } from '../../../domain/models/auth/auth.model';
import { User } from '../../../domain/models/user/user.model';
import { UserRole } from '../../../domain/enums/user-role.enum';
import { InvalidTwoFactorCodeException } from '../../../domain/exceptions/invalid-two-factor-code.exception';

const build = (compareResult: boolean) => {
  const auth = new Auth({
    id: 'auth-1',
    email: 'admin@esss.local',
    password: 'hashed',
    emailVerified: true,
    otpAttemptCount: 0,
    otpRequestCount: 0,
    isActive: true,
    loginOtpAttemptCount: 0,
    loginOtpRequestCount: 0,
  });
  auth.setLoginOtp('hashed-otp', new Date(Date.now() + 60_000));

  const authRepository = {
    findById: jest.fn().mockResolvedValue(auth),
    update: jest.fn().mockResolvedValue(auth),
  };
  const userRepository = {
    findByAuthId: jest.fn().mockResolvedValue(
      new User({
        id: 'user-1',
        authId: 'auth-1',
        firstName: 'A',
        lastName: 'B',
        role: UserRole.ADMIN,
      }),
    ),
  };

  const useCase = new VerifyTwoFactorUseCase(
    authRepository as never,
    userRepository as never,
    { create: jest.fn().mockResolvedValue({}) } as never,
    { create: jest.fn().mockResolvedValue({ id: 'dev-1' }) } as never,
    { compare: jest.fn().mockResolvedValue(compareResult) } as never,
    {
      verifyTwoFactorChallengeToken: jest
        .fn()
        .mockReturnValue({ authId: 'auth-1', method: 'EMAIL' }),
      generateAccessToken: jest.fn().mockReturnValue('access'),
      generateRefreshToken: jest.fn().mockReturnValue('refresh'),
    } as never,
    { verify: jest.fn() } as never,
    { decrypt: jest.fn() } as never,
  );

  return { useCase, auth };
};

describe('VerifyTwoFactorUseCase', () => {
  it('issues tokens for a correct email OTP', async () => {
    const { useCase } = build(true);

    const result = await useCase.execute({ challengeToken: 't', code: '123456' });

    expect(result).toMatchObject({ accessToken: 'access', refreshToken: 'refresh' });
  });

  it('clears the OTP so the challenge cannot be reused', async () => {
    const { useCase, auth } = build(true);

    await useCase.execute({ challengeToken: 't', code: '123456' });

    expect(auth.loginOtpCode).toBeUndefined();
  });

  it('rejects an incorrect code', async () => {
    const { useCase } = build(false);

    await expect(
      useCase.execute({ challengeToken: 't', code: '000000' }),
    ).rejects.toBeInstanceOf(InvalidTwoFactorCodeException);
  });

  it('counts a failed attempt', async () => {
    const { useCase, auth } = build(false);

    await expect(
      useCase.execute({ challengeToken: 't', code: '000000' }),
    ).rejects.toThrow();

    expect(auth.loginOtpAttemptCount).toBe(1);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd backend && npx jest src/core/application/use-cases/auth/verify-two-factor.use-case.spec.ts`
Expected: FAIL — cannot find module.

- [ ] **Step 3: Implement `VerifyTwoFactorUseCase`**

`backend/src/core/application/use-cases/auth/verify-two-factor.use-case.ts`. Constructor parameter order must be: authRepository, userRepository, refreshTokenRepository, deviceTokenRepository, hashService, tokenService, totpService, encryptionService — matching the test.

```typescript
import { Inject, Injectable } from '@nestjs/common';
import { TwoFactorMethod } from '../../../domain/enums/two-factor-method.enum';
import { Auth } from '../../../domain/models/auth/auth.model';
import { DeviceToken } from '../../../domain/models/auth/device-token.model';
import { RefreshToken } from '../../../domain/models/auth/refresh-token.model';
import { InvalidTwoFactorCodeException } from '../../../domain/exceptions/invalid-two-factor-code.exception';
import { TwoFactorChallengeInvalidException } from '../../../domain/exceptions/two-factor-challenge-invalid.exception';
import { AuthRepositoryInterface } from '../../../domain/repositories/auth.repository.interface';
import { DeviceTokenRepositoryInterface } from '../../../domain/repositories/device-token.repository.interface';
import { RefreshTokenRepositoryInterface } from '../../../domain/repositories/refresh-token.repository.interface';
import { UserRepositoryInterface } from '../../../domain/repositories/user.repository.interface';
import { LoginResponseDto } from '../../dto/auth/login-response.dto';
import { EncryptionServiceInterface } from '../../ports/output/encryption.service.interface';
import { HashServiceInterface } from '../../ports/output/hash.service.interface';
import { TokenServiceInterface } from '../../ports/output/token.service.interface';
import { TotpServiceInterface } from '../../ports/output/totp.service.interface';
import {
  AUTH_REPOSITORY,
  DEVICE_TOKEN_REPOSITORY,
  ENCRYPTION_SERVICE,
  HASH_SERVICE,
  REFRESH_TOKEN_REPOSITORY,
  TOKEN_SERVICE,
  TOTP_SERVICE,
  USER_REPOSITORY,
} from '../../ports/tokens';

export interface VerifyTwoFactorRequestDto {
  challengeToken: string;
  code: string;
  deviceToken?: string;
  deviceName?: string;
  deviceType?: string;
}

const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

@Injectable()
export class VerifyTwoFactorUseCase {
  constructor(
    @Inject(AUTH_REPOSITORY) private readonly authRepository: AuthRepositoryInterface,
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepositoryInterface,
    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly refreshTokenRepository: RefreshTokenRepositoryInterface,
    @Inject(DEVICE_TOKEN_REPOSITORY)
    private readonly deviceTokenRepository: DeviceTokenRepositoryInterface,
    @Inject(HASH_SERVICE) private readonly hashService: HashServiceInterface,
    @Inject(TOKEN_SERVICE) private readonly tokenService: TokenServiceInterface,
    @Inject(TOTP_SERVICE) private readonly totpService: TotpServiceInterface,
    @Inject(ENCRYPTION_SERVICE)
    private readonly encryptionService: EncryptionServiceInterface,
  ) {}

  async execute(dto: VerifyTwoFactorRequestDto): Promise<LoginResponseDto> {
    let payload: { authId: string; method: string };
    try {
      payload = this.tokenService.verifyTwoFactorChallengeToken(dto.challengeToken);
    } catch {
      throw new TwoFactorChallengeInvalidException();
    }

    const auth = await this.authRepository.findById(payload.authId);
    if (!auth || !auth.isActive) {
      throw new TwoFactorChallengeInvalidException();
    }

    if (auth.activeTwoFactorMethod() === TwoFactorMethod.TOTP) {
      await this.verifyTotp(auth, dto.code);
    } else {
      await this.verifyEmailOtp(auth, dto.code);
    }

    const user = await this.userRepository.findByAuthId(auth.id!);
    if (!user) {
      throw new TwoFactorChallengeInvalidException();
    }

    let deviceTokenId: string | undefined;
    if (dto.deviceToken) {
      const savedDevice = await this.deviceTokenRepository.create(
        new DeviceToken({
          userId: user.id!,
          firebaseToken: dto.deviceToken,
          deviceName: dto.deviceName,
          deviceType: dto.deviceType,
          isActive: true,
        }),
      );
      deviceTokenId = savedDevice.id;
    }

    const tokenPayload = { userId: user.id!, email: auth.email, role: user.role };
    const accessToken = this.tokenService.generateAccessToken(tokenPayload);
    const refreshTokenString = this.tokenService.generateRefreshToken(tokenPayload);

    await this.refreshTokenRepository.create(
      new RefreshToken({
        userId: user.id!,
        token: refreshTokenString,
        deviceTokenId,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
        isRevoked: false,
      }),
    );

    return {
      accessToken,
      refreshToken: refreshTokenString,
      user: {
        id: user.id!,
        email: auth.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }

  private async verifyEmailOtp(auth: Auth, code: string): Promise<void> {
    if (!auth.canAttemptLoginOtp()) {
      auth.clearLoginOtp();
      await this.authRepository.update(auth.id!, auth);
      throw new InvalidTwoFactorCodeException();
    }

    const matches = await this.hashService.compare(code, auth.loginOtpCode!);

    if (!matches) {
      auth.incrementLoginOtpAttempts();
      // The fifth failure clears the OTP, killing the challenge entirely.
      if (!auth.canAttemptLoginOtp()) {
        auth.clearLoginOtp();
      }
      await this.authRepository.update(auth.id!, auth);
      throw new InvalidTwoFactorCodeException();
    }

    auth.clearLoginOtp();
    await this.authRepository.update(auth.id!, auth);
  }

  private async verifyTotp(auth: Auth, code: string): Promise<void> {
    const secret = this.encryptionService.decrypt(auth.totpSecret!);
    const step = this.totpService.verify(secret, code);

    if (step === null || auth.hasTotpStepBeenUsed(step)) {
      throw new InvalidTwoFactorCodeException();
    }

    auth.consumeTotpStep(step);
    await this.authRepository.update(auth.id!, auth);
  }
}
```

- [ ] **Step 4: Implement `ResendTwoFactorOtpUseCase`**

`backend/src/core/application/use-cases/auth/resend-two-factor-otp.use-case.ts`:

```typescript
import { Inject, Injectable } from '@nestjs/common';
import { TwoFactorMethod } from '../../../domain/enums/two-factor-method.enum';
import { TwoFactorChallengeInvalidException } from '../../../domain/exceptions/two-factor-challenge-invalid.exception';
import { AuthRepositoryInterface } from '../../../domain/repositories/auth.repository.interface';
import { EmailServiceInterface } from '../../ports/output/email.service.interface';
import { HashServiceInterface } from '../../ports/output/hash.service.interface';
import { TokenServiceInterface } from '../../ports/output/token.service.interface';
import {
  AUTH_REPOSITORY,
  EMAIL_SERVICE,
  HASH_SERVICE,
  TOKEN_SERVICE,
} from '../../ports/tokens';
import { issueTwoFactorChallenge } from './two-factor-challenge.helper';

@Injectable()
export class ResendTwoFactorOtpUseCase {
  constructor(
    @Inject(AUTH_REPOSITORY) private readonly authRepository: AuthRepositoryInterface,
    @Inject(HASH_SERVICE) private readonly hashService: HashServiceInterface,
    @Inject(TOKEN_SERVICE) private readonly tokenService: TokenServiceInterface,
    @Inject(EMAIL_SERVICE) private readonly emailService: EmailServiceInterface,
  ) {}

  async execute(dto: { challengeToken: string }): Promise<{
    message: string;
    expiresAt: Date;
  }> {
    let payload: { authId: string; method: string };
    try {
      payload = this.tokenService.verifyTwoFactorChallengeToken(dto.challengeToken);
    } catch {
      throw new TwoFactorChallengeInvalidException();
    }

    const auth = await this.authRepository.findById(payload.authId);
    if (!auth || !auth.isActive) {
      throw new TwoFactorChallengeInvalidException();
    }

    if (auth.activeTwoFactorMethod() !== TwoFactorMethod.EMAIL) {
      // Nothing to resend for an authenticator app.
      throw new TwoFactorChallengeInvalidException();
    }

    const challenge = await issueTwoFactorChallenge(
      {
        authRepository: this.authRepository,
        hashService: this.hashService,
        tokenService: this.tokenService,
        emailService: this.emailService,
      },
      auth,
    );

    return { message: 'Verification code sent.', expiresAt: challenge.expiresAt };
  }
}
```

Export both from `backend/src/core/application/use-cases/auth/index.ts`.

- [ ] **Step 5: Run the tests to verify they pass**

Run: `cd backend && npx jest src/core/application/use-cases/auth/`
Expected: all pass.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add two-factor verify and resend use cases"
```

---

### Task 12: TOTP enrollment, confirmation, and disable

**Files:**
- Create: `backend/src/core/application/use-cases/auth/enroll-totp.use-case.ts`, `confirm-totp.use-case.ts`, `disable-totp.use-case.ts`, `enroll-totp.use-case.spec.ts`
- Modify: `backend/src/core/application/use-cases/auth/index.ts`

**Interfaces:**
- Consumes: Tasks 5, 6, 7, 8
- Produces: `EnrollTotpUseCase.execute(authId: string): Promise<{ otpauthUri: string; secret: string }>`; `ConfirmTotpUseCase.execute(authId: string, code: string): Promise<{ message: string }>`; `DisableTotpUseCase.execute(authId: string, code: string): Promise<{ message: string }>`

- [ ] **Step 1: Write the failing test**

`backend/src/core/application/use-cases/auth/enroll-totp.use-case.spec.ts`:

```typescript
import { EnrollTotpUseCase } from './enroll-totp.use-case';
import { ConfirmTotpUseCase } from './confirm-totp.use-case';
import { Auth } from '../../../domain/models/auth/auth.model';
import { TwoFactorMethod } from '../../../domain/enums/two-factor-method.enum';
import { InvalidTwoFactorCodeException } from '../../../domain/exceptions/invalid-two-factor-code.exception';

const makeAuth = () =>
  new Auth({
    id: 'auth-1',
    email: 'admin@esss.local',
    password: 'hashed',
    emailVerified: true,
    otpAttemptCount: 0,
    otpRequestCount: 0,
    isActive: true,
    loginOtpAttemptCount: 0,
    loginOtpRequestCount: 0,
  });

describe('TOTP enrollment', () => {
  it('stores an encrypted secret without activating TOTP', async () => {
    const auth = makeAuth();
    const repo = {
      findById: jest.fn().mockResolvedValue(auth),
      update: jest.fn().mockResolvedValue(auth),
    };
    const useCase = new EnrollTotpUseCase(
      repo as never,
      { generateSecret: () => 'SECRET', buildOtpauthUri: () => 'otpauth://x' } as never,
      { encrypt: (v: string) => `enc(${v})` } as never,
    );

    const result = await useCase.execute('auth-1');

    expect(result).toEqual({ otpauthUri: 'otpauth://x', secret: 'SECRET' });
    expect(auth.totpSecret).toBe('enc(SECRET)');
    expect(auth.isTotpEnrollmentPending()).toBe(true);
    expect(auth.activeTwoFactorMethod()).toBe(TwoFactorMethod.EMAIL);
  });

  it('activates TOTP only after a valid code confirms enrollment', async () => {
    const auth = makeAuth();
    auth.enrollTotp('enc(SECRET)');
    const repo = {
      findById: jest.fn().mockResolvedValue(auth),
      update: jest.fn().mockResolvedValue(auth),
    };
    const useCase = new ConfirmTotpUseCase(
      repo as never,
      { verify: () => 42 } as never,
      { decrypt: () => 'SECRET' } as never,
    );

    await useCase.execute('auth-1', '123456');

    expect(auth.activeTwoFactorMethod()).toBe(TwoFactorMethod.TOTP);
  });

  it('rejects confirmation with a bad code', async () => {
    const auth = makeAuth();
    auth.enrollTotp('enc(SECRET)');
    const repo = {
      findById: jest.fn().mockResolvedValue(auth),
      update: jest.fn(),
    };
    const useCase = new ConfirmTotpUseCase(
      repo as never,
      { verify: () => null } as never,
      { decrypt: () => 'SECRET' } as never,
    );

    await expect(useCase.execute('auth-1', '000000')).rejects.toBeInstanceOf(
      InvalidTwoFactorCodeException,
    );
    expect(auth.activeTwoFactorMethod()).toBe(TwoFactorMethod.EMAIL);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd backend && npx jest src/core/application/use-cases/auth/enroll-totp.use-case.spec.ts`
Expected: FAIL — cannot find module.

- [ ] **Step 3: Implement the three use cases**

`enroll-totp.use-case.ts` (constructor order: authRepository, totpService, encryptionService):

```typescript
import { Inject, Injectable } from '@nestjs/common';
import { UserNotFoundException } from '../../../domain/exceptions/user-not-found.exception';
import { AuthRepositoryInterface } from '../../../domain/repositories/auth.repository.interface';
import { EncryptionServiceInterface } from '../../ports/output/encryption.service.interface';
import { TotpServiceInterface } from '../../ports/output/totp.service.interface';
import { AUTH_REPOSITORY, ENCRYPTION_SERVICE, TOTP_SERVICE } from '../../ports/tokens';

@Injectable()
export class EnrollTotpUseCase {
  constructor(
    @Inject(AUTH_REPOSITORY) private readonly authRepository: AuthRepositoryInterface,
    @Inject(TOTP_SERVICE) private readonly totpService: TotpServiceInterface,
    @Inject(ENCRYPTION_SERVICE)
    private readonly encryptionService: EncryptionServiceInterface,
  ) {}

  async execute(authId: string): Promise<{ otpauthUri: string; secret: string }> {
    const auth = await this.authRepository.findById(authId);
    if (!auth) {
      throw new UserNotFoundException(authId);
    }

    const secret = this.totpService.generateSecret();

    // Stored but NOT activated. A mis-scanned QR must not lock the admin out,
    // so email OTP keeps governing login until confirmTotp succeeds.
    auth.enrollTotp(this.encryptionService.encrypt(secret));
    await this.authRepository.update(auth.id!, auth);

    return {
      otpauthUri: this.totpService.buildOtpauthUri(secret, auth.email),
      secret,
    };
  }
}
```

`confirm-totp.use-case.ts` (constructor order: authRepository, totpService, encryptionService):

```typescript
import { Inject, Injectable } from '@nestjs/common';
import { InvalidTwoFactorCodeException } from '../../../domain/exceptions/invalid-two-factor-code.exception';
import { TwoFactorNotEnrolledException } from '../../../domain/exceptions/two-factor-not-enrolled.exception';
import { UserNotFoundException } from '../../../domain/exceptions/user-not-found.exception';
import { AuthRepositoryInterface } from '../../../domain/repositories/auth.repository.interface';
import { EncryptionServiceInterface } from '../../ports/output/encryption.service.interface';
import { TotpServiceInterface } from '../../ports/output/totp.service.interface';
import { AUTH_REPOSITORY, ENCRYPTION_SERVICE, TOTP_SERVICE } from '../../ports/tokens';

@Injectable()
export class ConfirmTotpUseCase {
  constructor(
    @Inject(AUTH_REPOSITORY) private readonly authRepository: AuthRepositoryInterface,
    @Inject(TOTP_SERVICE) private readonly totpService: TotpServiceInterface,
    @Inject(ENCRYPTION_SERVICE)
    private readonly encryptionService: EncryptionServiceInterface,
  ) {}

  async execute(authId: string, code: string): Promise<{ message: string }> {
    const auth = await this.authRepository.findById(authId);
    if (!auth) {
      throw new UserNotFoundException(authId);
    }
    if (!auth.totpSecret) {
      throw new TwoFactorNotEnrolledException();
    }

    const step = this.totpService.verify(this.encryptionService.decrypt(auth.totpSecret), code);
    if (step === null) {
      throw new InvalidTwoFactorCodeException();
    }

    auth.confirmTotp();
    auth.consumeTotpStep(step);
    await this.authRepository.update(auth.id!, auth);

    return { message: 'Authenticator app enabled.' };
  }
}
```

`disable-totp.use-case.ts` — same constructor order; requires a valid code so a hijacked session cannot silently downgrade the factor:

```typescript
import { Inject, Injectable } from '@nestjs/common';
import { InvalidTwoFactorCodeException } from '../../../domain/exceptions/invalid-two-factor-code.exception';
import { TwoFactorNotEnrolledException } from '../../../domain/exceptions/two-factor-not-enrolled.exception';
import { UserNotFoundException } from '../../../domain/exceptions/user-not-found.exception';
import { AuthRepositoryInterface } from '../../../domain/repositories/auth.repository.interface';
import { EncryptionServiceInterface } from '../../ports/output/encryption.service.interface';
import { TotpServiceInterface } from '../../ports/output/totp.service.interface';
import { AUTH_REPOSITORY, ENCRYPTION_SERVICE, TOTP_SERVICE } from '../../ports/tokens';

@Injectable()
export class DisableTotpUseCase {
  constructor(
    @Inject(AUTH_REPOSITORY) private readonly authRepository: AuthRepositoryInterface,
    @Inject(TOTP_SERVICE) private readonly totpService: TotpServiceInterface,
    @Inject(ENCRYPTION_SERVICE)
    private readonly encryptionService: EncryptionServiceInterface,
  ) {}

  async execute(authId: string, code: string): Promise<{ message: string }> {
    const auth = await this.authRepository.findById(authId);
    if (!auth) {
      throw new UserNotFoundException(authId);
    }
    if (!auth.totpSecret) {
      throw new TwoFactorNotEnrolledException();
    }

    const step = this.totpService.verify(this.encryptionService.decrypt(auth.totpSecret), code);
    if (step === null) {
      throw new InvalidTwoFactorCodeException();
    }

    auth.disableTotp();
    await this.authRepository.update(auth.id!, auth);

    return { message: 'Authenticator app disabled. Email codes will be used instead.' };
  }
}
```

Export all three from the auth use-case `index.ts`.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `cd backend && npx jest src/core/application/use-cases/auth/enroll-totp.use-case.spec.ts`
Expected: 3 passing.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add TOTP enrollment, confirmation, and disable use cases"
```

---

### Task 13: SUPER_ADMIN two-factor reset

**Files:**
- Create: `backend/src/core/application/use-cases/users/reset-two-factor.use-case.ts`, `reset-two-factor.use-case.spec.ts`
- Modify: `backend/src/core/application/use-cases/users/index.ts`

**Interfaces:**
- Consumes: Tasks 5, 8
- Produces: `ResetTwoFactorUseCase.execute(userId: string): Promise<{ message: string }>` — takes a `users.id` and resolves auth via `user.authId`

- [ ] **Step 1: Write the failing test**

`backend/src/core/application/use-cases/users/reset-two-factor.use-case.spec.ts`:

```typescript
import { ResetTwoFactorUseCase } from './reset-two-factor.use-case';
import { Auth } from '../../../domain/models/auth/auth.model';
import { User } from '../../../domain/models/user/user.model';
import { UserRole } from '../../../domain/enums/user-role.enum';
import { TwoFactorMethod } from '../../../domain/enums/two-factor-method.enum';
import { UserNotFoundException } from '../../../domain/exceptions/user-not-found.exception';

describe('ResetTwoFactorUseCase', () => {
  const buildAuth = () => {
    const auth = new Auth({
      id: 'auth-1',
      email: 'admin@esss.local',
      emailVerified: true,
      otpAttemptCount: 0,
      otpRequestCount: 0,
      isActive: true,
      loginOtpAttemptCount: 0,
      loginOtpRequestCount: 0,
    });
    auth.enrollTotp('enc(SECRET)');
    auth.confirmTotp();
    return auth;
  };

  it('clears TOTP so the target falls back to email codes', async () => {
    const auth = buildAuth();
    const userRepository = {
      findById: jest.fn().mockResolvedValue(
        new User({
          id: 'user-1',
          authId: 'auth-1',
          firstName: 'A',
          lastName: 'B',
          role: UserRole.ADMIN,
        }),
      ),
    };
    const authRepository = {
      findById: jest.fn().mockResolvedValue(auth),
      update: jest.fn().mockResolvedValue(auth),
    };

    await new ResetTwoFactorUseCase(
      userRepository as never,
      authRepository as never,
    ).execute('user-1');

    expect(auth.activeTwoFactorMethod()).toBe(TwoFactorMethod.EMAIL);
    expect(auth.totpSecret).toBeUndefined();
  });

  it('throws when the user does not exist', async () => {
    const useCase = new ResetTwoFactorUseCase(
      { findById: jest.fn().mockResolvedValue(null) } as never,
      { findById: jest.fn(), update: jest.fn() } as never,
    );

    await expect(useCase.execute('nope')).rejects.toBeInstanceOf(UserNotFoundException);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd backend && npx jest src/core/application/use-cases/users/reset-two-factor.use-case.spec.ts`
Expected: FAIL — cannot find module.

- [ ] **Step 3: Implement**

```typescript
import { Inject, Injectable } from '@nestjs/common';
import { UserNotFoundException } from '../../../domain/exceptions/user-not-found.exception';
import { AuthRepositoryInterface } from '../../../domain/repositories/auth.repository.interface';
import { UserRepositoryInterface } from '../../../domain/repositories/user.repository.interface';
import { AUTH_REPOSITORY, USER_REPOSITORY } from '../../ports/tokens';

/**
 * Clears a user's authenticator enrollment, returning them to email codes.
 * The only recovery path for a lost TOTP device, so it is restricted to
 * SUPER_ADMIN at the controller. At least two SUPER_ADMIN accounts must exist,
 * or a single locked-out one cannot be recovered.
 */
@Injectable()
export class ResetTwoFactorUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepositoryInterface,
    @Inject(AUTH_REPOSITORY) private readonly authRepository: AuthRepositoryInterface,
  ) {}

  async execute(userId: string): Promise<{ message: string }> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundException(userId);
    }

    const auth = await this.authRepository.findById(user.authId);
    if (!auth) {
      throw new UserNotFoundException(userId);
    }

    auth.disableTotp();
    auth.clearLoginOtp();
    await this.authRepository.update(auth.id!, auth);

    return { message: 'Two-factor authentication reset. Email codes will be used.' };
  }
}
```

Export from the users use-case `index.ts`.

- [ ] **Step 4: Run the test to verify it passes**

Run: `cd backend && npx jest src/core/application/use-cases/users/reset-two-factor.use-case.spec.ts`
Expected: 2 passing.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add SUPER_ADMIN two-factor reset use case"
```

---

### Task 14: HTTP layer and module wiring

**Files:**
- Create: `backend/src/presentation/http/dto/auth/verify-two-factor.dto.ts`, `resend-two-factor.dto.ts`, `totp-code.dto.ts`
- Modify: `backend/src/presentation/http/controllers/auth/auth.controller.ts`, `backend/src/presentation/http/controllers/users/users.controller.ts`, `backend/src/modules/auth/auth.module.ts`, `backend/src/modules/users/users.module.ts`, `backend/src/presentation/http/dto/auth/index.ts`

**Interfaces:**
- Consumes: Tasks 10–13
- Produces: the six endpoints from spec §5

- [ ] **Step 1: Create the HTTP DTOs**

`verify-two-factor.dto.ts`:

```typescript
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class VerifyTwoFactorDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  challengeToken: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @Length(6, 6)
  code: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  deviceToken?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  deviceName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  deviceType?: string;
}
```

`resend-two-factor.dto.ts`:

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ResendTwoFactorDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  challengeToken: string;
}
```

`totp-code.dto.ts`:

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class TotpCodeDto {
  @ApiProperty({ example: '123456' })
  @IsString()
  @Length(6, 6)
  code: string;
}
```

Export all three from `backend/src/presentation/http/dto/auth/index.ts`.

- [ ] **Step 2: Add the auth endpoints**

In `auth.controller.ts`, add these constructor parameters alongside the existing use cases:

```typescript
    private readonly verifyTwoFactorUseCase: VerifyTwoFactorUseCase,
    private readonly resendTwoFactorOtpUseCase: ResendTwoFactorOtpUseCase,
    private readonly enrollTotpUseCase: EnrollTotpUseCase,
    private readonly confirmTotpUseCase: ConfirmTotpUseCase,
    private readonly disableTotpUseCase: DisableTotpUseCase,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryInterface,
```

`USER_REPOSITORY` is needed because the JWT carries a `users.id` while the TOTP use cases take an `auth.id`. Add the imports for `Inject`, `USER_REPOSITORY`, `UserRepositoryInterface`, and `UserNotFoundException`.

Then add the handlers:

```typescript
  @Public()
  @Post('2fa/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Exchange a two-factor challenge for access tokens' })
  @ApiResponse({ status: 200, description: 'Tokens issued' })
  @ApiResponse({ status: 401, description: 'Invalid code or expired challenge' })
  async verifyTwoFactor(@Body() body: VerifyTwoFactorDto) {
    return this.verifyTwoFactorUseCase.execute(body);
  }

  @Public()
  @Post('2fa/resend')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resend the email two-factor code' })
  @ApiResponse({ status: 200, description: 'Code re-sent' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  async resendTwoFactor(@Body() body: ResendTwoFactorDto) {
    return this.resendTwoFactorOtpUseCase.execute(body);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('2fa/totp/enroll')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Begin authenticator app enrollment' })
  async enrollTotp(@CurrentUser() user: { userId: string }) {
    return this.enrollTotpUseCase.execute(await this.resolveAuthId(user.userId));
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('2fa/totp/confirm')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Confirm and activate authenticator app enrollment' })
  async confirmTotp(
    @CurrentUser() user: { userId: string },
    @Body() body: TotpCodeDto,
  ) {
    return this.confirmTotpUseCase.execute(await this.resolveAuthId(user.userId), body.code);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete('2fa/totp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Disable the authenticator app and revert to email codes' })
  async disableTotp(
    @CurrentUser() user: { userId: string },
    @Body() body: TotpCodeDto,
  ) {
    return this.disableTotpUseCase.execute(await this.resolveAuthId(user.userId), body.code);
  }
```

The JWT carries `userId` (a `users.id`), not `authId`, so add a private helper and inject `USER_REPOSITORY`:

```typescript
  private async resolveAuthId(userId: string): Promise<string> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundException(userId);
    }
    return user.authId;
  }
```

Add `Delete` to the `@nestjs/common` import list.

- [ ] **Step 3: Add the reset endpoint**

In `users.controller.ts`, inject `ResetTwoFactorUseCase` and add. The method-level `@Roles` overrides the class-level one via `getAllAndOverride`:

```typescript
  @Post(':id/2fa/reset')
  @Roles(UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset a user two-factor enrollment (SUPER_ADMIN only)' })
  @ApiParam({ name: 'id', description: 'User ID (UUID)' })
  async resetTwoFactor(@Param('id') id: string) {
    return this.resetTwoFactorUseCase.execute(id);
  }
```

- [ ] **Step 4: Wire the modules**

In `auth.module.ts`, add to `providers`: `VerifyTwoFactorUseCase`, `ResendTwoFactorOtpUseCase`, `EnrollTotpUseCase`, `ConfirmTotpUseCase`, `DisableTotpUseCase`, plus:

```typescript
    { provide: ENCRYPTION_SERVICE, useClass: AesEncryptionService },
    { provide: TOTP_SERVICE, useClass: OtplibTotpService },
```

In `users.module.ts`, add `ResetTwoFactorUseCase` to `providers` and `exports`.

- [ ] **Step 5: Verify the whole app still resolves**

```bash
cd backend && ./node_modules/.bin/tsc --noEmit -p tsconfig.json && npm run build && npx jest --silent
```
Expected: all pass.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: expose two-factor endpoints and wire modules"
```

---

### Task 15: End-to-end integration tests

**Files:**
- Create: `backend/test/two-factor.e2e-spec.ts`

**Interfaces:**
- Consumes: everything
- Produces: nothing

This is the task that catches what unit tests and code review miss. The `AllExceptionsFilter` defect — every error returning 500 — survived two static reviews and was found only by running the app.

- [ ] **Step 1: Write the integration spec**

`backend/test/two-factor.e2e-spec.ts`. It boots the real `AppModule` with Sequelize models faked, so no database is required.

```typescript
import { Global, Module, ValidationPipe } from '@nestjs/common';
import { getModelToken } from '@nestjs/sequelize';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import {
  AUTH_REPOSITORY,
  DEVICE_TOKEN_REPOSITORY,
  EMAIL_SERVICE,
  ENCRYPTION_SERVICE,
  REFRESH_TOKEN_REPOSITORY,
  USER_REPOSITORY,
} from '../src/core/application/ports/tokens';
import { DatabaseModule } from '../src/infrastructure/database/database.module';
import { databaseProviders } from '../src/infrastructure/database/database.providers';
import {
  AuthEntity,
  DeviceTokenEntity,
  RefreshTokenEntity,
  UserEntity,
} from '../src/infrastructure/database/entities';
import { UserRole } from '../src/core/domain/enums/user-role.enum';

const request = require('supertest');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

process.env.JWT_SECRET = 'test-access-secret';
process.env.JWT_EXPIRES_IN = '15m';
process.env.REFRESH_TOKEN_SECRET = 'test-refresh-secret';
process.env.REFRESH_TOKEN_EXPIRES_IN = '7d';
process.env.TOTP_ENCRYPTION_KEY = require('crypto').randomBytes(32).toString('base64');
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '5432';
process.env.DB_USERNAME = 'u';
process.env.DB_PASSWORD = 'p';
process.env.DB_DATABASE = 'd';
process.env.NODE_ENV = 'test';

// One mutable auth row shared by the fake model and assertions.
let authRow: Record<string, unknown>;
let userRow: Record<string, unknown>;
// Plaintext OTP captured from the overridden email service.
let sentOtp: string;

const makeAuthModel = () => ({
  findOne: async () => authRow,
  findByPk: async () => authRow,
  create: async () => authRow,
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
  let app: any;
  let http: any;

  const buildAuthRow = () => ({
    id: 'auth-1',
    email: 'admin@esss.local',
    password: bcrypt.hashSync('Admin@123', 10),
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
    update(values: Record<string, unknown>) {
      Object.assign(this, values);
      return this;
    },
  });

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideModule(DatabaseModule)
      .useModule(FakeDatabaseModule)
      // The OTP is bcrypt-hashed before storage, so the only way to assert the
      // happy path is to capture the plaintext on its way to the mail service.
      .overrideProvider(EMAIL_SERVICE)
      .useValue({
        sendOtp: async (_email: string, code: string) => {
          sentOtp = code;
        },
      })
      .compile();

    app = moduleRef.createNestApplication();
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
    authRow = buildAuthRow();
    userRow = {
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
      update(values: Record<string, unknown>) {
        Object.assign(this, values);
        return this;
      },
    };
  });

  const login = () =>
    request(http)
      .post('/auth/login')
      .send({ email: 'admin@esss.local', password: 'Admin@123' });

  it('returns a challenge instead of tokens for an admin', async () => {
    const res = await login();

    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ twoFactorRequired: true, method: 'EMAIL' });
    expect(res.body.data.accessToken).toBeUndefined();
    expect(res.body.data.challengeToken).toEqual(expect.any(String));
  });

  it('returns tokens directly for a student', async () => {
    userRow.role = UserRole.STUDENT;

    const res = await login();

    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toEqual(expect.any(String));
    expect(res.body.data.twoFactorRequired).toBeUndefined();
  });

  it('exchanges a valid email OTP for tokens', async () => {
    const challenge = (await login()).body.data.challengeToken;

    const res = await request(http)
      .post('/auth/2fa/verify')
      .send({ challengeToken: challenge, code: sentOtp });

    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toEqual(expect.any(String));
    expect(res.body.data.refreshToken).toEqual(expect.any(String));
  });

  it('rejects a wrong code with 401', async () => {
    const challenge = (await login()).body.data.challengeToken;

    const res = await request(http)
      .post('/auth/2fa/verify')
      .send({ challengeToken: challenge, code: '000000' });

    expect(res.status).toBe(401);
  });

  it('kills the challenge after the fifth failed attempt', async () => {
    const challenge = (await login()).body.data.challengeToken;
    const correct = sentOtp;

    for (let i = 0; i < 5; i += 1) {
      await request(http)
        .post('/auth/2fa/verify')
        .send({ challengeToken: challenge, code: '000000' });
    }

    // Even the correct code must now fail — the OTP was cleared.
    const res = await request(http)
      .post('/auth/2fa/verify')
      .send({ challengeToken: challenge, code: correct });

    expect(res.status).toBe(401);
  });

  it('challenges an enrolled admin for TOTP rather than email', async () => {
    const { authenticator } = require('otplib');
    const secret = authenticator.generateSecret();
    const encrypted = app
      .get(ENCRYPTION_SERVICE, { strict: false })
      .encrypt(secret);

    authRow.totpSecret = encrypted;
    authRow.totpEnabledAt = new Date();

    const res = await login();

    expect(res.body.data.method).toBe('TOTP');
    // No email is sent for the TOTP factor.
    expect(res.body.data.challengeToken).toEqual(expect.any(String));
  });

  it('rejects a replayed TOTP code within the same step', async () => {
    const { authenticator } = require('otplib');
    const secret = authenticator.generateSecret();
    authRow.totpSecret = app.get(ENCRYPTION_SERVICE, { strict: false }).encrypt(secret);
    authRow.totpEnabledAt = new Date();

    const challenge = (await login()).body.data.challengeToken;
    const code = authenticator.generate(secret);

    const first = await request(http)
      .post('/auth/2fa/verify')
      .send({ challengeToken: challenge, code });
    expect(first.status).toBe(200);

    const replay = await request(http)
      .post('/auth/2fa/verify')
      .send({ challengeToken: challenge, code });
    expect(replay.status).toBe(401);
  });

  it('rejects a challenge token that is actually an access token', async () => {
    const forged = jwt.sign(
      { userId: 'user-1', email: 'admin@esss.local', role: 'ADMIN' },
      process.env.JWT_SECRET,
      { expiresIn: '5m' },
    );

    const res = await request(http)
      .post('/auth/2fa/verify')
      .send({ challengeToken: forged, code: '123456' });

    expect(res.status).toBe(401);
  });

  it('requires SUPER_ADMIN to reset another user two-factor', async () => {
    const adminToken = jwt.sign(
      { userId: 'user-1', email: 'admin@esss.local', role: UserRole.ADMIN },
      process.env.JWT_SECRET,
      { expiresIn: '5m' },
    );
    const superToken = jwt.sign(
      { userId: 'user-2', email: 'super@esss.local', role: UserRole.SUPER_ADMIN },
      process.env.JWT_SECRET,
      { expiresIn: '5m' },
    );

    const forbidden = await request(http)
      .post('/users/user-1/2fa/reset')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(forbidden.status).toBe(403);

    const allowed = await request(http)
      .post('/users/user-1/2fa/reset')
      .set('Authorization', `Bearer ${superToken}`);
    expect(allowed.status).toBe(200);
  });

  it('still requires authentication on user routes', async () => {
    const res = await request(http).get('/users');

    expect(res.status).toBe(401);
  });
});
```

- [ ] **Step 2: Run the suite**

Run: `cd backend && npm run test:e2e`
Expected: 10 passing. If the response envelope differs, note that `TransformInterceptor` wraps every success response as `{ success, data, message }` — assertions read `res.body.data`.

If the replay test proves flaky at a 30-second step boundary (the code can roll over mid-test), pin time with `jest.useFakeTimers().setSystemTime(...)` rather than loosening the assertion — the replay guard is a security control and must stay covered.

- [ ] **Step 3: Run the full verification set**

```bash
cd backend && ./node_modules/.bin/tsc --noEmit -p tsconfig.json && npm run build && npx jest --silent && npm run test:e2e
```
Expected: all pass.

- [ ] **Step 4: Confirm the domain layer is still framework-free**

Run: `cd backend && grep -rn "@nestjs\|sequelize\|class-validator" src/core/domain/`
Expected: no output.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "test: add end-to-end coverage for admin two-factor login"
```

---

## Post-implementation (user-run)

These require a live database and are **not** run by any implementer:

```bash
cd backend && npm run db:migrate
```

Generate and set `TOTP_ENCRYPTION_KEY` in `.env.dev`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Then confirm: at least two `SUPER_ADMIN` accounts exist (spec §8), and a real email path (`GOOGLE_SCRIPT_URL` or `SMTP_HOST`) is configured — the console fallback is invisible in a container, and admins on the EMAIL factor cannot log in without it.
