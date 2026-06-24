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
    const action = payload.action || 'findAll';
    
    if (action === 'initiate') {
      const payment = this.paymentRepo.create({
        userId: payload.userId, packageId: payload.packageId,
        amount: payload.amount, status: PaymentStatus.PENDING,
      });
      await this.paymentRepo.save(payment);
      return { paymentId: payment.id, status: 'PENDING', message: 'Payment initiated' };
    }
    
    if (action === 'verify') {
      await this.paymentRepo.update(payload.paymentId, {
        status: PaymentStatus.COMPLETED,
        transactionId: payload.transactionId || 'txn_' + Date.now(),
        paymentMethod: payload.paymentMethod || 'sslcommerz',
      });
      
      const payment = await this.paymentRepo.findOne({ where: { id: payload.paymentId } });
      if (!payment) return { status: 'COMPLETED', message: 'Payment verified' };
      
      const pkg = await this.packageRepo.findOne({ where: { id: payment.packageId } });
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + (pkg?.durationDays || 30));
      
      await this.clientRepo.save({
        userId: payment.userId, packageId: payment.packageId,
        startDate, endDate, status: ClientStatus.ACTIVE,
      });
      
      await this.userRepo.update(payment.userId, { roles: ['CLIENT'] });
      
      return { status: 'COMPLETED', message: 'Payment verified, client upgraded' };
    }
    
    return this.paymentRepo.find({ where: { userId: payload.userId } });
  }
}
