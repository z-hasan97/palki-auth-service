import { Injectable } from '@nestjs/common';

@Injectable()
export class RefreshTokenConsumer {
  async handleRefreshToken(payload: any) {
    return { message: 'Refresh token not implemented', payload };
  }
}
