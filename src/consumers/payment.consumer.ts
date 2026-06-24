import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentStatus } from '../entities/payment.entity';
import { Client, ClientStatus } from '../entities/client.entity';
import { Package } from '../entities/package.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class PaymentConsumer {
  constructor(
    @InjectRepository(Payment) private readonly paymentRepo: Repository<Payment>,
    @InjectRepository(Client) private readonly clientRepo: Repository<Client>,
    @InjectRepository(Package) private readonly packageRepo: Repository<Package>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  async handle(payload: any) {
    const data = payload.payload || payload;
    const action = data.action || 'findAll';
    
    if (action === 'initiate') {
      const payment = this.paymentRepo.create({
        userId: data.userId, packageId: data.packageId,
        amount: data.amount, status: PaymentStatus.PENDING,
      });
      await this.paymentRepo.save(payment);
      return { paymentId: payment.id, status: 'PENDING', message: 'Payment initiated' };
    }
    
    if (action === 'verify') {
      await this.paymentRepo.update(data.paymentId, {
        status: PaymentStatus.COMPLETED,
        transactionId: data.transactionId || 'txn_' + Date.now(),
        paymentMethod: data.paymentMethod || 'sslcommerz',
      });
      return { status: 'COMPLETED', message: 'Payment verified' };
    }
    
    return this.paymentRepo.find();
  }
}
