import { Brackets, SelectQueryBuilder } from 'typeorm';
import { JourneyQueryDTO } from './dtos/query-journey.dto';
import { JourneyListScope } from './journey-list-scope.types';
import { Journey } from './journey.entity';

export function needsSearchJoins(query: JourneyQueryDTO): boolean {
  return Boolean(query.search?.trim());
}

export function needsCustodySourceJoin(scope?: JourneyListScope): boolean {
  return Boolean(scope?.custodySourceUserId);
}

export function applySearchJoins(qb: SelectQueryBuilder<Journey>): void {
  qb.leftJoin('journey.driver', 'driver')
    .leftJoin('driver.user', 'driverUser')
    .leftJoin('journey.car', 'car')
    .leftJoin('journey.client', 'client')
    .leftJoin('journey.journeyPolicies', 'journeyPolicy')
    .leftJoin('journeyPolicy.deliveryArea', 'deliveryArea')
    .leftJoin('journeyPolicy.deliveryGov', 'deliveryGov');
}

export function applyCustodySourceJoin(qb: SelectQueryBuilder<Journey>): void {
  qb.leftJoin('journey.custodySource', 'custodySource').leftJoin(
    'custodySource.user',
    'custodySourceUser',
  );
}

export function applyJourneyFilters(
  qb: SelectQueryBuilder<Journey>,
  query: JourneyQueryDTO,
  scope?: JourneyListScope,
): void {
  if (scope?.custodySourceUserId) {
    qb.andWhere('custodySourceUser.id = :_scopedCustodySourceUserId', {
      _scopedCustodySourceUserId: scope.custodySourceUserId,
    });
  }

  if (query.driverId) {
    qb.andWhere('journey.driver_id = :_jDriverId', { _jDriverId: query.driverId });
  }
  if (query.carId) {
    qb.andWhere('journey.car_id = :_jCarId', { _jCarId: query.carId });
  }
  if (query.trailerId) {
    qb.andWhere('journey.trailer_id = :_jTrailerId', { _jTrailerId: query.trailerId });
  }
  if (query.clientId) {
    qb.andWhere('journey.client_id = :_jClientId', { _jClientId: query.clientId });
  }
  if (query.driverAssistantId) {
    qb.andWhere('journey.assistant_id = :_jAssistantId', {
      _jAssistantId: query.driverAssistantId,
    });
  }

  if (query.branchId) {
    qb.andWhere(
      new Brackets(bqb => {
        bqb
          .where(
            `EXISTS (
              SELECT 1 FROM employees cs
              WHERE cs.id = journey.custody_source_id AND cs."branchId" = :_jBranchId
            )`,
          )
          .orWhere(
            `EXISTS (
              SELECT 1 FROM journey_policies jp
              INNER JOIN employees pe ON pe.id = jp.employee_id AND pe."branchId" = :_jBranchId
              WHERE jp.journey_id = journey.id
              ORDER BY jp."policyDate" DESC NULLS LAST, jp.created_at DESC
              LIMIT 1
            )`,
          );
      }),
    );
    qb.setParameter('_jBranchId', query.branchId);
  }

  if (query.search) {
    qb.andWhere(
      new Brackets(bqb => {
        bqb
          .orWhere('LOWER(journey.delegateNumber) LIKE LOWER(:_jterm)')
          .orWhere('LOWER(journey.direction) LIKE LOWER(:_jterm)')
          .orWhere('LOWER(journey.cementGrade) LIKE LOWER(:_jterm)')
          .orWhere('LOWER(journey.sellingOrderNo) LIKE LOWER(:_jterm)')
          .orWhere('LOWER(journey.receivedCompany) LIKE LOWER(:_jterm)')
          .orWhere('LOWER(car.plateNumber) LIKE LOWER(:_jterm)')
          .orWhere('LOWER(car.plateLetters) LIKE LOWER(:_jterm)')
          .orWhere('LOWER(car.code) LIKE LOWER(:_jterm)')
          .orWhere('LOWER(driverUser.firstName) LIKE LOWER(:_jterm)')
          .orWhere('LOWER(driverUser.lastName) LIKE LOWER(:_jterm)')
          .orWhere('LOWER(client.name) LIKE LOWER(:_jterm)')
          .orWhere('LOWER(client.companyCode) LIKE LOWER(:_jterm)')
          .orWhere('LOWER(journeyPolicy.policyNo) LIKE LOWER(:_jterm)')
          .orWhere('LOWER(journeyPolicy.archiveNo) LIKE LOWER(:_jterm)')
          .orWhere('LOWER(journeyPolicy.loadingPermitNo) LIKE LOWER(:_jterm)')
          .orWhere('LOWER(deliveryArea.name) LIKE LOWER(:_jterm)')
          .orWhere('LOWER(deliveryGov.name) LIKE LOWER(:_jterm)');
      }),
    );
    qb.setParameter('_jterm', `%${query.search}%`);
  }

  if (query.invoiced === true) {
    qb.andWhere(
      `EXISTS (
        SELECT 1 FROM invoice_journeys ij
        WHERE ij.journey_id = journey.id AND ij.deleted_at IS NULL
      )`,
    );
  } else if (query.invoiced === false) {
    qb.andWhere(
      `NOT EXISTS (
        SELECT 1 FROM invoice_journeys ij
        WHERE ij.journey_id = journey.id AND ij.deleted_at IS NULL
      )`,
    );
  }

  if (query.tripStatus) {
    qb.andWhere('journey.tripStatus = :_jstatus', { _jstatus: query.tripStatus });
  } else if (query.tripStatuses?.length) {
    qb.andWhere('journey.tripStatus IN (:..._jstatuses)', { _jstatuses: query.tripStatuses });
  }

  if (query.createdAtFrom) {
    qb.andWhere('journey.createdAt >= :_jcfrom', { _jcfrom: new Date(query.createdAtFrom) });
  }
  if (query.createdAtTo) {
    qb.andWhere('journey.createdAt <= :_jcto', { _jcto: new Date(query.createdAtTo) });
  }
  if (query.updatedAtFrom) {
    qb.andWhere('journey.updatedAt >= :_jufrom', { _jufrom: new Date(query.updatedAtFrom) });
  }
  if (query.updatedAtTo) {
    qb.andWhere('journey.updatedAt <= :_juto', { _juto: new Date(query.updatedAtTo) });
  }
}
