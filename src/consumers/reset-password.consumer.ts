import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { OtpService } from '../services/otp.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ResetPasswordConsumer {
  constructor(
    private readonly userService: UserService,
    private readonly otpService: OtpService,
  ) {}

  async handle(payload: any) {
    const { email, phone, code, newPassword } = payload;
    const recipient = email || phone;
    
    if (!recipient || !code || !newPassword) {
      throw new UnauthorizedException('Email, code, and new password are required');
    }
    
    // Verify OTP
    const result = await this.otpService.verify(recipient, code);
    if (!result.valid) throw new UnauthorizedException(result.reason);
    
    // Find user and update password
    const user = await this.userService.findByIdentifier(recipient);
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.userService.updatePassword(user.id, passwordHash);
    
    return { message: 'Password reset successfully' };
  }
}
