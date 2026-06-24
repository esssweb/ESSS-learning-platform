import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { IHashService } from '../../../core/domain/repositories/hash-service.interface';

@Injectable()
export class HashService implements IHashService {
  private readonly saltRounds = 10;

  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
