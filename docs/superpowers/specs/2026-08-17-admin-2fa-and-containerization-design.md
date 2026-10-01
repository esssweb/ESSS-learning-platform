# Admin 2FA, Containerization, and Doc Cleanup

**Date:** 2026-08-17
**Branch:** `feat/admin-2fa-and-containerization` (based on `fix/phase1-integration`)
**Status:** Implemented — see §15 for amendments made during implementation

---

## 1. Context

Three independent pieces of work, bundled into one branch at the user's request:

1. **Mandatory 2FA for admin login.** Today `POST /auth/login` verifies a password and returns tokens immediately, for every role. Admin accounts carry the ability to create users, delete users, and reassign roles, so a single leaked password is a full compromise.
2. **Remove stale planning docs.** `TASK_ALLOCATION.md`, `PROGRESS_REPORT.md`, and `PLAN.md` describe a schedule that no longer reflects reality.
3. **Containerize and move config to `.env.dev`.** Deployment target is Azure, and configuration should come from a single named file.

### Existing infrastructure this builds on

The codebase already has a working email-OTP pipeline used for registration email verification:

- 6-digit code via `crypto.randomInt`, bcrypt-hashed before storage
- 10-minute expiry, 5-attempt cap, 3-requests-per-hour rate limit
- Delivery via `GoogleScriptEmailService` or `NodemailerEmailService`, selected by env
- `generateVerificationToken` / `verifyVerificationToken` on `JwtTokenService`, a short-lived purpose-scoped JWT

**These primitives are reused. The state they live in is not.** `send-verification-otp.use-case.ts` throws `UserAlreadyExistsException` when an account is fully registered — precisely the state an admin logging in is in — and `Auth.markEmailVerified()` clears the same `otp_code` / `otp_expires_at` columns. Sharing one OTP slot between registration and login would let the two flows clobber each other and share a rate-limit budget.

---

## 2. Scope

**In scope:** mandatory 2FA for `ADMIN` and `SUPER_ADMIN` login; optional TOTP enrollment; SUPER_ADMIN-initiated 2FA reset; deletion of three planning docs; backend Dockerfile; local-dev docker-compose; migration of configuration to `.env.dev`.

**Out of scope:** 2FA for `STUDENT` / `INSTRUCTOR` (their login is unchanged); recovery codes; SMS as a factor; Azure deployment pipelines or IaC; containerizing the two frontend portals; a self-service `/users/me` profile surface.

---

## 3. Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Second factor | Email OTP default, TOTP opt-in upgrade | Email works for every admin with zero setup; TOTP available for those who want real phishing resistance. One active factor per admin. |
| Challenge state | Dedicated columns on `auth` + signed challenge token | Matches the existing `verificationToken` idiom. Avoids a new table, which in this codebase costs an entity, mapper, repository, interface, and DI token. |
| Lockout recovery | SUPER_ADMIN resets another admin's 2FA | Chosen over recovery codes for simplicity. Accepted risk documented in §8. |
| Docs to delete | Planning docs only | READMEs and `backend/docs/` describe architecture, not schedule. |
| Database container | Local dev only | Production Postgres is Azure Database for PostgreSQL (managed); nothing to containerize there. |
| `.env.dev` in git | Gitignored; `.env.dev.example` committed | Prevents Azure credentials entering git history permanently. |

---

## 4. Data model

One migration, all columns on the existing `auth` table.

| Column | Type | Null | Purpose |
|---|---|---|---|
| `totp_secret` | TEXT | yes | Base32 TOTP secret, AES-256-GCM encrypted at rest |
| `totp_enabled_at` | TIMESTAMPTZ | yes | Non-null ⇒ TOTP is the active factor. Null with a non-null secret ⇒ enrollment pending. |
| `totp_last_used_step` | BIGINT | yes | Highest consumed TOTP time-step; blocks replay inside a 30s window |
| `login_otp_code` | TEXT | yes | bcrypt hash of the login OTP |
| `login_otp_expires_at` | TIMESTAMPTZ | yes | |
| `login_otp_attempt_count` | INTEGER | no, default 0 | |
| `login_otp_request_count` | INTEGER | no, default 0 | |
| `login_otp_last_sent_at` | TIMESTAMPTZ | yes | |

