import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RefreshTokenStrategy } from './strategies/refresh-token.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { RefreshTokenGuard } from './guards/refresh-token.guard';

@Module({
  imports: [JwtModule.register({})],
  providers: [JwtStrategy, RefreshTokenStrategy, JwtAuthGuard, RefreshTokenGuard, RolesGuard],
  exports: [JwtStrategy, RefreshTokenStrategy, JwtAuthGuard, RefreshTokenGuard, RolesGuard],
})
export class SecurityModule {}
