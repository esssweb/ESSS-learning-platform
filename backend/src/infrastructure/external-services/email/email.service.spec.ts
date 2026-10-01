import * as nodemailer from 'nodemailer';
import { NodemailerEmailService } from './email.service';

jest.mock('nodemailer');

describe('NodemailerEmailService.sendLoginOtp', () => {
  const sendMail = jest.fn().mockResolvedValue(undefined);

  const config = (values: Record<string, string>) => ({
    get: (key: string) => values[key],
  });

  beforeEach(() => {
    sendMail.mockClear();
    (nodemailer.createTransport as jest.Mock).mockReturnValue({ sendMail });
  });

  it('sends the admin subject with the code, the real lifetime, and no links', async () => {
    const service = new NodemailerEmailService(config({ SMTP_HOST: 'smtp.test' }) as never);
    await service.sendLoginOtp('admin@esss.local', '123456', new Date(Date.now() + 5 * 60_000));

    expect(sendMail).toHaveBeenCalledTimes(1);
    const mail = sendMail.mock.calls[0][0];
    expect(mail.to).toBe('admin@esss.local');
    expect(mail.subject).toBe('Your ESSS admin sign-in code');
    expect(mail.html).toContain('123456');
    expect(mail.html).toContain('5 minutes');
    expect(mail.html).not.toContain('verify-email');
    expect(mail.html).not.toContain('href');
  });

  it('never reports less than 1 minute', async () => {
    const service = new NodemailerEmailService(config({ SMTP_HOST: 'smtp.test' }) as never);
    await service.sendLoginOtp('a@b.c', '654321', new Date(Date.now() + 1_000));
    expect(sendMail.mock.calls[0][0].html).toContain('1 minutes');
  });

  it('logs the code instead of sending when SMTP is absent outside production', async () => {
    const service = new NodemailerEmailService(config({}) as never);
    const log = jest.spyOn(service['logger'], 'log').mockImplementation();
    await service.sendLoginOtp('a@b.c', '111222', new Date(Date.now() + 300_000));
    expect(sendMail).not.toHaveBeenCalled();
    expect(log).toHaveBeenCalledWith('[DEV] Login OTP for a@b.c: 111222');
  });

  it('throws in production without SMTP', async () => {
    const service = new NodemailerEmailService(config({ NODE_ENV: 'production' }) as never);
    await expect(
      service.sendLoginOtp('a@b.c', '111222', new Date(Date.now() + 300_000)),
    ).rejects.toThrow('SMTP is not configured in production');
  });
});
