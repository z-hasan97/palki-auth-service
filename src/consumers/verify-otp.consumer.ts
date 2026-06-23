import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { OtpService } from '../services/otp.service';
import { UserState } from '../entities/user.entity';

@Injectable()
export class VerifyOtpConsumer {
  constructor(
    private readonly userService: UserService,
    private readonly otpService: OtpService,
  ) {}

  async handle(payload: any) {
    const result = await this.otpService.verify(payload.recipient, payload.code);
    if (!result.valid) throw new UnauthorizedException(result.reason);
    await this.userService.updateState(payload.userId, UserState.ACTIVE);
    return { verified: true, userId: payload.userId, state: 'ACTIVE' };
  }
}
