import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PalkiLoggerService } from '@palki/logger';
import { KafkaConsumerService } from '@palki/messaging';
import { RegisterConsumer } from './consumers/register.consumer';
import { VerifyOtpConsumer } from './consumers/verify-otp.consumer';
import { LoginConsumer } from './consumers/login.consumer';
import { LogoutConsumer } from './consumers/logout.consumer';
import { RefreshTokenConsumer } from './consumers/refresh-token.consumer';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(PalkiLoggerService));
  await app.init();

  const logger = app.get(PalkiLoggerService);
  const consumer = app.get(KafkaConsumerService);
  const registerConsumer = app.get(RegisterConsumer);
  const verifyOtpConsumer = app.get(VerifyOtpConsumer);
  const loginConsumer = app.get(LoginConsumer);
  const logoutConsumer = app.get(LogoutConsumer);
  const refreshConsumer = app.get(RefreshTokenConsumer);

  await consumer.onModuleInit();

  await consumer.subscribe('auth.register', async (payload) => {
    const msg = JSON.parse(payload.message.value?.toString() || '{}');
    logger.info('Processing auth.register', { messageId: msg.messageId });
    await registerConsumer.handle(msg.payload || msg);
  });

  await consumer.subscribe('auth.verify-otp', async (payload) => {
    const msg = JSON.parse(payload.message.value?.toString() || '{}');
    logger.info('Processing auth.verify-otp', { messageId: msg.messageId });
    await verifyOtpConsumer.handle(msg.payload || msg);
  });

  await consumer.subscribe('auth.login', async (payload) => {
    const msg = JSON.parse(payload.message.value?.toString() || '{}');
    logger.info('Processing auth.login', { messageId: msg.messageId });
    await loginConsumer.handle(msg.payload || msg);
  });

  await consumer.subscribe('auth.logout', async (payload) => {
    const msg = JSON.parse(payload.message.value?.toString() || '{}');
    await logoutConsumer.handle(msg.payload || msg);
  });

  await consumer.subscribe('auth.refresh-token', async (payload) => {
    const msg = JSON.parse(payload.message.value?.toString() || '{}');
    await refreshConsumer.handle(msg.payload || msg);
  });

  await consumer.startConsuming();
  logger.info('Kafka consumers started');

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
