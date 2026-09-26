import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddEmployeeNolonAmount1775400075000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const prices = await queryRunner.getTable('delivery_prices');
    if (!prices) return;
    if (!prices.findColumnByName('employeeNolonAmount')) {
      await queryRunner.addColumn(
        'delivery_prices',
        new TableColumn({
          name: 'employeeNolonAmount',
          type: 'decimal',
          precision: 10,
          scale: 2,
          isNullable: true,
          default: 0,
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const prices = await queryRunner.getTable('delivery_prices');
    if (!prices?.findColumnByName('employeeNolonAmount')) return;
    await queryRunner.dropColumn('delivery_prices', 'employeeNolonAmount');
  }
}
