import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { ThrottlerModule } from '@nestjs/throttler';
import { HttpModule } from '@nestjs/axios';
import { redisStore } from 'cache-manager-redis-yet';

// 配置
import configuration from './config/configuration';

// 公共模块
import { AuthModule } from './modules/auth/auth.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { ProjectModule } from './modules/project/project.module';
import { TaskModule } from './modules/task/task.module';
import { KnowledgeModule } from './modules/knowledge/knowledge.module';
import { AIModule } from './modules/ai/ai.module';
import { NotificationModule } from './modules/notification/notification.module';
import { CalendarModule } from './modules/calendar/calendar.module';

// 公共服务
import { ServiceClientModule } from './common/service-client/service-client.module';

@Module({
  imports: [
    // 配置模块
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: ['.env.local', '.env'],
    }),

    // 缓存模块（Redis）
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        store: await redisStore({
          socket: {
            host: configService.get('redis.host'),
            port: configService.get('redis.port'),
          },
          password: configService.get('redis.password'),
          ttl: configService.get('cache.ttl') * 1000,
        }),
      }),
      inject: [ConfigService],
    }),

    // 限流模块
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => [
        {
          ttl: configService.get('throttle.ttl'),
          limit: configService.get('throttle.limit'),
        },
      ],
      inject: [ConfigService],
    }),

    // HTTP客户端模块
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        timeout: configService.get('http.timeout'),
        maxRedirects: configService.get('http.maxRedirects'),
      }),
      inject: [ConfigService],
    }),

    // 服务客户端模块
    ServiceClientModule,

    // 业务模块
    AuthModule,
    DashboardModule,
    ProjectModule,
    TaskModule,
    KnowledgeModule,
    AIModule,
    NotificationModule,
    CalendarModule,
  ],
})
export class AppModule {}