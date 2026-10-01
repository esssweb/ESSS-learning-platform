import { GoogleScriptEmailService } from './google-script-email.service';

describe('GoogleScriptEmailService', () => {
  const originalFetch = global.fetch;
  let fetchMock: jest.Mock;

  const config = (values: Record<string, string>) => ({
    get: (key: string, fallback?: string) => values[key] ?? fallback,
  });
  const service = () =>
    new GoogleScriptEmailService(
      config({ GOOGLE_SCRIPT_URL: 'https://script.test/exec', FRONTEND_URL: 'https://app.test' }) as never,
    );

  beforeEach(() => {
    fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
      text: async () => '',
    });
    global.fetch = fetchMock as never;
  });
  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('sendLoginOtp posts the code as data with no link anywhere', async () => {
    await service().sendLoginOtp('admin@esss.local', '123456', new Date(Date.now() + 5 * 60_000));

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const rawBody = fetchMock.mock.calls[0][1].body as string;
    expect(JSON.parse(rawBody)).toEqual({
      email: 'admin@esss.local',
      type: 'admin-login-code',
      code: '123456',
      expiresInMinutes: 5,
    });
    expect(rawBody).not.toContain('verificationUrl');
    expect(rawBody).not.toContain('verify-email');
  });

  it('sendLoginOtp surfaces HTTP failures like sendOtp does', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 500, text: async () => 'boom' });
    await expect(
      service().sendLoginOtp('a@b.c', '123456', new Date(Date.now() + 300_000)),
    ).rejects.toThrow('HTTP 500');
  });

  it('sendLoginOtp surfaces script-reported failures', async () => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({ success: false, error: 'quota' }) });
    await expect(
      service().sendLoginOtp('a@b.c', '123456', new Date(Date.now() + 300_000)),
    ).rejects.toThrow('quota');
  });

  it('registration sendOtp body is unchanged', async () => {
    await service().sendOtp('user@x.io', '987654');
    const body = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    expect(body).toEqual({
      email: 'user@x.io',
      verificationUrl: 'https://app.test/verify-email?email=user%40x.io&code=987654',
    });
  });
});
