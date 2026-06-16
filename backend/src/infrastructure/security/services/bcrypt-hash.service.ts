import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { HashServiceInterface } from '../../../core/application/ports/output/hash.service.interface';

@Injectable()
export class BcryptHashService implements HashServiceInterface {
  async hash(plainText: string): Promise<string> {
    return bcrypt.hash(plainText, 10);
  }

  async compare(plainText: string, hashedText: string): Promise<boolean> {
    return bcrypt.compare(plainText, hashedText);
  }
}
