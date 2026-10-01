import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Some databases were seeded before the in-progress client and revenue parents existed.
 * The invoice journal needs those parents, plus ايرادات تم تنفيذها under الإيرادات.
 * Each insert is skipped when the name or system key is already there.
 */
export class EnsureInvoiceChartParents1775400078100 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "accounts" (
        "code", "name", "type", "normalBalance", "parent_account_id", "isLeaf", "isSystem",
        "system_key", "opening_balance", "opening_balance_locked", "created_by", "created_at"
      )
      SELECT
        'A-CLIENTS-IN-PROGRESS',
        'العملاء تحت التنفيذ',
        sibling."type",
        sibling."normalBalance",
        parent.id,
        false,
        true,
        'CLIENTS_IN_PROGRESS',
        0,
        false,
        'system',
        NOW()
      FROM "accounts" sibling
      JOIN "accounts" parent ON parent."name" = 'الاصول المتداوله'
      WHERE sibling."system_key" = 'CLIENTS'
        AND NOT EXISTS (
          SELECT 1 FROM "accounts"
          WHERE "system_key" = 'CLIENTS_IN_PROGRESS' OR "name" = 'العملاء تحت التنفيذ'
        )
    `);

    await queryRunner.query(`
      INSERT INTO "accounts" (
        "code", "name", "type", "normalBalance", "parent_account_id", "isLeaf", "isSystem",
        "system_key", "opening_balance", "opening_balance_locked", "created_by", "created_at"
      )
      SELECT
        'A-REVENUE-IN-PROGRESS',
        'ايرادات تحت التنفيذ',
        sibling."type",
        sibling."normalBalance",
        sibling."parent_account_id",
        false,
        true,
        'REVENUE_IN_PROGRESS',
        0,
        false,
        'system',
        NOW()
      FROM "accounts" sibling
      WHERE sibling."name" = 'الايرادات'
        AND sibling."parent_account_id" IS NOT NULL
        AND NOT EXISTS (
          SELECT 1 FROM "accounts"
          WHERE "system_key" = 'REVENUE_IN_PROGRESS' OR "name" = 'ايرادات تحت التنفيذ'
        )
    `);

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
      WHERE sibling."name" = 'الايرادات'
        AND sibling."parent_account_id" IS NOT NULL
        AND NOT EXISTS (
          SELECT 1 FROM "accounts"
          WHERE "system_key" = 'REVENUE_DONE' OR "name" = 'ايرادات تم تنفيذها'
        )
    `);

    await this.backfillLeaves(queryRunner, 'CLIENTS_IN_PROGRESS', 'A3-CIP-', '');
    await this.backfillLeaves(queryRunner, 'REVENUE_IN_PROGRESS', 'A3-RIP-', 'ايرادات تحت التنفيذ ');
    await this.backfillLeaves(queryRunner, 'REVENUE_DONE', 'A3-RD-', 'ايرادات تم تنفيذها ');
  }

  private async backfillLeaves(
    queryRunner: QueryRunner,
    systemKey: string,
    codePrefix: string,
    namePrefix: string,
  ): Promise<void> {
    await queryRunner.query(
      `
      INSERT INTO "accounts" (
        "code", "name", "type", "normalBalance", "parent_account_id", "isLeaf", "isSystem",
        "actor_type", "actor_id", "opening_balance", "opening_balance_locked", "created_by", "created_at"
      )
      SELECT
        $1 || c.id,
        $2 || btrim(c.name),
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
      WHERE parent."system_key" = $3
        AND c.deleted_at IS NULL
        AND NOT EXISTS (
          SELECT 1 FROM "accounts" existing
          WHERE existing."parent_account_id" = parent.id
            AND existing."actor_type" = 'CLIENT'
            AND existing."actor_id" = c.id
        )
    `,
      [codePrefix, namePrefix, systemKey],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const key of ['REVENUE_DONE', 'REVENUE_IN_PROGRESS', 'CLIENTS_IN_PROGRESS']) {
      await queryRunner.query(
        `
        DELETE FROM "accounts" child
        USING "accounts" parent
        WHERE child."parent_account_id" = parent.id
          AND parent."system_key" = $1
          AND child."actor_type" = 'CLIENT'
      `,
        [key],
      );
      await queryRunner.query(
        `DELETE FROM "accounts" WHERE "system_key" = $1 AND "code" IN ('A-CLIENTS-IN-PROGRESS', 'A-REVENUE-IN-PROGRESS', 'A-REVENUE-DONE')`,
        [key],
      );
    }
  }
}
