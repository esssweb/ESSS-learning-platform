import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ResendTwoFactorDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  challengeToken: string;
}