The `login_otp_*` columns intentionally mirror the registration `otp_*` columns rather than sharing them. That separation is the core of this design.

Entities use `underscored: true`; the migration must create snake_case columns and the entity must declare matching `field:` names.

### `Auth` domain model additions

Pure TypeScript, no framework imports (`src/core/domain/` must stay framework-free):

- `activeTwoFactorMethod(): 'TOTP' | 'EMAIL'` — `TOTP` when `totp_enabled_at` is set, else `EMAIL`
- `isTotpEnrollmentPending(): boolean`
- `setLoginOtp(hash, expiresAt)`, `canAttemptLoginOtp()`, `canRequestLoginOtp()`, `incrementLoginOtpAttempts()`, `clearLoginOtp()`
- `enrollTotp(encryptedSecret)` — sets secret, leaves `totp_enabled_at` null
- `confirmTotp()` — sets `totp_enabled_at`
- `disableTotp()` — clears secret, enabled-at, and last-used-step
- `consumeTotpStep(step)` / `hasTotpStepBeenUsed(step)`

Mirror the naming and shape of the existing OTP methods.

---

## 5. API contract

### `POST /auth/login` — becomes a discriminated union

Still HTTP 200 in both branches.

- `STUDENT` / `INSTRUCTOR` — unchanged: `{ accessToken, refreshToken, user }`
- `ADMIN` / `SUPER_ADMIN` — `{ twoFactorRequired: true, method: 'EMAIL' | 'TOTP', challengeToken, expiresAt }`

When `method` is `EMAIL`, issuing the challenge also sends the OTP email as a side effect.

**This is a breaking change for any client calling `/auth/login` with admin credentials.** The `admin_portal` owner must be told.

### New endpoints

| Endpoint | Auth | Body | Returns |
|---|---|---|---|
| `POST /auth/2fa/verify` | public | `{ challengeToken, code, deviceToken?, deviceName?, deviceType? }` | `{ accessToken, refreshToken, user }` |
| `POST /auth/2fa/resend` | public | `{ challengeToken }` | `{ message, expiresAt }` — EMAIL method only |
| `POST /auth/2fa/totp/enroll` | admin | — | `{ otpauthUri, secret }` |
| `POST /auth/2fa/totp/confirm` | admin | `{ code }` | `{ message }` |
| `DELETE /auth/2fa/totp` | admin | `{ code }` | `{ message }` |
| `POST /users/:id/2fa/reset` | SUPER_ADMIN | — | `{ message }` |

`challengeToken` is a ~5-minute JWT carrying `purpose: '2fa-challenge'`, `authId`, and `method`, signed with the access-token secret — the same pattern `generateVerificationToken` already uses. It is issued **only after the password verifies**, so nothing here is reachable without valid credentials.

Enrollment returns the `otpauth://` URI rather than a rendered QR image; the frontend renders it. This avoids a `qrcode` dependency.

**Device registration moves to the verify step.** `POST /auth/login` currently accepts optional `deviceToken` / `deviceName` / `deviceType` and registers a device alongside token issuance. Since admins receive no tokens at the login step, those fields are ignored for admins there and accepted again on `POST /auth/2fa/verify`, which is where device registration and refresh-token persistence actually happen. Non-admin login is untouched.

**No chicken-and-egg on enrollment.** The TOTP endpoints require a normal access token. An admin obtains one by logging in with email OTP, which is always available and needs no setup, and only then enrolls TOTP.

**`POST /users/:id/2fa/reset` takes a `users.id`**, not an `auth.id`; the handler resolves the auth record via `user.authId`. It lives on `UsersController`, whose class-level `@Roles(ADMIN, SUPER_ADMIN)` is overridden at method level with `@Roles(SUPER_ADMIN)` — `getAllAndOverride` gives the handler precedence.

