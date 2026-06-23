import { Injectable } from '@nestjs/common';

@Injectable()
export class VerifyTokenConsumer {
  async handleVerifyToken(payload: any) {
    return { message: 'Verify token not implemented', payload };
  }
}
