import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserState } from '../entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  async create(data: { email?: string; phone?: string; password: string; name: string }) {
    const exists = await this.userRepo.findOne({
      where: [{ email: data.email }, { phone: data.phone }],
    });
    if (exists) throw new ConflictException('User already exists');

    const passwordHash = await bcrypt.hash(data.password, 12);
    const user = this.userRepo.create({ ...data, passwordHash, state: UserState.PENDING_VERIFICATION });
    return this.userRepo.save(user);
  }

  async findById(id: string) {
    return this.userRepo.findOne({ where: { id } });
  }

  async findByIdentifier(identifier: string) {
    return this.userRepo.findOne({
      where: [{ email: identifier }, { phone: identifier }],
    });
  }

  async updateState(id: string, state: UserState) {
    await this.userRepo.update(id, { state });
  }
}
