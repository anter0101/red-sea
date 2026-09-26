import { RelTrailerOwner } from './rel-trailer-owner.entity';
import { Trailer } from '../trailer/trailer.entity';
import { BulkAssignOwnerDTO } from '../owner/dtos/bulk-assign.dto';
import { Owner } from '../owner/owner.entity';

/**
 * Maps BulkAssignOwnerDTO → array of RelTrailerOwner entities
 * Used for bulk assigning owners to a trailer.
 */
export function mapBulkAssignTrailerOwnersToEntities(dto: BulkAssignOwnerDTO): RelTrailerOwner[] {
  const entities: RelTrailerOwner[] = [];

  dto.owners.forEach((input) => {
    const rel = new RelTrailerOwner();

    // Assign trailer by ID
    rel.trailer = { id: dto.trailerId } as Trailer;

    // Assign owner by ID only (no need to fetch)
    rel.owner = { id: input.id } as Owner;

    // Simple fields
    rel.percentage = input.percentage ?? null;
    rel.contractUrl = input.contractUrl ?? null;
    rel.notes = input.notes ?? null;

    entities.push(rel);
  });

  return entities;
}
