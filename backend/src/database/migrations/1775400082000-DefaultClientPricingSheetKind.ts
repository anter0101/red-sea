import { MigrationInterface, QueryRunner } from 'typeorm';

export class DefaultClientPricingSheetKind1775400082000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const clients = await queryRunner.getTable('clients');
    if (clients?.findColumnByName('pricingSheetKind')) {
      await queryRunner.query(
        `ALTER TABLE clients ALTER COLUMN "pricingSheetKind" SET DEFAULT 'ARISH'`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const clients = await queryRunner.getTable('clients');
    if (clients?.findColumnByName('pricingSheetKind')) {
      await queryRunner.query(`ALTER TABLE clients ALTER COLUMN "pricingSheetKind" DROP DEFAULT`);
    }
  }
}
