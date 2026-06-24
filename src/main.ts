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
import { SendOtpConsumer } from './consumers/send-otp.consumer';
import { ForgotPasswordConsumer } from './consumers/forgot-password.consumer';
import { ResetPasswordConsumer } from './consumers/reset-password.consumer';
import { UserConsumer } from './consumers/user.consumer';
import { ChangePasswordConsumer } from './consumers/change-password.consumer';
import { ClientConsumer } from './consumers/client.consumer';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(PalkiLoggerService));
  await app.init();

  const logger = app.get(PalkiLoggerService);
  const consumer = app.get(KafkaConsumerService);
  const producer = app.get(KafkaProducerService);
  const signer = app.get(MessageSignerService);
  const handlers: Record<string, any> = {
    'auth.register': app.get(RegisterConsumer),
    'auth.verify-otp': app.get(VerifyOtpConsumer),
    'auth.login': app.get(LoginConsumer),
    'auth.logout': app.get(LogoutConsumer),
    'auth.refresh-token': app.get(RefreshTokenConsumer),
    'auth.send-otp': app.get(SendOtpConsumer),
    'auth.forgot-password': app.get(ForgotPasswordConsumer),
    'auth.reset-password': app.get(ResetPasswordConsumer),
    'user.get-profile': app.get(UserConsumer),
    'user.update-profile': app.get(UserConsumer),
    'user.change-password': app.get(ChangePasswordConsumer),
    'client.create': app.get(ClientConsumer),
    'client.findAll': app.get(ClientConsumer),
    'client.findOne': app.get(ClientConsumer),
    'client.update': app.get(ClientConsumer),
    'client.delete': app.get(ClientConsumer),
    'client.getProfile': app.get(ClientConsumer),
    'client.updateProfile': app.get(ClientConsumer),
    'client.getServices': app.get(ClientConsumer),
    'client.addService': app.get(ClientConsumer),
  };

  async function handleAndReply(topic: string, payload: any, handler: any) {
    try {
      const result = await handler.handle(payload.payload || payload);
      const replyEnvelope = signer.sign({
        status: 'success', data: result,
        correlationId: payload.correlationId, messageId: payload.messageId,
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

  for (const [topic, handler] of Object.entries(handlers)) {
    await consumer.subscribe(topic, async (p) => {
      const msg = JSON.parse(p.message.value?.toString() || '{}');
      logger.info('Processing ' + topic, { messageId: msg.messageId });
      await handleAndReply(topic, msg, handler);
    });
  }

  await consumer.startConsuming();
  logger.info('Kafka consumers started');

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
