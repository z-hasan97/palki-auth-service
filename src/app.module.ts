import { Module } from '@nestjs/common';
import { ConfigModule } from '@palki/config';
import { LoggerModule } from '@palki/logger';
import { HealthController } from './health.controller';
import { LoginConsumer } from './consumers/login.consumer';
import { RegisterConsumer } from './consumers/register.consumer';
import { VerifyOtpConsumer } from './consumers/verify-otp.consumer';
import { RefreshTokenConsumer } from './consumers/refresh-token.consumer';
import { LogoutConsumer } from './consumers/logout.consumer';
import { VerifyTokenConsumer } from './consumers/verify-token.consumer';
import { AuthEventProducer } from './producers/auth-event.producer';

@Module({
  imports: [ConfigModule, LoggerModule],
  controllers: [HealthController],
  providers: [
    LoginConsumer, RegisterConsumer, VerifyOtpConsumer,
    RefreshTokenConsumer, LogoutConsumer, VerifyTokenConsumer,
    AuthEventProducer,
  ],
})
export class AppModule {}
