import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthController } from './health.controller';
import { ConfigModule } from '@palki/config';
import { LoggerModule } from '@palki/logger';

@Module({
  imports: [ConfigModule, LoggerModule],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule {}
