import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * الخزينه and البنك were seeded as CASH; they are plain ASSET accounts.
 * ايرادات تحت التنفيذ and ايرادات تم تنفيذها (and their client leaves) are sub-accounts of
 * الايرادات (itself under the الإيرادات root) as REVENUE / CREDIT, wherever they were before.
 */
export class FixCashAndRevenueAccountTypes1775400083000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "accounts"
      SET "type" = 'ASSET', "normalBalance" = 'DEBIT'
      WHERE "name" IN ('الخزينه', 'البنك') AND "type" = 'CASH'
    `);

    const revenueParent = `
      SELECT sub.id FROM "accounts" sub
      JOIN "accounts" root ON root.id = sub."parent_account_id"
      WHERE sub."name" = 'الايرادات'
        AND root."name" = 'الإيرادات'
        AND root."parent_account_id" IS NULL
      LIMIT 1
    `;

    await queryRunner.query(`
      UPDATE "accounts"
      SET "parent_account_id" = (${revenueParent})
      WHERE (
          "system_key" IN ('REVENUE_IN_PROGRESS', 'REVENUE_DONE')
          OR "name" IN ('ايرادات تحت التنفيذ', 'ايرادات تم تنفيذها')
        )
        AND EXISTS (${revenueParent})
        AND "parent_account_id" IS DISTINCT FROM (${revenueParent})
    `);

    await queryRunner.query(`
      UPDATE "accounts" SET "isLeaf" = false
      WHERE id = (${revenueParent})
        AND EXISTS (SELECT 1 FROM "accounts" child WHERE child."parent_account_id" = (${revenueParent}))
    `);

    await queryRunner.query(`
      WITH RECURSIVE subtree AS (
        SELECT id FROM "accounts"
        WHERE "system_key" IN ('REVENUE_IN_PROGRESS', 'REVENUE_DONE')
           OR "name" IN ('ايرادات تحت التنفيذ', 'ايرادات تم تنفيذها')
        UNION
        SELECT child.id FROM "accounts" child
        JOIN subtree ON child."parent_account_id" = subtree.id
      )
      UPDATE "accounts"
      SET "type" = 'REVENUE', "normalBalance" = 'CREDIT'
      WHERE id IN (SELECT id FROM subtree)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "accounts"
      SET "type" = 'CASH'
      WHERE "name" IN ('الخزينه', 'البنك') AND "type" = 'ASSET'
    `);
    // The revenue parents' previous placement is not recorded, so it is not restored.
  }
}
