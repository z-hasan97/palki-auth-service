import { Injectable } from '@nestjs/common';

@Injectable()
export class LoginConsumer {
  async handleLogin(payload: any) {
    return { message: 'Login not implemented', payload };
  }
}
