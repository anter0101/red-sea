import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddPricingSheetKindAndTripValues1775400073000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const clients = await queryRunner.getTable('clients');
    if (clients && !clients.findColumnByName('pricingSheetKind')) {
      await queryRunner.addColumn(
        'clients',
        new TableColumn({
          name: 'pricingSheetKind',
          type: 'varchar',
          length: '20',
          isNullable: true,
        }),
      );
      await queryRunner.query(`
        UPDATE clients
        SET "pricingSheetKind" = CASE WHEN id = 2 THEN 'WATANIA' ELSE 'ARISH' END
        WHERE "pricingSheetKind" IS NULL
      `);
      await queryRunner.query(`
        ALTER TABLE clients
        ALTER COLUMN "pricingSheetKind" SET NOT NULL
      `);
    }

    const journeys = await queryRunner.getTable('journeys');
    if (journeys && !journeys.findColumnByName('expectedRevenue')) {
      await queryRunner.addColumn(
        'journeys',
        new TableColumn({
          name: 'expectedRevenue',
          type: 'decimal',
          precision: 14,
          scale: 2,
          isNullable: true,
        }),
      );
    }
    if (journeys && !journeys.findColumnByName('actualRevenue')) {
      await queryRunner.addColumn(
        'journeys',
        new TableColumn({
          name: 'actualRevenue',
          type: 'decimal',
          precision: 14,
          scale: 2,
          isNullable: true,
        }),
      );
    }

    const prices = await queryRunner.getTable('delivery_prices');
    if (prices && !prices.findColumnByName('nolonPrice')) {
      await queryRunner.addColumn(
        'delivery_prices',
        new TableColumn({
          name: 'nolonPrice',
          type: 'decimal',
          precision: 10,
          scale: 2,
          isNullable: true,
          default: 0,
        }),
      );
    }

    await this.addEnumValue(queryRunner, 'Nolon Fees');
    await this.addEnumValue(queryRunner, 'Driver Commission');
    await this.addEnumValue(queryRunner, 'Assistant Commission');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const prices = await queryRunner.getTable('delivery_prices');
    for (const name of ['nolonPrice']) {
      if (prices?.findColumnByName(name)) {
        await queryRunner.dropColumn('delivery_prices', name);
      }
    }

    const journeys = await queryRunner.getTable('journeys');
    if (journeys?.findColumnByName('actualRevenue')) {
      await queryRunner.dropColumn('journeys', 'actualRevenue');
    }
    if (journeys?.findColumnByName('expectedRevenue')) {
      await queryRunner.dropColumn('journeys', 'expectedRevenue');
    }

    const clients = await queryRunner.getTable('clients');
    if (clients?.findColumnByName('pricingSheetKind')) {
      await queryRunner.dropColumn('clients', 'pricingSheetKind');
    }
  }

  private async addEnumValue(queryRunner: QueryRunner, value: string): Promise<void> {
    const rows = (await queryRunner.query(`
      SELECT t.typname
      FROM pg_type t
      JOIN pg_enum e ON t.oid = e.enumtypid
      WHERE e.enumlabel = 'Custody'
      LIMIT 1
    `)) as Array<{ typname: string }>;
    const typeName = rows[0]?.typname;
    if (!typeName) return;
    await queryRunner.query(`ALTER TYPE "${typeName}" ADD VALUE IF NOT EXISTS '${value}'`);
  }
}
