import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { TokenService } from '../services/token.service';
import { UserState } from '../entities/user.entity';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class LoginConsumer {
  constructor(
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
  ) {}

  async handle(payload: any) {
    // Check if identifier is empty
    if (!payload.identifier || !payload.identifier.trim()) {
      throw new UnauthorizedException('Email, phone, or ID is required');
    }

    let user;
    try {
      user = await this.userService.findByIdentifier(payload.identifier);
    } catch (e) {
      throw new UnauthorizedException('No account found with this email, phone, or ID');
    }
    
    if (!user) throw new UnauthorizedException('No account found with this email, phone, or ID');
    if (user.state !== UserState.ACTIVE) throw new UnauthorizedException('Account not verified. Please check your email/phone for OTP');

    if (!payload.password) {
      throw new UnauthorizedException('Password is required');
    }

    const valid = await bcrypt.compare(payload.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Password does not match');

    const sessionId = crypto.randomUUID();
    const tokens = await this.tokenService.generateTokens(user, sessionId, payload.deviceId);

    return {
      ...tokens,
      sessionId,
      user: { id: user.id, email: user.email, phone: user.phone, name: user.name, roles: user.roles, publicId: user.publicId },
    };
  }
}
