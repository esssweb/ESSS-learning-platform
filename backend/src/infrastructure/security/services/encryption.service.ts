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
