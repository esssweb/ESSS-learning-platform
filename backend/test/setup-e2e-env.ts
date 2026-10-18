// Runs via jest "setupFiles", before any test module is imported. ConfigModule
// validates the environment synchronously when app.module.ts is imported, and
// ES imports hoist above top-level assignments in a spec, so env cannot be
// set from the spec itself.
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '5432';
process.env.DB_USERNAME = 'e2e';
process.env.DB_PASSWORD = 'e2e-password';
process.env.DB_DATABASE = 'e2e';
process.env.JWT_SECRET = 'e2e-access-secret';
process.env.JWT_EXPIRES_IN = '15m';
process.env.REFRESH_TOKEN_SECRET = 'e2e-refresh-secret';
process.env.REFRESH_TOKEN_EXPIRES_IN = '7d';
// Fixed 32-byte base64 key, test-only.
process.env.TOTP_ENCRYPTION_KEY = 'hwJVdRzXOggzw7EDYt7+gGvdaZsKAA19GbmNRZTFJl8=';
process.env.NODE_ENV = 'test';
delete process.env.GOOGLE_SCRIPT_URL;
delete process.env.SMTP_HOST;
