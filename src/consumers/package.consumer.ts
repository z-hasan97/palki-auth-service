import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Package } from '../entities/package.entity';

@Injectable()
export class PackageConsumer {
  constructor(
    @InjectRepository(Package) private readonly packageRepo: Repository<Package>,
  ) {}

  async handle(payload: any) {
    const packages = await this.packageRepo.find();
    return packages;
  }
}
