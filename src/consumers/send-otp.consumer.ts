import { Injectable } from '@nestjs/common';
import { OtpService } from '../services/otp.service';
import { UserService } from '../services/user.service';

@Injectable()
export class SendOtpConsumer {
  constructor(
    private readonly otpService: OtpService,
    private readonly userService: UserService,
  ) {}

  async handle(payload: any) {
    const data = payload.payload || payload;
    const recipient = data.email || data.phone || data.recipient;
    
    if (!recipient) throw new Error('Email or phone required');
    
    await this.otpService.generateAndSend(recipient, data.purpose || 'REGISTRATION');
    return { message: 'OTP sent to ' + recipient };
  }
}
