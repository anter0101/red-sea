import { Brackets, SelectQueryBuilder } from 'typeorm';
import {
  applyJourneyFilters,
  needsCustodySourceJoin,
  needsSearchJoins,
} from './journey-list-filters';
import { JourneyQueryDTO } from './dtos/query-journey.dto';
import { Journey } from './journey.entity';

function createMockQb(): SelectQueryBuilder<Journey> {
  const calls: { method: string; args: unknown[] }[] = [];
  const qb = {
    andWhere: jest.fn((...args: unknown[]) => {
      calls.push({ method: 'andWhere', args });
      return qb;
    }),
    setParameter: jest.fn((...args: unknown[]) => {
      calls.push({ method: 'setParameter', args });
      return qb;
    }),
    calls,
  } as unknown as SelectQueryBuilder<Journey> & { calls: typeof calls };
  return qb;
}

describe('journey-list-filters', () => {
  it('needsSearchJoins returns true only when search is non-empty', () => {
    expect(needsSearchJoins({ search: 'abc' })).toBe(true);
    expect(needsSearchJoins({ search: '  ' })).toBe(false);
    expect(needsSearchJoins({})).toBe(false);
  });

  it('needsCustodySourceJoin returns true when role scope is set', () => {
    expect(needsCustodySourceJoin({ custodySourceUserId: 5 })).toBe(true);
    expect(needsCustodySourceJoin(undefined)).toBe(false);
  });

  it('applyJourneyFilters adds direct FK scope conditions', () => {
    const qb = createMockQb();
    applyJourneyFilters(qb, {
      driverId: 1,
      carId: 2,
      trailerId: 3,
      clientId: 4,
      driverAssistantId: 5,
    });

    expect(qb.andWhere).toHaveBeenCalledWith('journey.driver_id = :_jDriverId', {
      _jDriverId: 1,
    });
    expect(qb.andWhere).toHaveBeenCalledWith('journey.car_id = :_jCarId', { _jCarId: 2 });
    expect(qb.andWhere).toHaveBeenCalledWith('journey.trailer_id = :_jTrailerId', {
      _jTrailerId: 3,
    });
    expect(qb.andWhere).toHaveBeenCalledWith('journey.client_id = :_jClientId', {
      _jClientId: 4,
    });
    expect(qb.andWhere).toHaveBeenCalledWith('journey.assistant_id = :_jAssistantId', {
      _jAssistantId: 5,
    });
  });

  it('applyJourneyFilters adds branch OR EXISTS filter', () => {
    const qb = createMockQb();
    applyJourneyFilters(qb, { branchId: 7 });

    expect(qb.andWhere).toHaveBeenCalledWith(expect.any(Brackets));
    expect(qb.setParameter).toHaveBeenCalledWith('_jBranchId', 7);
  });

  it('applyJourneyFilters matches any status in tripStatuses unless tripStatus is set', () => {
    const many = createMockQb();
    applyJourneyFilters(many, {
      tripStatuses: ['DELEGATION_ISSUED', 'POLICY_COLLECTED'],
    } as JourneyQueryDTO);
    expect(many.andWhere).toHaveBeenCalledWith('journey.tripStatus IN (:..._jstatuses)', {
      _jstatuses: ['DELEGATION_ISSUED', 'POLICY_COLLECTED'],
    });

    const one = createMockQb();
    applyJourneyFilters(one, {
      tripStatus: 'POLICY_COLLECTED',
      tripStatuses: ['DELEGATION_ISSUED', 'POLICY_COLLECTED'],
    } as JourneyQueryDTO);
    expect(one.andWhere).toHaveBeenCalledWith('journey.tripStatus = :_jstatus', {
      _jstatus: 'POLICY_COLLECTED',
    });
    expect(one.andWhere).not.toHaveBeenCalledWith(
      'journey.tripStatus IN (:..._jstatuses)',
      expect.anything(),
    );
  });

  it('applyJourneyFilters stacks role scope with query scope', () => {
    const qb = createMockQb();
    applyJourneyFilters(qb, { driverId: 9 }, { custodySourceUserId: 10 });

    expect(qb.andWhere).toHaveBeenCalledWith('custodySourceUser.id = :_scopedCustodySourceUserId', {
      _scopedCustodySourceUserId: 10,
    });
    expect(qb.andWhere).toHaveBeenCalledWith('journey.driver_id = :_jDriverId', {
      _jDriverId: 9,
    });
  });
});
