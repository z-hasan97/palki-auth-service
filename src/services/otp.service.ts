import { Injectable } from '@nestjs/common';
import { OtpStoreService } from '@palki/redis';
import * as crypto from 'crypto';

@Injectable()
export class OtpService {
  constructor(private readonly otpStore: OtpStoreService) {}

  async generateAndSend(recipient: string, purpose: string) {
    const code = crypto.randomInt(100000, 999999).toString();
    await this.otpStore.storeOtp(recipient, code, purpose);
    console.log('OTP for ' + recipient + ': ' + code);
    return { message: 'OTP sent' };
  }

  async verify(recipient: string, code: string) {
    return this.otpStore.verifyOtp(recipient, code);
  }
}
