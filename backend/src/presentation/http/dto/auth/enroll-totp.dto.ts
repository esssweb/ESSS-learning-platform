import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class EnrollTotpDto {
  @ApiProperty({ description: 'Current account password (step-up authentication)' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
