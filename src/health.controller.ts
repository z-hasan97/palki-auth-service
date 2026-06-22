import { Controller, Get } from '@nestjs/common';
import { PalkiConfigService } from '@palki/config';

@Controller('health')
export class HealthController {
  constructor(private readonly config: PalkiConfigService) {}

  @Get()
  check() {
    return {
      status: 'ok',
      service: 'auth-service',
      version: this.config.app.version,
      environment: this.config.app.env,
      timestamp: new Date().toISOString(),
    };
  }
}
