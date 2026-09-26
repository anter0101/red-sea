// src/rel-car-owner/rel-car-owner.mapper.ts

import { RelCarOwner } from './rel-car-owner.entity';
import { Car } from '../car/car.entity';
import { BulkAssignOwnerDTO } from '../owner/dtos/bulk-assign.dto';
import { Owner } from '../owner/owner.entity';

export function mapBulkAssignCarOwnersToEntities(dto: BulkAssignOwnerDTO): RelCarOwner[] {
  const entities: RelCarOwner[] = [];

  dto.owners.forEach((input) => {
    const rel = new RelCarOwner();

    // Assign car by ID (no need to load it)
    rel.car = { id: dto.carId } as Car;

    // Assign owner by ID only — cascade save handled by service
    rel.owner = { id: input.id } as Owner;

    // Simple fields
    rel.percentage = input.percentage ?? null;
    rel.contractUrl = input.contractUrl ?? null;
    rel.notes = input.notes ?? null;

    entities.push(rel);
  });

  return entities;
}
