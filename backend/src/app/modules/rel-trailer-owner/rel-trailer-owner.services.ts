import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { RelTrailerOwner } from './rel-trailer-owner.entity';
import { BulkAssignOwnerDTO } from '../owner/dtos/bulk-assign.dto';
import { mapBulkAssignTrailerOwnersToEntities } from './rel-trailer-owner.mapper';

@Injectable()
export class RelTrailerOwnerService {
  constructor(
    @InjectRepository(RelTrailerOwner)
    private readonly relTrailerOwnerRepo: Repository<RelTrailerOwner>,
  ) {}

  async bulkAssignOwners(dto: BulkAssignOwnerDTO, user: string) {
    const relations = mapBulkAssignTrailerOwnersToEntities(dto);
    const ownerIds = relations.map((rel) => rel.owner.id);

    // Find existing relationships for this trailer and these owners
    const existingRelations = await this.relTrailerOwnerRepo.find({
      where: {
        trailer: { id: dto.trailerId },
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

    return await this.relTrailerOwnerRepo.save(toSave);
  }
}
