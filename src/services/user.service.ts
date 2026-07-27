import { Injectable, ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserState } from '../entities/user.entity';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private readonly userRepo: Repository<User>) {}

  private generatePublicId(lastName: string): string {
    const name = lastName || 'USER';
    const clean = name.toUpperCase().replace(/[^A-Z]/g, '').substring(0, 6) || 'USER';
    const digits = crypto.randomInt(100, 999).toString();
    return clean + digits;
  }

  async create(data: { email?: string; phone?: string; password: string; name: string; firstName?: string; lastName?: string }) {
    if (data.email) { const e = await this.userRepo.findOne({ where: { email: data.email } }); if (e) throw new ConflictException('EMAIL_EXISTS'); }
    if (data.phone) { const p = await this.userRepo.findOne({ where: { phone: data.phone } }); if (p) throw new ConflictException('PHONE_EXISTS'); }
    const passwordHash = await bcrypt.hash(data.password, 12);
    
    let publicId = this.generatePublicId(data.lastName || '');
    let existing = await this.userRepo.findOne({ where: { publicId } });
    while (existing) {
      publicId = this.generatePublicId(data.lastName || '');
      existing = await this.userRepo.findOne({ where: { publicId } });
    }
    
    const user = this.userRepo.create({ ...data, passwordHash, publicId, state: UserState.PENDING_VERIFICATION });
    return this.userRepo.save(user);
  }

  async findById(id: string) { const u = await this.userRepo.findOne({ where: { id } }); if (!u) throw new NotFoundException('USER_NOT_FOUND'); return u; }

  async findByIdentifier(identifier: string) {
    const u = await this.userRepo.findOne({ where: [{ email: identifier }, { phone: identifier }, { publicId: identifier }] });
    if (!u) throw new UnauthorizedException('INVALID_CREDENTIALS');
    return u;
  }

  async updateProfile(id: string, data: { name?: string; email?: string; phone?: string }) {
    await this.userRepo.update(id, data);
    return this.findById(id);
  }

  async updatePassword(id: string, passwordHash: string) { await this.userRepo.update(id, { passwordHash }); }
  async updateState(id: string, state: UserState) { await this.userRepo.update(id, { state }); }
}
