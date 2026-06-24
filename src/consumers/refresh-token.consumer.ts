import { Injectable } from '@nestjs/common';
import { TokenService } from '../services/token.service';

@Injectable()
export class RefreshTokenConsumer {
  constructor(private readonly tokenService: TokenService) {}

  async handle(payload: any) {
    const data = await this.tokenService.refresh(payload.refreshToken);
    return { valid: true, ...data };
  }
}
