import { Module } from '@nestjs/common';
import { ConfigModule } from '@palki/config';
import { LoggerModule } from '@palki/logger';
import { RedisModule } from '@palki/redis';
import { DatabaseModule } from '@palki/database';
import { HealthController } from './health.controller';
import { LoginConsumer } from './consumers/login.consumer';
import { RegisterConsumer } from './consumers/register.consumer';
import { VerifyOtpConsumer } from './consumers/verify-otp.consumer';
import { RefreshTokenConsumer } from './consumers/refresh-token.consumer';
import { LogoutConsumer } from './consumers/logout.consumer';
import { VerifyTokenConsumer } from './consumers/verify-token.consumer';
import { AuthEventProducer } from './producers/auth-event.producer';
import { User } from './entities/user.entity';
import { Session } from './entities/session.entity';

@Module({
  imports: [
    ConfigModule, LoggerModule, RedisModule,
    DatabaseModule.forRoot([User, Session]),
  ],
  controllers: [HealthController],
  providers: [
    LoginConsumer, RegisterConsumer, VerifyOtpConsumer,
    RefreshTokenConsumer, LogoutConsumer, VerifyTokenConsumer,
    AuthEventProducer,
  ],
})
export class AppModule {}
