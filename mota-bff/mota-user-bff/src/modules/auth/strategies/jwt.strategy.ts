import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { TokenPayload } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    // JWT 密钥是 Base64 编码的，需要解码后使用
    const base64Secret = configService.get<string>('jwt.secret') || '';
    const secretKey = Buffer.from(base64Secret, 'base64');
    
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secretKey,
      algorithms: ['HS512'], // auth-service 使用 HS512 算法
    });
  }

  async validate(payload: TokenPayload): Promise<TokenPayload> {
    // 兼容两种 token 格式：
    // 1. BFF 自己生成的 token：包含 username 和 roles
    // 2. auth-service 生成的 token：包含 userId, username, orgId 等
    if (!payload.userId && !payload.username) {
      throw new UnauthorizedException('Invalid token payload');
    }
    // 将 orgId 映射为 tenantId 以保持兼容性
    if (payload.orgId && !payload.tenantId) {
      payload.tenantId = payload.orgId;
    }
    return payload;
  }
}