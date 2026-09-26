import { baseColumns } from 'src/core/utils/base.migration';
import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateJourneyDelegationPrintsTable1775400051000 implements MigrationInterface {
  private table = 'journey_delegation_prints';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const [idColumn, ...otherBaseColumns] = baseColumns;

    await queryRunner.createTable(
      new Table({
        name: this.table,
        columns: [
          idColumn,
          {
            name: 'journey_id',
            type: 'int4',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['NOT_PRINTED', 'PRINTED'],
            default: "'NOT_PRINTED'",
            isNullable: false,
          },
          ...otherBaseColumns,
        ],
        foreignKeys: [
          new TableForeignKey({
            name: 'FK_journey_delegation_prints_journey_id',
            columnNames: ['journey_id'],
            referencedTableName: 'journeys',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
        ],
        indices: [
          new TableIndex({
            name: 'UQ_journey_delegation_prints_journey_id',
            columnNames: ['journey_id'],
            isUnique: true,
          }),
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(this.table);
  }
}
