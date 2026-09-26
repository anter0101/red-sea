import { baseColumns } from 'src/core/utils/base.migration';
import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateTrailersTable1775400021000 implements MigrationInterface {
  private table = 'trailers';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const [idColumn, ...otherBaseColumns] = baseColumns;

    await queryRunner.createTable(
      new Table({
        name: this.table,
        columns: [
          idColumn,
          {
            name: 'code',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'chaseType',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'manufacturer',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['AVAILABLE', 'UNAVAILABLE', 'ONROAD', 'UNDER_MAINTENANCE'],
            default: "'UNAVAILABLE'",
            isNullable: false,
          },
          {
            name: 'manufactureYear',
            type: 'int4',
            isNullable: false,
          },
          {
            name: 'color',
            type: 'varchar',
            length: '30',
            isNullable: false,
          },
          {
            name: 'maxWeight',
            type: 'int4',
            isNullable: false,
          },
          {
            name: 'plateNumber',
            type: 'varchar',
            length: '20',
            isNullable: false,
          },
          {
            name: 'plateLetters',
            type: 'varchar',
            length: '10',
            isNullable: false,
          },
          {
            name: 'chassisNumber',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'licenseNumber',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'licenseExpiryDate',
            type: 'date',
            isNullable: false,
          },
          {
            name: 'axleCount',
            type: 'int4',
            isNullable: false,
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'ownerShip',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          ...otherBaseColumns,
        ],
        indices: [
          new TableIndex({
            name: 'IDX_trailers_chassis_number',
            columnNames: ['chassisNumber'],
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