---

## 6. Flows

### Admin login
1. `POST /auth/login` — verify password and active status exactly as today.
2. Load the user record; if role is not `ADMIN`/`SUPER_ADMIN`, return tokens and stop.
3. Determine `activeTwoFactorMethod()`.
4. If `EMAIL`: check `canRequestLoginOtp()`, generate a 6-digit code, hash it, store via `setLoginOtp`, send the email.
5. Issue and return the challenge token. **No access or refresh token is issued.**
6. `POST /auth/2fa/verify` — validate the challenge token, load auth, verify the code by method, clear login-OTP state, then issue tokens through the existing token-issuing path (including the refresh-token record and device-token handling).

### TOTP enrollment — deliberately two-step
`enroll` stores an encrypted secret with `totp_enabled_at` null; TOTP is **not** yet active and email OTP still governs login. `confirm` requires a valid live code, proving the authenticator is correctly configured, before activating. A one-step version would lock an admin out on a mis-scanned QR.

`DELETE /auth/2fa/totp` requires a valid TOTP code so a hijacked session cannot silently downgrade the factor.

### SUPER_ADMIN reset
`POST /users/:id/2fa/reset`, guarded `@Roles(UserRole.SUPER_ADMIN)`. Clears secret, enabled-at, and last-used-step. The target reverts to email OTP, which always works.

---

## 7. Security rules

- **Login OTP:** 6-digit `crypto.randomInt`, bcrypt-hashed, 10-minute expiry, 5 attempts, 3 sends per hour — the existing constants, applied to the new columns.
- **TOTP:** 30-second step, ±1 step window for clock skew. Reject when the step is `<=` `totp_last_used_step`, blocking replay within a window.
- **Attempt exhaustion:** the 5th failure clears the login-OTP state, invalidating the challenge. The admin restarts at `/auth/login`.
- **Secret at rest:** a new `EncryptionService` (AES-256-GCM, key from `TOTP_ENCRYPTION_KEY`, 32-byte base64) behind an `EncryptionServiceInterface` port in `core/application/ports/output/`. A leaked database must not yield usable TOTP secrets.
- **No enumeration:** the challenge reveals the method only after the password verifies. Failed logins keep returning a uniform `InvalidCredentialsException`.
- New domain exceptions (`TwoFactorRequiredException`, `InvalidTwoFactorCodeException`, `TwoFactorNotEnrolledException`) extend `DomainException` and are added to `DomainExceptionFilter`'s type map. Use cases and controllers never throw `HttpException`.

### New dependencies
`otplib` (TOTP), `dotenv` (currently used transitively and undeclared).

---

## 8. Operational requirements

**Maintain at least two `SUPER_ADMIN` accounts.** Reset is the only recovery path, and a SUPER_ADMIN who loses their TOTP device needs a different SUPER_ADMIN to clear it. With only one, that account can be permanently locked out of admin access.

Email deliverability becomes a login dependency for admins on the EMAIL factor. The current fallback logs OTPs to console when neither `GOOGLE_SCRIPT_URL` nor `SMTP_HOST` is set — invisible inside an Azure container. A real mail path must be configured before admins depend on it in any deployed environment.

---

## 9. Configuration

`.env.dev` replaces `.env`, with **four** touch points:

1. `app.module.ts` — `envFilePath: '.env.dev'`. NestJS does not let env-file values override existing `process.env`, so Azure app settings take precedence automatically and the same code works locally and deployed.
2. `src/infrastructure/database/config/database.config.js` — **replace** its existing bare `require('dotenv').config()` with an explicit `require('dotenv').config({ path: '.env.dev' })`. sequelize-cli runs outside Nest, so it loads env separately; left alone it would keep reading `.env` while the app read `.env.dev`. Replacing rather than adding matters: dotenv does not override already-set keys, so keeping both calls would leave two competing sources and reintroduce the ambiguity `.env.dev` exists to remove.
3. `.gitignore` — add `.env.dev`. It is **not** currently covered by the existing `.env*` patterns. Verify with `git check-ignore -v .env.dev`.
4. `.env.dev.example` — committed, listing every variable including `TOTP_ENCRYPTION_KEY`. The existing `backend/.env.example` is **deleted**, so there is exactly one template and no ambiguity about which file is authoritative.

