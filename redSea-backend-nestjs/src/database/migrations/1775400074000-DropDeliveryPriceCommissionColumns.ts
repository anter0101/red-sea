import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropDeliveryPriceCommissionColumns1775400074000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const prices = await queryRunner.getTable('delivery_prices');
    if (!prices) return;
    for (const name of [
      'driverCommissionEnabled',
      'driverCommissionPercent',
      'assistantCommissionEnabled',
      'assistantCommissionPercent',
    ]) {
      if (prices.findColumnByName(name)) {
        await queryRunner.dropColumn('delivery_prices', name);
      }
    }
  }

  public async down(): Promise<void> {
    // Commission lives on salaries, not delivery_prices.
  }
}
