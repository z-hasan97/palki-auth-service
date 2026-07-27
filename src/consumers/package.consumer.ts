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
    const data = payload.payload || payload;
    const topic = data.commandType || payload.commandType || '';

    if (topic === 'package.findAll') {
      const packages = await this.packageRepo.find({ where: { isActive: true } });
      console.log('Packages found:', packages.length);
      return packages.map(p => ({
        id: p.id,
        name: p.name,
        price: p.price,
        durationDays: p.durationDays,
        features: p.features,
        isActive: p.isActive,
      }));
    }

    if (topic === 'package.findOne') {
      const pkg = await this.packageRepo.findOne({ where: { id: data.id } as any });
      return pkg ? {
        id: pkg.id, name: pkg.name, price: pkg.price,
        durationDays: pkg.durationDays, features: pkg.features, isActive: pkg.isActive,
      } : null;
    }

    const packages = await this.packageRepo.find({ where: { isActive: true } });
    return packages.map(p => ({
      id: p.id, name: p.name, price: p.price,
      durationDays: p.durationDays, features: p.features, isActive: p.isActive,
    }));
  }
}
