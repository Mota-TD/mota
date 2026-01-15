import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ServiceClientService } from '../../common/service-client/service-client.service';

export interface LoginDto {
  username: string;
  password: string;
  tenantCode?: string;
}

export interface TokenPayload {
  userId: string | number;
  username: string;
  tenantId?: string;
  orgId?: string;  // auth-service 使用 orgId
  roles?: string[];
  type?: string;   // access 或 refresh
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: string;
    username: string;
    nickname: string;
    avatar: string;
    email: string;
    tenantId: string;
    roles: string[];
    permissions: string[];
  };
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly serviceClient: ServiceClientService,
  ) {}

  /**
   * 用户登录
   */
  async login(loginDto: LoginDto): Promise<LoginResponse> {
    this.logger.log(`User login attempt: ${loginDto.username}`);

    // 调用认证服务验证用户
    const response = await this.serviceClient.post<any>(
      'auth',
      '/api/v1/auth/login',
      loginDto,
    );

    if (response.code !== 200 || !response.data) {
      throw new UnauthorizedException(response.message || 'Invalid credentials');
    }

    const user = response.data;

    // 生成JWT Token
    const payload: TokenPayload = {
      userId: user.id,
      username: user.username,
      tenantId: user.tenantId,
      roles: user.roles || [],
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get('jwt.refreshExpiresIn'),
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 86400, // 24小时
      user: {
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        avatar: user.avatar,
        email: user.email,
        tenantId: user.tenantId,
        roles: user.roles || [],
        permissions: user.permissions || [],
      },
    };
  }

  /**
   * 刷新Token
   */
  async refreshToken(refreshToken: string): Promise<{ accessToken: string; expiresIn: number }> {
    try {
      const payload = this.jwtService.verify<TokenPayload>(refreshToken);

      // 生成新的访问Token
      const newPayload: TokenPayload = {
        userId: payload.userId,
        username: payload.username,
        tenantId: payload.tenantId,
        roles: payload.roles,
      };

      const accessToken = this.jwtService.sign(newPayload);

      return {
        accessToken,
        expiresIn: 86400,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  /**
   * 验证Token
   */
  async validateToken(token: string): Promise<TokenPayload> {
    try {
      return this.jwtService.verify<TokenPayload>(token);
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  /**
   * 获取当前用户信息
   */
  async getCurrentUser(userId: string, tenantId: string): Promise<any> {
    const response = await this.serviceClient.get<any>(
      'user',
      `/api/v1/users/${userId}`,
      {},
      { userId, tenantId },
    );

    if (response.code !== 200) {
      throw new UnauthorizedException('User not found');
    }

    return response.data;
  }

  /**
   * 用户登出
   */
  async logout(userId: string): Promise<void> {
    this.logger.log(`User logout: ${userId}`);
    // 可以在这里实现Token黑名单等逻辑
  }
}