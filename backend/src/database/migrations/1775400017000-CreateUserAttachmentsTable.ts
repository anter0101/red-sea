import { baseColumns } from 'src/core/utils/base.migration';
import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateUserAttachmentsTable1775400017000 implements MigrationInterface {
  private table = 'user_attachments';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const [idColumn, ...otherBaseColumns] = baseColumns;

    await queryRunner.createTable(
      new Table({
        name: this.table,
        columns: [
          idColumn,
          {
            name: 'user_id',
            type: 'int4',
            isNullable: false,
          },
          {
            name: 'url',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'type',
            type: 'enum',
            enum: [
              'PERSONALID',
              'DRIVERLICENSE',
              'INSURANCE',
              'MEDICALINSURANCE',
              'CREMINALRECORD',
              'SECURITYCLEARANCE',
              'MILITITARYSTATUS',
            ],
            isNullable: false,
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'documentExpiryDate',
            type: 'date',
            isNullable: true,
          },
          ...otherBaseColumns,
        ],
        indices: [
          new TableIndex({
            name: 'IDX_user_attachments_user_id',
            columnNames: ['user_id'],
          }),
        ],
        foreignKeys: [
          new TableForeignKey({
            name: 'FK_user_attachments_user_id',
            columnNames: ['user_id'],
            referencedTableName: 'users',
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
