import { Injectable } from '@nestjs/common';
import { UserService } from '../services/user.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ChangePasswordConsumer {
  constructor(private readonly userService: UserService) {}

  async handle(payload: any) {
    const user = await this.userService.findById(payload.userId);
    if (!user) throw new Error('User not found');
    const valid = await bcrypt.compare(payload.currentPassword, user.passwordHash);
    if (!valid) throw new Error('Current password is incorrect');
    const newHash = await bcrypt.hash(payload.newPassword, 12);
    user.passwordHash = newHash;
    await this.userService.updatePassword(user.id, newHash);
    return { message: 'Password changed successfully' };
  }
}
