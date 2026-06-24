import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginRequestDto {
  @ApiProperty({
    example: 'user@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Password123',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
