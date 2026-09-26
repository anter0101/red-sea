import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, FindOneOptions } from 'typeorm';
import { TransactionLine } from './transaction-line.entity';

@Injectable()
export class TransactionLineService {
  constructor(
    @InjectRepository(TransactionLine)
    private readonly transactionLineRepository: Repository<TransactionLine>,
  ) {}

  async findById(id: number): Promise<TransactionLine | undefined> {
    const result = await this.transactionLineRepository.findOne({
      where: { id },
      relations: ['account', 'transaction'],
    });
    return result || undefined;
  }

  async findByFields(
    options: FindOneOptions<TransactionLine>,
  ): Promise<TransactionLine | undefined> {
    const result = await this.transactionLineRepository.findOne(options);
    return result || undefined;
  }

  async find(options: FindManyOptions<TransactionLine>): Promise<TransactionLine[]> {
    return await this.transactionLineRepository.find(options);
  }

  async findAndCount(
    options: FindManyOptions<TransactionLine>,
  ): Promise<[TransactionLine[], number]> {
    return this.transactionLineRepository.findAndCount(options);
  }

  async save(line: TransactionLine, creator?: string): Promise<TransactionLine> {
    const now = new Date();
    line.createdAt = line.createdAt ?? now;
    line.updatedAt = now;

    if (creator) {
      line.createdBy = line.createdBy ?? creator;
      line.updatedBy = creator;
    }

    return await this.transactionLineRepository.save(line);
  }

  async update(line: TransactionLine, updater?: string): Promise<TransactionLine> {
    const now = new Date();
    line.updatedAt = now;
    if (updater) line.updatedBy = updater;
    return await this.transactionLineRepository.save(line);
  }

  async delete(id: number): Promise<void> {
    await this.transactionLineRepository.delete(id);
  }
}
