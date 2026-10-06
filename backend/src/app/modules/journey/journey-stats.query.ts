import { SelectQueryBuilder } from 'typeorm';
import { JourneyStatus, JourneyTransactionType } from 'src/core/enums/journey';
import { JourneyQueryDTO } from './dtos/query-journey.dto';
import { JourneyStatsDTO } from './dtos/journey-stats.dto';
import {
  applyCustodySourceJoin,
  applyJourneyFilters,
  applySearchJoins,
  needsCustodySourceJoin,
  needsSearchJoins,
} from './journey-list-filters';
import { JourneyListScope } from './journey-list-scope.types';
import { Journey } from './journey.entity';

const LATEST_POLICY_DISTANCE = `(
  SELECT jp.trip_distance
  FROM journey_policies jp
  WHERE jp.journey_id = journey.id
  ORDER BY jp."policyDate" DESC NULLS LAST, jp.created_at DESC
  LIMIT 1
)`;

const LATEST_POLICY_BOOK_WEIGHT = `(
  SELECT jp."bookWeight"
  FROM journey_policies jp
  WHERE jp.journey_id = journey.id
  ORDER BY jp."policyDate" DESC NULLS LAST, jp.created_at DESC
  LIMIT 1
)`;

const LATEST_POLICY_TRIP_DATE = `(
  SELECT jp."tripDate"
  FROM journey_policies jp
  WHERE jp.journey_id = journey.id
  ORDER BY jp."policyDate" DESC NULLS LAST, jp.created_at DESC
  LIMIT 1
)`;

const JOURNEY_REVENUE = `COALESCE("journey"."actualRevenue", 0)`;

const JOURNEY_EXPENSES = `COALESCE((
  SELECT SUM(trx.amount)
  FROM journey_transactions trx
  WHERE trx.journey_id = "journey"."id"
    AND trx."transactionType" = '${JourneyTransactionType.EXPENSE}'
), 0)`;

function applyStatsJoins(
  qb: SelectQueryBuilder<Journey>,
  query: JourneyQueryDTO,
  scope?: JourneyListScope,
): void {
  if (needsSearchJoins(query)) {
    applySearchJoins(qb);
  }
  if (needsCustodySourceJoin(scope)) {
    applyCustodySourceJoin(qb);
  }
}

export async function runJourneyStatsQuery(
  qb: SelectQueryBuilder<Journey>,
  query: JourneyQueryDTO,
  scope?: JourneyListScope,
): Promise<JourneyStatsDTO> {
  applyStatsJoins(qb, query, scope);
  applyJourneyFilters(qb, query, scope);

  qb.select('COUNT(DISTINCT journey.id)', 'total')
    .addSelect(
      `COUNT(DISTINCT journey.id) FILTER (WHERE journey.tripStatus = '${JourneyStatus.DELEGATION_ISSUED}')`,
      'delegationIssued',
    )
    .addSelect(
      `COUNT(DISTINCT journey.id) FILTER (WHERE journey.tripStatus = '${JourneyStatus.POLICY_COLLECTED}')`,
      'policyCollected',
    )
    .addSelect(
      `COUNT(DISTINCT journey.id) FILTER (WHERE journey.tripStatus = '${JourneyStatus.INVOICE_ISSUED}')`,
      'invoiceIssued',
    )
    .addSelect(`COALESCE(SUM(${LATEST_POLICY_DISTANCE}), 0)`, 'totalDistance')
    .addSelect(`COALESCE(SUM(${LATEST_POLICY_BOOK_WEIGHT}), 0)`, 'totalBookWeight')
    .addSelect(`COALESCE(SUM(${JOURNEY_REVENUE}), 0)`, 'totalRevenue')
    .addSelect(`COALESCE(SUM(${JOURNEY_EXPENSES}), 0)`, 'totalExpenses');

  if (query.driverId || query.driverAssistantId) {
    qb.addSelect(`COUNT(DISTINCT ${LATEST_POLICY_TRIP_DATE})`, 'workingDays');
  }

  const row = await qb.getRawOne<{
    total: string;
    delegationIssued: string;
    policyCollected: string;
    invoiceIssued: string;
    totalDistance: string;
    totalBookWeight: string;
    totalRevenue: string;
    totalExpenses: string;
    workingDays?: string;
  }>();

  const total = Number(row?.total ?? 0);
  const totalRevenue = Number(row?.totalRevenue ?? 0);
  const totalExpenses = Number(row?.totalExpenses ?? 0);
  const stats: JourneyStatsDTO = {
    total,
    journeyCount: total,
    byStatus: [
      { status: JourneyStatus.DELEGATION_ISSUED, count: Number(row?.delegationIssued ?? 0) },
      { status: JourneyStatus.POLICY_COLLECTED, count: Number(row?.policyCollected ?? 0) },
      { status: JourneyStatus.INVOICE_ISSUED, count: Number(row?.invoiceIssued ?? 0) },
    ],
    totalDistance: Number(row?.totalDistance ?? 0),
    totalBookWeight: Number(row?.totalBookWeight ?? 0),
    totalRevenue,
    totalExpenses,
    totalProfit: totalRevenue - totalExpenses,
  };

  if (row?.workingDays !== undefined) {
    stats.workingDays = Number(row.workingDays);
  }

  if (query.driverId || query.driverAssistantId) {
    const currentQb = qb.connection
      .getRepository(Journey)
      .createQueryBuilder('journey')
      .leftJoin('journey.car', 'car');

    applyStatsJoins(currentQb, query, scope);
    applyJourneyFilters(currentQb, query, scope);

    currentQb
      .select('journey.id', 'id')
      .addSelect('car.code', 'carCode')
      .andWhere('journey.tripStatus != :_invoiceIssued', {
        _invoiceIssued: JourneyStatus.INVOICE_ISSUED,
      })
      .orderBy('journey.id', 'DESC')
      .limit(1);

    const current = await currentQb.getRawOne<{ id: string; carCode: string }>();
    if (current?.id) {
      stats.currentJourneyId = Number(current.id);
      stats.currentCarCode = current.carCode ?? undefined;
    }
  }

  return stats;
}
