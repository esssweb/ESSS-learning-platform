import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenRequestDto {
  @ApiProperty({
    example: 'jwt-refresh-token',
  })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
