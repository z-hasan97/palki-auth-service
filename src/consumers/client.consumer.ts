import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from '../entities/client.entity';

@Injectable()
export class ClientConsumer {
  constructor(@InjectRepository(Client) private readonly clientRepo: Repository<Client>) {}

  async handle(payload: any) {
    return this.clientRepo.find({ relations: { user: true, package: true } });
  }
}
