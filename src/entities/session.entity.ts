import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@palki/database';
import { User } from './user.entity';

export enum SessionState {
  ACTIVE = 'ACTIVE',
  LOGGED_OUT = 'LOGGED_OUT',
  EXPIRED = 'EXPIRED',
  REVOKED = 'REVOKED',
}

@Entity('sessions')
export class Session extends BaseEntity {
  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @Column()
  deviceId: string;

  @Column({ nullable: true })
  deviceName: string;

  @Column({ nullable: true })
  deviceType: string;

  @Column()
  ipAddress: string;

  @Column({ type: 'enum', enum: SessionState, default: SessionState.ACTIVE })
  state: SessionState;

  @Column({ type: 'timestamptz' })
  expiresAt: Date;
}
