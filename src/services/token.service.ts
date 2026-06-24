import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenStoreService } from '@palki/redis';
import * as crypto from 'crypto';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly tokenStore: TokenStoreService,
  ) {}

  async generateTokens(user: any, sessionId: string, deviceId: string) {
    const accessToken = this.jwtService.sign({
      sub: user.id, sid: sessionId, did: deviceId,
      rol: user.roles, prm: user.permissions,
    }, { expiresIn: '1h' });

    const tokenId = crypto.randomBytes(32).toString('hex');
    const refreshToken = 'rt_' + crypto.randomBytes(48).toString('base64url');

    await this.tokenStore.storeRefreshToken(refreshToken, {
      userId: user.id, sessionId, deviceId, tokenId,
      roles: user.roles, permissions: user.permissions,
    });

    return { accessToken, refreshToken, expiresIn: 3600, tokenId, sessionId, user };
  }

  async refresh(refreshToken: string) {
    const data = await this.tokenStore.getRefreshToken(refreshToken);
    if (!data) throw new Error('Invalid refresh token');
    return data;
  }

  async revoke(refreshToken: string) {
    await this.tokenStore.deleteRefreshToken(refreshToken);
  }
}
