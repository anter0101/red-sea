import { baseColumns } from 'src/core/utils/base.migration';
import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateRelTrailerOwnersTable1775400030000 implements MigrationInterface {
  private table = 'rel_trailer_owners';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const [idColumn, ...otherBaseColumns] = baseColumns;

    await queryRunner.createTable(
      new Table({
        name: this.table,
        columns: [
          idColumn,
          {
            name: 'ownerId',
            type: 'int4',
            isNullable: false,
          },
          {
            name: 'trailerId',
            type: 'int4',
            isNullable: false,
          },
          {
            name: 'percentage',
            type: 'decimal',
            precision: 5,
            scale: 2,
            default: 100,
            isNullable: false,
          },
          {
            name: 'contractUrl',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
          },
          ...otherBaseColumns,
        ],
        indices: [
          new TableIndex({
            name: 'IDX_rel_trailer_owners_owner_trailer',
            columnNames: ['ownerId', 'trailerId'],
            isUnique: true,
          }),
        ],
        foreignKeys: [
          new TableForeignKey({
            name: 'FK_rel_trailer_owners_owner_id',
            columnNames: ['ownerId'],
            referencedTableName: 'owners',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
          new TableForeignKey({
            name: 'FK_rel_trailer_owners_trailer_id',
            columnNames: ['trailerId'],
            referencedTableName: 'trailers',
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
