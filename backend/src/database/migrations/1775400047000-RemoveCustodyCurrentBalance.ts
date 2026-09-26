import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveCustodyCurrentBalance1775400047000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasColumn = await queryRunner.hasColumn('custodies', 'current_balance');
    if (hasColumn) {
      await queryRunner.dropColumn('custodies', 'current_balance');
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "custodies"
      ADD COLUMN IF NOT EXISTS "current_balance" decimal(14,2) NOT NULL DEFAULT 0
    `);
  }
}
