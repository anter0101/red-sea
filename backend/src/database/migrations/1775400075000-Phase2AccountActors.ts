import { MigrationInterface, QueryRunner } from 'typeorm';

export class Phase2AccountActors1775400075000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "accounts"
      ADD COLUMN IF NOT EXISTS "system_key" character varying(64),
      ADD COLUMN IF NOT EXISTS "actor_type" character varying(32),
      ADD COLUMN IF NOT EXISTS "actor_id" integer
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "UQ_accounts_system_key"
      ON "accounts" ("system_key")
      WHERE "system_key" IS NOT NULL
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "UQ_accounts_actor_leaf"
      ON "accounts" ("parent_account_id", "actor_type", "actor_id")
      WHERE "actor_id" IS NOT NULL
    `);

    const keys: Array<[string, string]> = [
      ['CLIENTS_IN_PROGRESS', 'العملاء تحت التنفيذ'],
      ['REVENUE_IN_PROGRESS', 'ايرادات تحت التنفيذ'],
      ['NOLON_CONTRACT_CARS', 'سيارات عقود النولون'],
      ['TRANSPORT_SUPPLIER', 'مورد النقل'],
      ['CUSTODY', 'عهد'],
      ['CUSTODY_SUPPLIER', 'مورد العهدة'],
    ];
    for (const [key, name] of keys) {
      await queryRunner.query(`UPDATE "accounts" SET "system_key" = $1 WHERE "name" = $2`, [
        key,
        name,
      ]);
    }

    await queryRunner.query(`
      ALTER TYPE "supplier_type_enum" ADD VALUE IF NOT EXISTS 'CUSTODY'
    `);
    await queryRunner.query(`
      ALTER TABLE "suppliers"
      ADD COLUMN IF NOT EXISTS "branch_id" integer
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE "suppliers"
        ADD CONSTRAINT "FK_suppliers_branch"
        FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE SET NULL;
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$
    `);

    await queryRunner.query(`
      ALTER TABLE "journeys"
      ADD COLUMN IF NOT EXISTS "transport_supplier_id" integer,
      ADD COLUMN IF NOT EXISTS "custody_supplier_id" integer,
      ADD COLUMN IF NOT EXISTS "custody_supplier_amount" numeric(14,2)
    `);

    await queryRunner.query(`
      ALTER TABLE "transactions"
      ADD COLUMN IF NOT EXISTS "idempotency_key" character varying(120)
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "UQ_transactions_idempotency_key"
      ON "transactions" ("idempotency_key")
      WHERE "idempotency_key" IS NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "UQ_transactions_idempotency_key"`);
    await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN IF EXISTS "idempotency_key"`);
    await queryRunner.query(`
      ALTER TABLE "journeys"
      DROP COLUMN IF EXISTS "transport_supplier_id",
      DROP COLUMN IF EXISTS "custody_supplier_id",
      DROP COLUMN IF EXISTS "custody_supplier_amount"
    `);
    await queryRunner.query(`
      ALTER TABLE "suppliers" DROP CONSTRAINT IF EXISTS "FK_suppliers_branch"
    `);
    await queryRunner.query(`ALTER TABLE "suppliers" DROP COLUMN IF EXISTS "branch_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "UQ_accounts_actor_leaf"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "UQ_accounts_system_key"`);
    await queryRunner.query(`
      ALTER TABLE "accounts"
      DROP COLUMN IF EXISTS "system_key",
      DROP COLUMN IF EXISTS "actor_type",
      DROP COLUMN IF EXISTS "actor_id"
    `);
  }
}
