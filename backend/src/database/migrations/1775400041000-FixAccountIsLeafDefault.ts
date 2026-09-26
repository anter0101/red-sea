import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixAccountIsLeafDefault1775400041000 implements MigrationInterface {
  name = 'FixAccountIsLeafDefault1775400041000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Change the default from false → true so every newly inserted account
    // starts as a leaf account (no children yet).
    await queryRunner.query(`ALTER TABLE "accounts" ALTER COLUMN "isLeaf" SET DEFAULT true`);

    // Reconcile existing data: any account that currently appears as a parent
    // (i.e., at least one other account has parent_account_id pointing at it)
    // must have isLeaf = false; everyone else should be true.
    await queryRunner.query(`
      UPDATE "accounts"
      SET "isLeaf" = false
      WHERE id IN (
        SELECT DISTINCT parent_account_id
        FROM "accounts"
        WHERE parent_account_id IS NOT NULL
      )
    `);

    await queryRunner.query(`
      UPDATE "accounts"
      SET "isLeaf" = true
      WHERE id NOT IN (
        SELECT DISTINCT parent_account_id
        FROM "accounts"
        WHERE parent_account_id IS NOT NULL
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "accounts" ALTER COLUMN "isLeaf" SET DEFAULT false`);
  }
}
