import { Injectable } from '@nestjs/common';

@Injectable()
export class VerifyOtpConsumer {
  async handleVerifyOtp(payload: any) {
    return { message: 'Verify OTP not implemented', payload };
  }
}
