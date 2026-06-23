import { Injectable } from '@nestjs/common';

@Injectable()
export class ForgotPasswordConsumer {
  async handle(payload: any) {
    return { message: 'Password reset link sent to ' + payload.email };
  }
}
