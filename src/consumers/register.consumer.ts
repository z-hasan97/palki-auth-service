import { Injectable } from '@nestjs/common';

@Injectable()
export class RegisterConsumer {
  async handleRegister(payload: any) {
    return { message: 'Register not implemented', payload };
  }
}
