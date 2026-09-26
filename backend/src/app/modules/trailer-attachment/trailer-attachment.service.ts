// src/trailer-attachment/trailer-attachment.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { TrailerAttachment } from './trailer-attachment.entity';
import { UpdateTrailerAttachmentDTO } from './dtos/update-trailer-attachment.dto';

@Injectable()
export class TrailerAttachmentService {
  constructor(
    @InjectRepository(TrailerAttachment)
    private attachmentRepository: Repository<TrailerAttachment>,
  ) {}

  // Return ENTITY
  async findById(id: number): Promise<TrailerAttachment | undefined> {
    const result = await this.attachmentRepository.findOne({ where: { id } });
    return result || undefined;
  }

  async findByFields(
    options: FindOneOptions<UpdateTrailerAttachmentDTO>,
  ): Promise<TrailerAttachment | undefined> {
    const result = await this.attachmentRepository.findOne(options);
    return result || undefined;
  }

  async find(options: FindManyOptions<TrailerAttachment>): Promise<TrailerAttachment | undefined> {
    const result = await this.attachmentRepository.findOne(options);
    return result || undefined;
  }

  async save(attachment: TrailerAttachment, creator?: string): Promise<TrailerAttachment> {
    const now = new Date();
    attachment.createdAt = attachment.createdAt ?? now;
    attachment.updatedAt = now;

    if (creator) {
      attachment.createdBy = attachment.createdBy ?? creator;
      attachment.updatedBy = creator;
    }

    return await this.attachmentRepository.save(attachment);
  }

  async update(attachment: TrailerAttachment, updater?: string): Promise<TrailerAttachment> {
    const now = new Date();
    if (updater) attachment.updatedBy = updater;
    attachment.updatedAt = now;
    return await this.attachmentRepository.save(attachment);
  }

  async delete(id: number): Promise<void> {
    await this.attachmentRepository.delete(id);
  }
}