`env.validation.ts` gains `TOTP_ENCRYPTION_KEY` as required.

---

## 10. Containerization

**`backend/Dockerfile`** — multi-stage:
- Build stage: `node:20.18-bookworm-slim`, `npm ci`, copy source, `npm run build`
- Runtime stage: same base, `npm ci --omit=dev`, copy `dist/`, non-root user, `CMD ["node", "dist/main"]`

Both stages use the same glibc base deliberately: `bcrypt` is a native module, and a musl/glibc mismatch fails at **runtime**, not build time.

**`backend/.dockerignore`** — must include `node_modules`, `dist`, `.git`, and `.env*`, so `.env.dev` can never be baked into an image.

**`docker-compose.yml`** at repo root, build context `./backend`. Stock `postgres:16`, named volume for pgdata, healthcheck, and `depends_on: condition: service_healthy`. The backend service overrides `DB_HOST=db` via `environment:` so compose uses the local container while `.env.dev` keeps the Azure host. Local development only.

---

## 11. Documentation removal

Delete `backend/TASK_ALLOCATION.md`, `backend/PROGRESS_REPORT.md`, `backend/PLAN.md`. Keep all `README.md` files and `backend/docs/`. The only cross-reference to a deleted file lives inside `TASK_ALLOCATION.md` itself, so nothing dangles.

---

## 12. Testing

The `AllExceptionsFilter` defect — which turned every error response into a 500 — survived two static reviews and was caught only by running the application. 2FA is security-critical and the E2E suite does not exist. Testing is therefore part of this work, not a follow-up.

**Unit:** `Auth` domain 2FA methods (pure, fast); each new use case with mocked repositories; `EncryptionService` round-trip; TOTP verification including window and replay logic.

**Integration** (supertest against a compiled `AppModule` with faked Sequelize models — the harness used to verify the auth fixes, requiring no live database):

- Admin login returns a challenge, **not** tokens
- Student and instructor login are unchanged
- A valid email OTP exchanges the challenge for tokens
- A wrong code fails; the 5th failure invalidates the challenge
- A replayed TOTP code within one step is rejected
- An enrolled admin is challenged for `TOTP`, not `EMAIL`
- Enrollment does not activate TOTP until confirmed
- `POST /users/:id/2fa/reset` returns 403 for `ADMIN`, 200 for `SUPER_ADMIN`

---

## 13. Risks

