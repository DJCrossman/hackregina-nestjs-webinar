import { Injectable } from '@nestjs/common';
import { Cat } from './cat.interface';
import { CatEntity } from './cat.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class CatsService {
  constructor(
    @InjectRepository(CatEntity)
    private repository: Repository<CatEntity>,
  ) {}
  private readonly cats: Cat[] = [];

  async create(cat: Cat): Promise<Cat> {
    return this.repository.save(cat)
  }

  async findAll(): Promise<Cat[]> {
    return this.repository.find()
  }
}
