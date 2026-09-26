import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { Contact } from './contact.entity';
import { ContactDTO } from './dtos/contact.dto';
import { UpdateContactDTO } from './dtos/update-contact.dto';

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
  ) {}

  async findById(id: number): Promise<ContactDTO | undefined> {
    const result = await this.contactRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    return result || undefined;
  }

  async findByFields(options: FindOneOptions<ContactDTO>): Promise<ContactDTO | null> {
    return this.contactRepository.findOne(options);
  }

  async find(options: FindManyOptions<ContactDTO>): Promise<ContactDTO[] | null> {
    return this.contactRepository.find(options);
  }

  async findAndCount(options: FindManyOptions<ContactDTO>): Promise<[ContactDTO[], number]> {
    return this.contactRepository.findAndCount(options);
  }

  async save(
    contact: Contact | Contact[],
    creator?: string,
    manager?: EntityManager,
  ): Promise<ContactDTO | ContactDTO[]> {
    const repo = manager ? manager.getRepository(Contact) : this.contactRepository;
    const contacts = Array.isArray(contact) ? contact : [contact];

    const entities = contacts.map((c) =>
      repo.create({
        ...c,
        createdBy: creator,
        updatedBy: creator,
        createdAt: new Date(),
      }),
    );

    const saved = await repo.save(entities);

    return Array.isArray(contact) ? saved : saved[0];
  }

  async update(
    updateContactDTO: UpdateContactDTO | UpdateContactDTO[],
    updater?: string,
  ): Promise<ContactDTO | ContactDTO[]> {
    const contacts = Array.isArray(updateContactDTO) ? updateContactDTO : [updateContactDTO];

    const entities = contacts.map((c) =>
      this.contactRepository.create({
        ...c,
        updatedBy: updater,
        updatedAt: new Date(),
      }),
    );

    const updated = await this.contactRepository.save(entities);

    return Array.isArray(updateContactDTO) ? updated : updated[0];
  }

  async delete(id: number): Promise<void> {
    await this.contactRepository.delete(id);
  }
}
