import { baseColumns } from 'src/core/utils/base.migration';
import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

/**
 * Journey workflow statuses (01-journey):
 * - NOTSTATED / ONROAD → DELEGATION_ISSUED (in-progress delegations)
 * - COMPLETED → POLICY_COLLECTED (policy saved, pre-invoice)
 * - CANCELLED → DELEGATION_ISSUED (keep visible; re-assign manually if needed)
 * Also drops journey_policies.tripDuration (removed from product).
 */
export class JourneyWorkflowStatuses1775400068000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE journeys SET "tripStatus" = 'DELEGATION_ISSUED'
      WHERE "tripStatus" IN ('NOTSTATED', 'ONROAD', 'CANCELLED')
    `);
    await queryRunner.query(`
      UPDATE journeys SET "tripStatus" = 'POLICY_COLLECTED'
      WHERE "tripStatus" = 'COMPLETED'
    `);

    await queryRunner.query(`
      ALTER TABLE journey_policies DROP COLUMN IF EXISTS "tripDuration"
    `);

    const [idColumn, ...otherBaseColumns] = baseColumns;

    await queryRunner.createTable(
      new Table({
        name: 'journey_status_events',
        columns: [
          idColumn,
          { name: 'journey_id', type: 'int4', isNullable: false },
          { name: 'fromStatus', type: 'varchar', length: '50', isNullable: true },
          { name: 'toStatus', type: 'varchar', length: '50', isNullable: false },
          { name: 'changedBy', type: 'varchar', length: '255', isNullable: true },
          ...otherBaseColumns,
        ],
        foreignKeys: [
          new TableForeignKey({
            name: 'FK_journey_status_events_journey_id',
            columnNames: ['journey_id'],
            referencedTableName: 'journeys',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
        ],
        indices: [
          new TableIndex({
            name: 'IDX_journey_status_events_journey_id',
            columnNames: ['journey_id'],
          }),
        ],
      }),
    );

    await queryRunner.query(`
      INSERT INTO journey_status_events (journey_id, "fromStatus", "toStatus", created_at)
      SELECT id, NULL, "tripStatus", COALESCE(created_at, NOW())
      FROM journeys
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('journey_status_events');
    await queryRunner.query(`
      ALTER TABLE journey_policies ADD COLUMN IF NOT EXISTS "tripDuration" varchar(10)
    `);
    await queryRunner.query(`
      UPDATE journeys SET "tripStatus" = 'NOTSTATED'
      WHERE "tripStatus" = 'DELEGATION_ISSUED'
    `);
    await queryRunner.query(`
      UPDATE journeys SET "tripStatus" = 'COMPLETED'
      WHERE "tripStatus" = 'POLICY_COLLECTED'
    `);
    await queryRunner.query(`
      UPDATE journeys SET "tripStatus" = 'INVOICE_ISSUED'
      WHERE "tripStatus" = 'INVOICE_ISSUED'
    `);
  }
}
