import { SelectQueryBuilder } from 'typeorm';
import { JourneyQueryDTO } from './dtos/query-journey.dto';
import {
  applyCustodySourceJoin,
  applyJourneyFilters,
  applySearchJoins,
  needsCustodySourceJoin,
  needsSearchJoins,
} from './journey-list-filters';
import { JourneyListScope } from './journey-list-scope.types';
import { Journey } from './journey.entity';

export function buildJourneyCountQuery(
  qb: SelectQueryBuilder<Journey>,
  query: JourneyQueryDTO,
  scope?: JourneyListScope,
): SelectQueryBuilder<Journey> {
  if (needsSearchJoins(query)) {
    applySearchJoins(qb);
  }

  if (needsCustodySourceJoin(scope)) {
    applyCustodySourceJoin(qb);
  }

  applyJourneyFilters(qb, query, scope);

  return qb;
}
