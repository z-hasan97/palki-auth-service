import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PalkiLoggerService } from '@palki/logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  app.useLogger(app.get(PalkiLoggerService));
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
