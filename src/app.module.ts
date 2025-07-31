/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './users/users.module';
import { AnalyticsModule } from './analytics/analytics.module';
import configuration from './common/config/configuration';
import { validationSchema } from './common/config/validation';
import { TypedConfigService } from './common/config/typed-config.service';
import { ScheduleModule } from "@nestjs/schedule"; 
import { LeaderboardModule } from './leaderboard/leaderboard.module';
import { GameSessionModule } from './game-session/game-session.module';
import { ChallengeModule } from './challenge/challenge.module';
import { MailModule } from './mail/mail.module';
import { BadgeModule } from './badge/badge.module';
import { GameModule } from './game/game.module';
import { MintModule } from './mint/mint.module';
import { BlockchainService } from './blockchain/blockchain.service';
import { BlockchainModule } from './blockchain/blockchain.module';
import { AdminModule } from './admin/admin.module';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { RealtimeGateway } from './common/gateways/realtime.gateway';
import { WinstonModule } from 'nest-winston';
import { createWinstonLogger } from './logging/logging.config';
import { ClsModule, ClsService } from 'nestjs-cls';
import { LoggingModule } from './logging/logging.module';
import { CacheModule } from './cache/cache.module';
import { ProtectedModule } from './protected/protected.module';

@Module({
  imports: [
    ClsModule.forRoot({
      global: true,
      middleware: {
        mount: true,
        setup: (cls, req) => {
          cls.set('requestId', req.headers['x-request-id']);
          cls.set('user', req.user);
        },
      },
    }),
    WinstonModule.forRootAsync({
      imports: [ClsModule],
      useFactory: (clsService: ClsService) => createWinstonLogger(clsService),
      inject: [ClsService],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'production' ? ['.env.production', '.env'] : ['.env.development', '.env'],
      load: [configuration],
      validationSchema,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('app.databaseUrl'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        autoLoadEntities: true,
        synchronize: configService.get<string>('app.nodeEnv') !== 'production',
      }),
    }),
    ScheduleModule.forRoot(),
    PrometheusModule.register(),
    UserModule,
    AuthModule,
    LeaderboardModule,
    ProtectedModule,
    AnalyticsModule,
    GameSessionModule,
    ChallengeModule,
    MailModule,
    BadgeModule,
    GameModule,
    MintModule,
    BlockchainModule,
    AdminModule,
    LoggingModule,
    CacheModule,
  ],
  controllers: [AppController],
  providers: [AppService, BlockchainService, TypedConfigService, RealtimeGateway],
})
export class AppModule {}
