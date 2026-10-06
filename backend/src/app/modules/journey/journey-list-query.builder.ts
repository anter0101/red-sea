import { SelectQueryBuilder } from 'typeorm';
import { JourneyTransactionCategoryType } from 'src/core/enums/journey';
import { JourneyQueryDTO } from './dtos/query-journey.dto';
import { JourneyListScope } from './journey-list-scope.types';
import { applyJourneyFilters } from './journey-list-filters';
import { Journey } from './journey.entity';
import { JourneyPolicy } from '../journey-goods/journey-policy.entity';

const SORT_MAP: Record<string, string> = {
  delegateNumber: 'journey.delegateNumber',
  policyDate: 'journeyPolicy.policyDate',
  tripDistance: 'journeyPolicy.tripDistance',
  createdAt: 'journey.createdAt',
  totalProfit: 'totalProfit',
  totalRevenue: 'totalRevenue',
  totalExpenses: 'totalExpenses',
  driverName: 'driverName',
  'journey.delegateNumber': 'journey.delegateNumber',
  'journeyPolicy.policyDate': 'journeyPolicy.policyDate',
  'journeyPolicy.tripDistance': 'journeyPolicy.tripDistance',
};

export function buildJourneyListQuery(
  qb: SelectQueryBuilder<Journey>,
  query: JourneyQueryDTO,
  scope: JourneyListScope | undefined,
  page: number,
  pageSize: number,
  sortField?: string,
  sortOrder: 'ASC' | 'DESC' = 'ASC',
): SelectQueryBuilder<Journey> {
  qb.leftJoinAndSelect('journey.driver', 'driver')
    .leftJoinAndSelect('driver.user', 'driverUser')
    .leftJoinAndSelect('journey.assistant', 'assistant')
    .leftJoinAndSelect('journey.car', 'car')
    .leftJoinAndSelect('journey.trailer', 'trailer')
    .leftJoinAndSelect('journey.client', 'client')
    .leftJoinAndSelect('journey.custodySource', 'custodySource')
    .leftJoinAndSelect('custodySource.user', 'custodySourceUser');

  const latestPolicySubquery = qb
    .subQuery()
    .select('jp.id')
    .from(JourneyPolicy, 'jp')
    .where('jp.journey_id = journey.id')
    .orderBy('jp.policyDate', 'DESC', 'NULLS LAST')
    .addOrderBy('jp.createdAt', 'DESC')
    .limit(1)
    .getQuery();

  qb.leftJoinAndSelect(
    'journey.journeyPolicies',
    'journeyPolicy',
    `journeyPolicy.id = ${latestPolicySubquery}`,
  )
    .leftJoinAndSelect('journeyPolicy.employee', 'policyEmployee')
    .leftJoinAndSelect('policyEmployee.user', 'policyEmployeeUser')
    .leftJoinAndSelect('journeyPolicy.deliveryArea', 'deliveryArea')
    .leftJoinAndSelect('journeyPolicy.deliveryGov', 'deliveryGov')
    .leftJoinAndSelect('journey.journeyTransactions', 'trx');

  qb.select('journey.id', 'id')
    .addSelect('journey.createdAt', 'createdAt')
    .addSelect('journey.delegateNumber', 'delegateNumber')
    .addSelect('journey.delegateDate', 'delegateDate')
    .addSelect('journey.tripStatus', 'tripStatus')
    .addSelect('client.id', 'clientId')
    .addSelect('client.name', 'clientName')
    .addSelect('journey.packingType', 'packingType')
    .addSelect('driver.id', 'driverId')
    .addSelect("CONCAT(driverUser.firstName, ' ', driverUser.lastName)", 'driverName')
    .addSelect('driverUser.code', 'driverCode')
    .addSelect('assistant.id', 'assistantId')
    .addSelect("CONCAT(assistant.firstName, ' ', assistant.lastName)", 'assistantName')
    .addSelect('assistant.code', 'assistantCode')
    .addSelect('car.id', 'carId')
    .addSelect('car.plateNumber', 'carPlateNumber')
    .addSelect('car.plateLetters', 'carPlateLetters')
    .addSelect('car.code', 'carCode')
    .addSelect('car.cylinders', 'carCylinders')
    .addSelect('car.axleCount', 'carAxleCount')
    .addSelect('car.ownerShip', 'vehicleType')
    .addSelect('trailer.id', 'trailerId')
    .addSelect('trailer.plateNumber', 'trailerPlateNumber')
    .addSelect('trailer.plateLetters', 'trailerPlateLetters')
    .addSelect('journeyPolicy.policyNo', 'policyNo')
    .addSelect('journeyPolicy.policyDate', 'policyDate')
    .addSelect('journeyPolicy.bookWeight', 'bookWeight')
    .addSelect('journeyPolicy.actualWeight', 'actualWeight')
    .addSelect('journeyPolicy.deliveryWeight', 'deliveryWeight')
    .addSelect('journeyPolicy.shortageQty', 'shortageQty')
    .addSelect('journeyPolicy.loadingDate', 'loadingDate')
    .addSelect('journeyPolicy.loadingPermitNo', 'loadingPermitNo')
    .addSelect('journeyPolicy.archiveNo', 'archiveNo')
    .addSelect('journeyPolicy.entryTimeFactory', 'entryTimeFactory')
    .addSelect('journeyPolicy.exitTimeFactory', 'exitTimeFactory')
    .addSelect('journeyPolicy.tripDate', 'tripDate')
    .addSelect('journeyPolicy.tripDistance', 'tripDistance')
    .addSelect('deliveryArea.name', 'deliveryAreaName')
    .addSelect('deliveryGov.name', 'deliveryGovName')
    .addSelect(
      "CONCAT(policyEmployeeUser.firstName, ' ', policyEmployeeUser.lastName)",
      'deliveryDelegate',
    )
    .addSelect(
      "CONCAT(policyEmployeeUser.firstName, ' ', policyEmployeeUser.lastName)",
      'policiesReceivedAtAdmin',
    )
    .addSelect(
      `COALESCE((
          SELECT SUM(trx.amount)
          FROM journey_transactions trx
          WHERE trx.journey_id = "journey"."id"
            AND trx."transactionType" = 'EXPENSE'
        ), 0)`,
      'totalExpenses',
    )
    .addSelect(
      `COALESCE((
          SELECT SUM(nolon_trx.amount)
          FROM journey_transactions nolon_trx
          WHERE nolon_trx.journey_id = "journey"."id"
            AND nolon_trx."transactionType" = 'EXPENSE'
            AND nolon_trx.category IN (
              '${JourneyTransactionCategoryType.NOLON_FEES}',
              '${JourneyTransactionCategoryType.DRIVER_COMMISSION}',
              '${JourneyTransactionCategoryType.ASSISTANT_COMMISSION}'
            )
        ), 0)`,
      'nolonExpense',
    )
    .addSelect(
      `MAX(CASE WHEN trx.category = '${JourneyTransactionCategoryType.DIESEL_FEES}' THEN trx.quantity END)`,
      'fuelLiters',
    )
    .addSelect(
      `MAX(CASE WHEN trx.category = '${JourneyTransactionCategoryType.DIESEL_FEES}' THEN trx.amount END)`,
      'dieselValue',
    )
    .addSelect(
      `MAX(CASE WHEN trx.category = '${JourneyTransactionCategoryType.OTHER_EXPENSES}' THEN trx.amount END)`,
      'otherExpenses',
    )
    .addSelect(
      `MAX(CASE WHEN trx.category = '${JourneyTransactionCategoryType.PORT_FEES}' THEN trx.amount END)`,
      'portFees',
    )
    .addSelect(
      `MAX(CASE WHEN trx.category = '${JourneyTransactionCategoryType.CROSSING_FEES}' THEN trx.amount END)`,
      'transitFees',
    )
    .addSelect(
      `MAX(CASE WHEN trx.category = '${JourneyTransactionCategoryType.SCALE_FEES}' THEN trx.amount END)`,
      'scaleFees',
    )
    .addSelect(
      `MAX(CASE WHEN trx.category = '${JourneyTransactionCategoryType.CARD_FEES}' THEN trx.amount END)`,
      'cardFees',
    )
    .addSelect(
      `MAX(CASE WHEN trx.category = '${JourneyTransactionCategoryType.CARD_FEES}' THEN trx.description END)`,
      'cardName',
    )
    .addSelect('journey.actualRevenue', 'actualRevenue')
    .addSelect(`COALESCE("journey"."actualRevenue", 0)`, 'totalRevenue')
    .addSelect(
      `(
          COALESCE("journey"."actualRevenue", 0)
          - COALESCE((
            SELECT SUM(trx.amount)
            FROM journey_transactions trx
            WHERE trx.journey_id = "journey"."id"
              AND trx."transactionType" = 'EXPENSE'
          ), 0)
        )`,
      'totalProfit',
    )
    .addSelect('NULL', 'notes')
    .addSelect('NULL', 'collectionStatus')
    .addSelect('NULL', 'electronicInvoiceNo')
    .addSelect(
      `(SELECT inv.code
        FROM invoice_journeys ij
        INNER JOIN invoices inv ON inv.id = ij.invoice_id
        WHERE ij.journey_id = "journey"."id" AND ij.deleted_at IS NULL
        ORDER BY ij.id DESC
        LIMIT 1)`,
      'preliminaryInvoiceNo',
    )
    .addSelect('NULL', 'loadingWaitingTime')
    .addSelect('NULL', 'loadingDuration')
    .addSelect('0', 'fuelConsumptionPer1000km');

  qb.groupBy('journey.id')
    .addGroupBy('driver.id')
    .addGroupBy('driverUser.id')
    .addGroupBy('assistant.id')
    .addGroupBy('car.id')
    .addGroupBy('trailer.id')
    .addGroupBy('client.id')
    .addGroupBy('client.name')
    .addGroupBy('journeyPolicy.id')
    .addGroupBy('deliveryArea.id')
    .addGroupBy('deliveryGov.id')
    .addGroupBy('policyEmployee.id')
    .addGroupBy('policyEmployeeUser.id');

  applyJourneyFilters(qb, query, scope);

  const orderExpr = (sortField && SORT_MAP[sortField]) || 'journey.id';
  const direction: 'ASC' | 'DESC' = sortField ? sortOrder : 'DESC';
  // limit/offset still emit SQL when the query has joins. skip/take do not, and getRawMany never applies them later.
  qb.orderBy(orderExpr, direction).offset(page * pageSize).limit(pageSize);

  return qb;
}
