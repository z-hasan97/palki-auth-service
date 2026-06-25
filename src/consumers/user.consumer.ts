import { Injectable } from '@nestjs/common';
import { UserService } from '../services/user.service';

@Injectable()
export class UserConsumer {
  constructor(private readonly userService: UserService) {}

  async handle(payload: any) {
    const data = payload.payload || payload;
    const id = data.userId || data.sub || data.id;
    
    if (!id) throw new Error('USER_NOT_FOUND');
    
    if (data.name || data.email || data.phone) {
      await this.userService.updateProfile(id, { name: data.name, email: data.email, phone: data.phone });
    }
    
    const user = await this.userService.findById(id);
    if (!user) throw new Error('USER_NOT_FOUND');
    return { id: user.id, email: user.email, phone: user.phone, name: user.name, roles: user.roles, state: user.state };
  }
}
