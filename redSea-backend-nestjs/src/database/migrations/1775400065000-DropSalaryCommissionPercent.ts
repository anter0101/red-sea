import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class DropSalaryCommissionPercent1775400065000 implements MigrationInterface {
  private table = 'salaries';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable(this.table);
    if (!table) return;

    if (table.findColumnByName('commissionPercent')) {
      await queryRunner.dropColumn(this.table, 'commissionPercent');
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable(this.table);
    if (!table) return;

    if (!table.findColumnByName('commissionPercent')) {
      await queryRunner.addColumn(
        this.table,
        new TableColumn({
          name: 'commissionPercent',
          type: 'decimal',
          precision: 5,
          scale: 2,
          isNullable: true,
        }),
      );
    }
  }
}
