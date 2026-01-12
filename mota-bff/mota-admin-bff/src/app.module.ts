import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { ThrottlerModule } from '@nestjs/throttler';
import { HttpModule } from '@nestjs/axios';
import { redisStore } from 'cache-manager-redis-yet';
import configuration from './config/configuration';

// Common modules
import { ServiceClientModule } from './common/service-client/service-client.module';

// Feature modules
import { AuthModule } from './modules/auth/auth.module';
import { TenantModule } from './modules/tenant/tenant.module';
import { UserModule } from './modules/user/user.module';
import { SystemModule } from './modules/system/system.module';
import { AuditModule } from './modules/audit/audit.module';
import { StatisticsModule } from './modules/statistics/statistics.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),

    // Cache with Redis
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
          database: configService.get('redis.db'),
        }),
        ttl: configService.get('cache.ttl'),
        max: configService.get('cache.max'),
      }),
      inject: [ConfigService],
    }),

    // Rate limiting
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ([{
        ttl: configService.get('throttle.ttl'),
        limit: configService.get('throttle.limit'),
      }]),
      inject: [ConfigService],
    }),

    // HTTP client
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        timeout: configService.get('services.timeout'),
        maxRedirects: 5,
      }),
      inject: [ConfigService],
    }),

    // Common modules
    ServiceClientModule,

    // Feature modules
    AuthModule,
    TenantModule,
    UserModule,
    SystemModule,
    AuditModule,
    StatisticsModule,
  ],
})
export class AppModule {}