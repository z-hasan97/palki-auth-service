import { Injectable } from '@nestjs/common';

@Injectable()
export class LogoutConsumer {
  async handleLogout(payload: any) {
    return { message: 'Logout not implemented', payload };
  }
}
