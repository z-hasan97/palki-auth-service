import { Injectable } from '@nestjs/common';
import { UserService } from '../services/user.service';

@Injectable()
export class UserConsumer {
  constructor(private readonly userService: UserService) {}

  async handle(payload: any) {
    const data = payload.payload || payload;
    const id = data.userId || 'e264955f-7495-4378-8b39-0e3ec4657bce';
    
    if (data.name || data.email || data.phone) {
      await this.userService.updateProfile(id, {
        name: data.name,
        email: data.email,
        phone: data.phone,
      });
    }
    
    const user = await this.userService.findById(id);
    if (!user) throw new Error('User not found');
    return { id: user.id, email: user.email, phone: user.phone, name: user.name, roles: user.roles, state: user.state };
  }
}
