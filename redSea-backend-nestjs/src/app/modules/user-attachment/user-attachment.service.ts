import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { UserAttachment } from './user-attachment.entity';
import { UserAttachmentDTO } from './dtos/user-attachment.dto';
import { UpdateUserAttachmentDTO } from './dtos/update-user-attachment.dto';

@Injectable()
export class UserAttachmentService {
  constructor(
    @InjectRepository(UserAttachment)
    private attachmentRepository: Repository<UserAttachment>,
  ) {}

  async findById(id: number): Promise<UserAttachmentDTO | undefined> {
    const result = await this.attachmentRepository.findOne({ where: { id } });
    return result || undefined;
  }

  async findByFields(
    options: FindOneOptions<UpdateUserAttachmentDTO>,
  ): Promise<UserAttachmentDTO | undefined> {
    const result = await this.attachmentRepository.findOne(options);
    return result || undefined;
  }

  async find(
    options: FindManyOptions<UpdateUserAttachmentDTO>,
  ): Promise<UserAttachment | undefined> {
    const result = await this.attachmentRepository.findOne(options);
    return result || undefined;
  }

  async save(attachment: UserAttachment, creator?: string): Promise<UserAttachment> {
    const now = new Date();
    attachment.createdAt = attachment.createdAt ?? now;
    attachment.updatedAt = now;

    if (creator) {
      attachment.createdBy = attachment.createdBy ?? creator;
      attachment.updatedBy = creator;
    }

    return await this.attachmentRepository.save(attachment);
  }

  async update(attachment: UserAttachment, updater?: string): Promise<UserAttachment> {
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
