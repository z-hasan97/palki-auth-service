import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@palki/config';
import { LoggerModule } from '@palki/logger';
import { RedisModule } from '@palki/redis';
import { DatabaseModule } from '@palki/database';
import { KafkaConsumerService, KafkaProducerService } from '@palki/messaging';
import { MessageSignerService, SignatureVerifierService } from '@palki/messaging';
import { HealthController } from './health.controller';
import { User } from './entities/user.entity';
import { UserService } from './services/user.service';
import { OtpService } from './services/otp.service';
import { TokenService } from './services/token.service';
import { LoginConsumer } from './consumers/login.consumer';
import { RegisterConsumer } from './consumers/register.consumer';
import { VerifyOtpConsumer } from './consumers/verify-otp.consumer';
import { RefreshTokenConsumer } from './consumers/refresh-token.consumer';
import { LogoutConsumer } from './consumers/logout.consumer';
import { AuthEventProducer } from './producers/auth-event.producer';
import * as fs from 'fs';

@Module({
  imports: [
    ConfigModule, LoggerModule, RedisModule,
    DatabaseModule.forRoot([User]),
    JwtModule.register({
      privateKey: fs.readFileSync('../palki-shared/keys/jwt-private.pem', 'utf8'),
      publicKey: fs.readFileSync('../palki-shared/keys/jwt-public.pem', 'utf8'),
      signOptions: { algorithm: 'RS256', issuer: 'palki-auth-service', audience: 'palki-api' },
    }),
  ],
  controllers: [HealthController],
  providers: [
    KafkaConsumerService, KafkaProducerService, MessageSignerService, SignatureVerifierService,
    UserService, OtpService, TokenService,
    LoginConsumer, RegisterConsumer, VerifyOtpConsumer,
    RefreshTokenConsumer, LogoutConsumer,
    AuthEventProducer,
  ],
})
export class AppModule {}
