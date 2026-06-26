import { CacheModuleAsyncOptions } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-store';

export const cacheConfig: CacheModuleAsyncOptions = {
  isGlobal: true,
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: async (configService: ConfigService) => {
    try {
      const store = await redisStore({
        socket: {
          host: configService.get<string>('REDIS_HOST') || 'localhost',
          port: configService.get<number>('REDIS_PORT') || 6379,
        },
      });
      return {
        store: () => store,
        ttl: 60 * 1000, // 1 phút
      };
    } catch {
      console.warn('Redis not available, using memory cache');
      return {
        ttl: 60 * 1000, // fallback: memory cache
      };
    }
  },
};
