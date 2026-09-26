import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Removes the legacy expense feature: expense attachments and expenses tables
 * plus related PostgreSQL enum types.
 */
export class DropExpenseTables1775400046000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable('expense_attachments')) {
      await queryRunner.dropTable('expense_attachments');
    }

    if (await queryRunner.hasTable('expenses')) {
      await queryRunner.dropTable('expenses');
    }

    await queryRunner.query('DROP TYPE IF EXISTS "expense_attachments_type_enum"');
    await queryRunner.query('DROP TYPE IF EXISTS "expense_status_enum"');
    await queryRunner.query('DROP TYPE IF EXISTS "expenses_type_enum"');
  }

  public async down(): Promise<void> {
    await Promise.resolve();
    throw new Error('DropExpenseTables1775400046000 is irreversible');
  }
}
