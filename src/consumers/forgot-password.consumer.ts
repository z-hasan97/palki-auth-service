import { Injectable } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { OtpService } from '../services/otp.service';

@Injectable()
export class ForgotPasswordConsumer {
  constructor(
    private readonly userService: UserService,
    private readonly otpService: OtpService,
  ) {}

  async handle(payload: any) {
    const identifier = payload.email || payload.phone;
    if (!identifier) return { message: 'Email or phone is required' };
    
    const user = await this.userService.findByIdentifier(identifier);
    if (!user) return { message: 'If the account exists, a reset code has been sent' };
    
    const recipient = user.email || user.phone;
    await this.otpService.generateAndSend(recipient, 'PASSWORD_RESET');
    
    return { message: 'If the account exists, a reset code has been sent to ' + identifier };
  }
}
