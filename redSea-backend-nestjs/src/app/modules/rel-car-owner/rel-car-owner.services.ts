// src/rel-car-owner/rel-car-owner.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { RelCarOwner } from './rel-car-owner.entity';
import { BulkAssignOwnerDTO } from '../owner/dtos/bulk-assign.dto';
import { mapBulkAssignCarOwnersToEntities } from './rel-car-owner.mapper';

@Injectable()
export class RelCarOwnerService {
  constructor(
    @InjectRepository(RelCarOwner)
    private readonly relCarOwnerRepo: Repository<RelCarOwner>,
  ) {}

  async bulkAssignOwners(dto: BulkAssignOwnerDTO, user: string) {
    const relations = mapBulkAssignCarOwnersToEntities(dto);
    const ownerIds = relations.map((rel) => rel.owner.id);

    // Find existing relationships for this car and these owners
    const existingRelations = await this.relCarOwnerRepo.find({
      where: {
        car: { id: dto.carId },
        owner: { id: In(ownerIds) },
      },
      relations: ['owner'],
    });

    const existingMap = new Map(existingRelations.map((rel) => [rel.owner.id, rel]));

    // Prepare relationships: update existing, keep new ones
    const toSave = relations.map((newRel) => {
      const existing = existingMap.get(newRel.owner.id);
      if (existing) {
        // Update existing relationship
        existing.percentage = newRel.percentage;
        existing.contractUrl = newRel.contractUrl;
        existing.notes = newRel.notes;
        existing.updatedBy = user;
        return existing;
      }
      // New relationship
      newRel.createdBy = user;
      newRel.updatedBy = user;
      return newRel;
    });

    return await this.relCarOwnerRepo.save(toSave);
  }
}
