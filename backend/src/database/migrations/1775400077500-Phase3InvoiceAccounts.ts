import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Chart nodes the client invoice posts to.
 * Copies type and parent from an existing sibling so the enum names stay the database's.
 */
export class Phase3InvoiceAccounts1775400077500 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "accounts" SET "system_key" = 'CLIENTS' WHERE "name" = 'عملاء' AND "system_key" IS NULL`,
    );
    await queryRunner.query(
      `UPDATE "accounts" SET "system_key" = 'WITHHOLDING_TAX' WHERE "name" = 'ضرائب منبع' AND "system_key" IS NULL`,
    );
    await queryRunner.query(`UPDATE "accounts" SET "isLeaf" = false WHERE "name" = 'عملاء'`);

    await queryRunner.query(`
      INSERT INTO "accounts" (
        "code", "name", "type", "normalBalance", "parent_account_id", "isLeaf", "isSystem",
        "system_key", "opening_balance", "opening_balance_locked", "created_by", "created_at"
      )
      SELECT
        'A-REVENUE-DONE',
        'ايرادات تم تنفيذها',
        sibling."type",
        sibling."normalBalance",
        sibling."parent_account_id",
        false,
        true,
        'REVENUE_DONE',
        0,
        false,
        'system',
        NOW()
      FROM "accounts" sibling
      WHERE sibling."name" = 'ايرادات تحت التنفيذ'
        AND NOT EXISTS (
          SELECT 1 FROM "accounts" WHERE "system_key" = 'REVENUE_DONE' OR "name" = 'ايرادات تم تنفيذها'
        )
    `);

    await queryRunner.query(`
      INSERT INTO "accounts" (
        "code", "name", "type", "normalBalance", "parent_account_id", "isLeaf", "isSystem",
        "system_key", "opening_balance", "opening_balance_locked", "created_by", "created_at"
      )
      SELECT
        'A-VAT-PAYABLE',
        'ضريبة القيمة المضافة',
        sibling."type",
        sibling."normalBalance",
        sibling."parent_account_id",
        true,
        true,
        'VAT_PAYABLE',
        0,
        false,
        'system',
        NOW()
      FROM "accounts" sibling
      WHERE sibling."name" = 'ضريبه الخصم والاضافه'
        AND NOT EXISTS (
          SELECT 1 FROM "accounts" WHERE "system_key" = 'VAT_PAYABLE' OR "name" = 'ضريبة القيمة المضافة'
        )
    `);

    await queryRunner.query(`
      INSERT INTO "accounts" (
        "code", "name", "type", "normalBalance", "parent_account_id", "isLeaf", "isSystem",
        "actor_type", "actor_id", "opening_balance", "opening_balance_locked", "created_by", "created_at"
      )
      SELECT
        'A3-CL-' || c.id,
        c.name,
        parent."type",
        parent."normalBalance",
        parent.id,
        true,
        false,
        'CLIENT',
        c.id,
        0,
        false,
        'system',
        NOW()
      FROM "clients" c
      CROSS JOIN "accounts" parent
      WHERE parent."system_key" = 'CLIENTS'
        AND c.deleted_at IS NULL
        AND NOT EXISTS (
          SELECT 1 FROM "accounts" existing
          WHERE existing."parent_account_id" = parent.id
            AND existing."actor_type" = 'CLIENT'
            AND existing."actor_id" = c.id
        )
    `);

    await queryRunner.query(`
      INSERT INTO "accounts" (
        "code", "name", "type", "normalBalance", "parent_account_id", "isLeaf", "isSystem",
        "actor_type", "actor_id", "opening_balance", "opening_balance_locked", "created_by", "created_at"
      )
      SELECT
        'A3-RD-' || c.id,
        'ايرادات تم تنفيذها ' || btrim(c.name),
        parent."type",
        parent."normalBalance",
        parent.id,
        true,
        false,
        'CLIENT',
        c.id,
        0,
        false,
        'system',
        NOW()
      FROM "clients" c
      CROSS JOIN "accounts" parent
      WHERE parent."system_key" = 'REVENUE_DONE'
        AND c.deleted_at IS NULL
        AND NOT EXISTS (
          SELECT 1 FROM "accounts" existing
          WHERE existing."parent_account_id" = parent.id
            AND existing."actor_type" = 'CLIENT'
            AND existing."actor_id" = c.id
        )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM "accounts" child
      USING "accounts" parent
      WHERE child."parent_account_id" = parent.id
        AND parent."system_key" = 'REVENUE_DONE'
    `);
    await queryRunner.query(`DELETE FROM "accounts" WHERE "system_key" = 'REVENUE_DONE'`);
    await queryRunner.query(`
      DELETE FROM "accounts" child
      USING "accounts" parent
      WHERE child."parent_account_id" = parent.id
        AND parent."system_key" = 'CLIENTS'
        AND child."actor_type" = 'CLIENT'
    `);
    await queryRunner.query(
      `UPDATE "accounts" SET "isLeaf" = true, "system_key" = NULL WHERE "system_key" = 'CLIENTS'`,
    );
    await queryRunner.query(
      `UPDATE "accounts" SET "system_key" = NULL WHERE "system_key" = 'WITHHOLDING_TAX'`,
    );
    await queryRunner.query(`DELETE FROM "accounts" WHERE "system_key" = 'VAT_PAYABLE'`);
  }
}
