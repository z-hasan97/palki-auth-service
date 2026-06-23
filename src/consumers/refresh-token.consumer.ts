import { Injectable } from '@nestjs/common';
import { TokenService } from '../services/token.service';

@Injectable()
export class RefreshTokenConsumer {
  constructor(private readonly tokenService: TokenService) {}

  async handle(payload: any) {
    return this.tokenService.refresh(payload.tokenId);
  }
}
