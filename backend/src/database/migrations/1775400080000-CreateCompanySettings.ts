import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import { baseColumns } from 'src/core/utils/base.migration';

export class CreateCompanySettings1775400080000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const [idColumn, ...otherBaseColumns] = baseColumns.map((column) => ({ ...column }));

    await queryRunner.createTable(
      new Table({
        name: 'company_settings',
        columns: [
          idColumn,
          { name: 'name', type: 'varchar', length: '255', isNullable: false },
          { name: 'tax_card', type: 'varchar', length: '50', isNullable: false },
          { name: 'commercial_register', type: 'varchar', length: '50', isNullable: false },
          ...otherBaseColumns,
        ],
      }),
    );

    await queryRunner.query(`
      INSERT INTO company_settings (name, tax_card, commercial_register, created_at)
      SELECT 'البحر الاحمر لتجارة الاسمنت', '758-003-633', '220842', now()
      WHERE NOT EXISTS (SELECT 1 FROM company_settings)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('company_settings');
  }
}
