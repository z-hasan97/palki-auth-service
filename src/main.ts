import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PalkiLoggerService } from '@palki/logger';
import { KafkaConsumerService, KafkaProducerService } from '@palki/messaging';
import { MessageSignerService } from '@palki/messaging';
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
  const producer = app.get(KafkaProducerService);
  const signer = app.get(MessageSignerService);
  const registerConsumer = app.get(RegisterConsumer);
  const verifyOtpConsumer = app.get(VerifyOtpConsumer);
  const loginConsumer = app.get(LoginConsumer);
  const logoutConsumer = app.get(LogoutConsumer);
  const refreshConsumer = app.get(RefreshTokenConsumer);

  async function handleAndReply(topic: string, payload: any, handler: any) {
    try {
      const result = await handler.handle(payload.payload || payload);
      const replyEnvelope = signer.sign({
        status: 'success',
        data: result,
        correlationId: payload.correlationId,
        messageId: payload.messageId,
        timestamp: new Date().toISOString(),
      });
      await producer.send(topic + '.reply', replyEnvelope as any);
    } catch (error: any) {
      logger.logError('Handler error', { topic, error: error.message });
      const replyEnvelope = signer.sign({
        status: 'error',
        error: { code: 'INTERNAL-5001', message: error.message, timestamp: new Date().toISOString(), correlationId: payload.correlationId },
      });
      await producer.send(topic + '.reply', replyEnvelope as any);
    }
  }

  await consumer.onModuleInit();

  await consumer.subscribe('auth.register', async (p) => {
    const msg = JSON.parse(p.message.value?.toString() || '{}');
    logger.info('Processing auth.register', { messageId: msg.messageId });
    await handleAndReply('auth.register', msg, registerConsumer);
  });

  await consumer.subscribe('auth.verify-otp', async (p) => {
    const msg = JSON.parse(p.message.value?.toString() || '{}');
    logger.info('Processing auth.verify-otp', { messageId: msg.messageId });
    await handleAndReply('auth.verify-otp', msg, verifyOtpConsumer);
  });

  await consumer.subscribe('auth.login', async (p) => {
    const msg = JSON.parse(p.message.value?.toString() || '{}');
    logger.info('Processing auth.login', { messageId: msg.messageId });
    await handleAndReply('auth.login', msg, loginConsumer);
  });

  await consumer.subscribe('auth.logout', async (p) => {
    const msg = JSON.parse(p.message.value?.toString() || '{}');
    await handleAndReply('auth.logout', msg, logoutConsumer);
  });

  await consumer.subscribe('auth.refresh-token', async (p) => {
    const msg = JSON.parse(p.message.value?.toString() || '{}');
    await handleAndReply('auth.refresh-token', msg, refreshConsumer);
  });

  await consumer.startConsuming();
  logger.info('Kafka consumers started');

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
