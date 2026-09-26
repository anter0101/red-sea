import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddCommissionIsPercentage1775400064000 implements MigrationInterface {
  private table = 'salaries';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable(this.table);
    if (!table) return;

    if (!table.findColumnByName('commissionIsPercentage')) {
      await queryRunner.addColumn(
        this.table,
        new TableColumn({
          name: 'commissionIsPercentage',
          type: 'boolean',
          isNullable: true,
          default: false,
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable(this.table);
    if (!table) return;

    if (table.findColumnByName('commissionIsPercentage')) {
      await queryRunner.dropColumn(this.table, 'commissionIsPercentage');
    }
  }
}
