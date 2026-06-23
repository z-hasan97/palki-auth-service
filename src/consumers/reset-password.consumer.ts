import { Injectable } from '@nestjs/common';

@Injectable()
export class ResetPasswordConsumer {
  async handle(payload: any) {
    return { message: 'Password reset successfully' };
  }
}