| Risk | Mitigation |
|---|---|
| `/auth/login` response shape change breaks `admin_portal` | Documented as breaking; notify the frontend owner before merge |
| Sole SUPER_ADMIN loses TOTP device | Operational requirement of ≥2 SUPER_ADMINs (§8) |
| Email delivery unconfigured in Azure ⇒ admins cannot log in | Configure a real mail path before deploying; console fallback is dev-only |
| `TOTP_ENCRYPTION_KEY` lost or rotated | Existing secrets become undecryptable; affected admins need a reset. Treat the key as a durable secret in Azure config. |
| Branch is based on unmerged `fix/phase1-integration` (PR #37) | This branch cannot merge until #37 does |

---

## 14. Open question

The original request numbered its tasks 1, 3, 4 — there is no item 2. If something was intended there, it is not captured in this spec.

---

## 15. Amendments made during implementation

Per-task review found defects in this design. Each was ruled on and implemented; the code is authoritative where it differs from §4–§12 above.

| # | Change | Why |
|---|---|---|
| R1 | `JwtStrategy` rejects any bearer token carrying a `purpose` claim or lacking a user id | Challenge and email-verification tokens are signed with the access secret and previously authenticated as access tokens — a password-only token could call `/auth/logout` and revoke sessions |
| R2 | TOTP challenges share the email budget: 3 challenges/hour, 5 attempts per challenge | §7 capped email codes only; TOTP guessing was unlimited for anyone holding the password |
| R3 | Disabling TOTP respects the 5-attempt cap | A hijacked session could brute-force the downgrade |
| R4 | TOTP enroll/confirm/disable are `@Roles(ADMIN, SUPER_ADMIN)` | §5 says admin-only; the plan had only the JWT guard |
| R6 | One 5-minute TTL for the login OTP and the challenge (`TWO_FACTOR_CHALLENGE_TTL_MS`) | §7's 10-minute OTP rode on a 5-minute challenge; clients were told they had 10 minutes |
| R7 | `POST /auth/2fa/resend` returns a fresh `challengeToken` | A code resent late in the window died with the original challenge |
| R8 | Verify and resend reject a challenge whose `method` no longer matches the account's active factor | Prevents redeeming a challenge against the other factor after enroll/reset |
| R9 | All 2FA state changes run under `AuthRepositoryInterface.updateExclusively` (`SELECT … FOR UPDATE` in a transaction) | Read-modify-write let concurrent requests bypass every cap: 60 parallel guesses were all checked against real Postgres. Proven fixed by an integration suite that fails when the lock is removed |
| R10 | Enroll/confirm/disable/reset use the same lock | Same race class |
| R11 | Enrolling while TOTP is already enabled returns 409; confirm requires a *pending* enrollment | Enrolling silently disabled the active factor, letting a session-holder replace the admin's authenticator |
| R12 | `POST /auth/2fa/totp/enroll` requires the current password | Step-up auth: a stolen access token alone can no longer enroll an attacker's authenticator |

| R13 | Changing a user's role revokes their refresh tokens, and refresh rejects a token whose `role` claim differs from the user's current role | Refresh reads the role from the database, so a pre-promotion session became an admin session with no 2FA; revocation alone lost a race with in-flight refreshes (40/40 survived on real Postgres) |
| R14 | Admin sign-in codes use a dedicated `sendLoginOtp` (admin wording, real expiry, no link); the Apps Script receives `{ type: 'admin-login-code', code, expiresInMinutes }` | They were going through the registration email, which over Apps Script embeds the code in a learner-portal magic link |
| R15 | TOTP verification reads the clock once and fails closed | Two clock reads across a 30-second boundary recorded the wrong step |
| R16 | A SUPER_ADMIN cannot reset their own 2FA, compared on the canonical user id | Would bypass the current-code requirement for disabling; raw-string comparison was bypassable with alternate UUID spellings |
| R17 | `DB_SSL=true` enables verified TLS for both the app and sequelize-cli; startup rejects `REFRESH_TOKEN_SECRET === JWT_SECRET` | Azure Database for PostgreSQL requires TLS; identical secrets would let refresh tokens pass as access tokens |

**Attempt-cap semantics, stated precisely.** The 5-attempt counter is per account. It resets when a new challenge is issued (at most 3 per hour, login and resend combined) or when a code verifies successfully. For email codes, 5 failures also delete the code. For TOTP, a legitimate successful sign-in resets the counter while another unexpired challenge token may still be live, so the hourly ceiling is not a strict 15 guesses. The risk is negligible (about 3 in a million per guess) but should not be overstated.

Also corrected: the AES-GCM decrypt now requires a 16-byte auth tag (Node 20, our container base, otherwise accepts truncated tags) and validates ciphertext shape; the otplib epoch restore uses `resetOptions()` (the planned restore made every TOTP check after the first throw).

### Rollout requirement added

Refresh-token rotation never checks 2FA, so admin sessions created before this deploys would live on indefinitely without a second factor. After deploying, revoke existing admin refresh tokens (run manually):

```sql
UPDATE refresh_tokens
SET is_revoked = true
WHERE user_id IN (SELECT id FROM users WHERE role IN ('ADMIN', 'SUPER_ADMIN'))
  AND is_revoked = false;
```
