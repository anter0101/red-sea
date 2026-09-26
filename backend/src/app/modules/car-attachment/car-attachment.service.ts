import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { CarAttachment } from './car-attachment.entity';
import { CarAttachmentDTO } from './dtos/car-attachment.dto';
import { UpdateCarAttachmentDTO } from './dtos/update-car-attachment.dto';

@Injectable()
export class CarAttachmentService {
  constructor(
    @InjectRepository(CarAttachment)
    private attachmentRepository: Repository<CarAttachment>,
  ) {}

  async findById(id: number): Promise<CarAttachmentDTO | undefined> {
    const result = await this.attachmentRepository.findOne({ where: { id } });
    return result || undefined;
  }

  async findByFields(
    options: FindOneOptions<UpdateCarAttachmentDTO>,
  ): Promise<CarAttachmentDTO | undefined> {
    const result = await this.attachmentRepository.findOne(options);
    return result || undefined;
  }

  async find(options: FindManyOptions<UpdateCarAttachmentDTO>): Promise<CarAttachment | undefined> {
    const result = await this.attachmentRepository.findOne(options);
    return result || undefined;
  }

  async save(attachment: CarAttachment, creator?: string): Promise<CarAttachment> {
    const now = new Date();
    attachment.createdAt = attachment.createdAt ?? now;
    attachment.updatedAt = now;

    if (creator) {
      attachment.createdBy = attachment.createdBy ?? creator;
      attachment.updatedBy = creator;
    }

    return await this.attachmentRepository.save(attachment);
  }

  async update(attachment: CarAttachment, updater?: string): Promise<CarAttachment> {
    const now = new Date();

    if (updater) {
      attachment.updatedBy = updater;
    }

    attachment.updatedAt = now;

    return await this.attachmentRepository.save(attachment);
  }

  async delete(id: number): Promise<void> {
    await this.attachmentRepository.delete(id);
  }
}
