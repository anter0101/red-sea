import { MigrationInterface, QueryRunner } from 'typeorm';

const VALUES = [
  'Driver Daily Work',
  'Assistant Daily Work',
  'Driver Employee Nolon',
  'Assistant Employee Nolon',
];

export class AddSalaryExpenseCategories1775400088000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const rows = (await queryRunner.query(`
      SELECT udt_name FROM information_schema.columns
      WHERE table_name = 'journey_transactions' AND column_name = 'category'
    `)) as Array<{ udt_name: string }>;
    const typeName = rows[0]?.udt_name;
    if (!typeName) return;
    for (const value of VALUES) {
      await queryRunner.query(`ALTER TYPE "${typeName}" ADD VALUE IF NOT EXISTS '${value}'`);
    }
  }

  public async down(): Promise<void> {
    // Postgres cannot drop a single enum value.
  }
}
