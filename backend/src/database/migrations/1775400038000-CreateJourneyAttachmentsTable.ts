import { baseColumns } from 'src/core/utils/base.migration';
import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateJourneyAttachmentsTable1775400038000 implements MigrationInterface {
  private table = 'journey_attachments';

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
          },
          {
            name: 'type',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'url',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          ...otherBaseColumns,
        ],
        indices: [
          new TableIndex({
            name: 'IDX_journey_attachments_journey_id',
            columnNames: ['journey_id'],
          }),
        ],
        foreignKeys: [
          new TableForeignKey({
            name: 'FK_journey_attachments_journey_id',
            columnNames: ['journey_id'],
            referencedTableName: 'journeys',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(this.table);
  }
}
