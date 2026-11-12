import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTipsFeesCategory1775400084000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const rows = (await queryRunner.query(`
      SELECT udt_name FROM information_schema.columns
      WHERE table_name = 'journey_transactions' AND column_name = 'category'
    `)) as Array<{ udt_name: string }>;
    const typeName = rows[0]?.udt_name;
    if (!typeName) return;
    await queryRunner.query(`ALTER TYPE "${typeName}" ADD VALUE IF NOT EXISTS 'Tips Fees'`);
  }

  public async down(): Promise<void> {
    // Postgres cannot drop a single enum value.
  }
}
