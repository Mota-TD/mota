import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        // JWT 密钥是 Base64 编码的，需要解码后使用
        const base64Secret = configService.get('jwt.secret') || '';
        const secretKey = Buffer.from(base64Secret, 'base64');
        
        return {
          secret: secretKey,
          signOptions: {
            expiresIn: configService.get('jwt.expiresIn'),
            algorithm: 'HS512', // 与 auth-service 保持一致
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}