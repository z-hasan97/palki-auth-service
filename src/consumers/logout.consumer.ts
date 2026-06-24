import { Injectable } from '@nestjs/common';
import { TokenService } from '../services/token.service';

@Injectable()
export class LogoutConsumer {
  constructor(private readonly tokenService: TokenService) {}

  async handle(payload: any) {
    await this.tokenService.revoke(payload.refreshToken);
    return { loggedOut: true };
  }
}
