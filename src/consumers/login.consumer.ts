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
    const user = await this.userService.findByIdentifier(payload.identifier);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    if (user.state !== UserState.ACTIVE) throw new UnauthorizedException('Account not active');

    const valid = await bcrypt.compare(payload.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const sessionId = crypto.randomUUID();
    const tokens = await this.tokenService.generateTokens(user, sessionId, payload.deviceId);

    return {
      ...tokens,
      sessionId,
      user: { id: user.id, email: user.email, phone: user.phone, name: user.name, roles: user.roles },
    };
  }
}
