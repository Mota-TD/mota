import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { ServiceClientService } from '../../common/service-client/service-client.service';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private readonly serviceClient: ServiceClientService,
  ) {}

  /**
   * 获取当前用户信息
   */
  async getCurrentUser(userId: string | number, tenantId?: string): Promise<any> {
    this.logger.log(`Getting current user info: ${userId}`);
    
    try {
      const response = await this.serviceClient.get<any>(
        'user',
        `/api/v1/users/${userId}`,
        {},
        { userId: String(userId), tenantId },
      );

      if (response.code !== 200 && response.code !== 0) {
        throw new UnauthorizedException('User not found');
      }

      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get user info: ${error.message}`);
      throw error;
    }
  }
}