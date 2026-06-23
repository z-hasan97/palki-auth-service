import { Injectable } from '@nestjs/common';

@Injectable()
export class SendOtpConsumer {
  async handle(payload: any) {
    return { message: 'OTP sent to ' + (payload.email || payload.phone) };
  }
}
