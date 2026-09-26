import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddMonthlySalaryConfigFields1775400063000 implements MigrationInterface {
  private table = 'salaries';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable(this.table);
    if (!table) return;

    if (!table.findColumnByName('dailyWorkPrice')) {
      await queryRunner.addColumn(
        this.table,
        new TableColumn({
          name: 'dailyWorkPrice',
          type: 'decimal',
          precision: 12,
          scale: 2,
          isNullable: true,
        }),
      );
    }

    if (!table.findColumnByName('commissionPerJourney')) {
      await queryRunner.addColumn(
        this.table,
        new TableColumn({
          name: 'commissionPerJourney',
          type: 'decimal',
          precision: 12,
          scale: 2,
          isNullable: true,
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable(this.table);
    if (!table) return;

    if (table.findColumnByName('commissionPerJourney')) {
      await queryRunner.dropColumn(this.table, 'commissionPerJourney');
    }
    if (table.findColumnByName('dailyWorkPrice')) {
      await queryRunner.dropColumn(this.table, 'dailyWorkPrice');
    }
  }
}
