import { MigrationInterface, QueryRunner, TableIndex } from 'typeorm';

export class AddJourneyListIndexes1775400067000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createIndex(
      'journeys',
      new TableIndex({ name: 'IDX_journeys_driver_id', columnNames: ['driver_id'] }),
    );
    await queryRunner.createIndex(
      'journeys',
      new TableIndex({ name: 'IDX_journeys_car_id', columnNames: ['car_id'] }),
    );
    await queryRunner.createIndex(
      'journeys',
      new TableIndex({ name: 'IDX_journeys_trailer_id', columnNames: ['trailer_id'] }),
    );
    await queryRunner.createIndex(
      'journeys',
      new TableIndex({ name: 'IDX_journeys_client_id', columnNames: ['client_id'] }),
    );
    await queryRunner.createIndex(
      'journeys',
      new TableIndex({ name: 'IDX_journeys_assistant_id', columnNames: ['assistant_id'] }),
    );
    await queryRunner.createIndex(
      'journeys',
      new TableIndex({ name: 'IDX_journeys_custody_source_id', columnNames: ['custody_source_id'] }),
    );
    await queryRunner.createIndex(
      'journeys',
      new TableIndex({
        name: 'IDX_journeys_trip_status_created_at',
        columnNames: ['tripStatus', 'created_at'],
      }),
    );
    await queryRunner.createIndex(
      'journey_policies',
      new TableIndex({ name: 'IDX_journey_policies_journey_id', columnNames: ['journey_id'] }),
    );
    await queryRunner.createIndex(
      'journey_policies',
      new TableIndex({ name: 'IDX_journey_policies_employee_id', columnNames: ['employee_id'] }),
    );
    await queryRunner.createIndex(
      'employees',
      new TableIndex({ name: 'IDX_employees_branch_id', columnNames: ['branchId'] }),
    );

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_journey_policies_journey_latest"
      ON journey_policies (journey_id, "policyDate" DESC NULLS LAST, created_at DESC)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_journey_policies_journey_latest"`);
    await queryRunner.dropIndex('employees', 'IDX_employees_branch_id');
    await queryRunner.dropIndex('journey_policies', 'IDX_journey_policies_employee_id');
    await queryRunner.dropIndex('journey_policies', 'IDX_journey_policies_journey_id');
    await queryRunner.dropIndex('journeys', 'IDX_journeys_trip_status_created_at');
    await queryRunner.dropIndex('journeys', 'IDX_journeys_custody_source_id');
    await queryRunner.dropIndex('journeys', 'IDX_journeys_assistant_id');
    await queryRunner.dropIndex('journeys', 'IDX_journeys_client_id');
    await queryRunner.dropIndex('journeys', 'IDX_journeys_trailer_id');
    await queryRunner.dropIndex('journeys', 'IDX_journeys_car_id');
    await queryRunner.dropIndex('journeys', 'IDX_journeys_driver_id');
  }
}
