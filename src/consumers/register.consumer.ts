import { Injectable } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { OtpService } from '../services/otp.service';

@Injectable()
export class RegisterConsumer {
  constructor(
    private readonly userService: UserService,
    private readonly otpService: OtpService,
  ) {}

  async handle(payload: any) {
    const data: any = { password: payload.password, name: payload.name };
    if (payload.email) data.email = payload.email;
    if (payload.phone) data.phone = payload.phone;
    
    const user = await this.userService.create(data);
    const recipient = payload.email || payload.phone;
    await this.otpService.generateAndSend(recipient, 'REGISTRATION');
    return { userId: user.id, state: user.state, message: 'OTP sent to ' + recipient };
  }
}
