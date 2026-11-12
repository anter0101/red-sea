import { MigrationInterface, QueryRunner } from 'typeorm';

const CUSTODY_SUPPLIER_TREE = `
  WITH RECURSIVE subtree AS (
    SELECT id FROM "accounts" WHERE "system_key" = 'CUSTODY_SUPPLIER'
    UNION
    SELECT child.id FROM "accounts" child JOIN subtree ON child."parent_account_id" = subtree.id
  )
`;

/**
 * Custody now goes from the employee to the driver or the transport supplier, so the custody
 * supplier (مورد العهدة) accounts, the CUSTODY supplier type and the journey custody supplier
 * columns are unused. Stops instead of deleting when anything still references them.
 */
export class DropCustodySupplier1775400086000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const [{ lines }] = (await queryRunner.query(`
      ${CUSTODY_SUPPLIER_TREE}
      SELECT COUNT(*)::int AS lines FROM "transaction_lines"
      WHERE "account_id" IN (SELECT id FROM subtree)
    `)) as Array<{ lines: number }>;
    const [{ suppliers }] = (await queryRunner.query(
      `SELECT COUNT(*)::int AS suppliers FROM "suppliers" WHERE "type"::text = 'CUSTODY'`,
    )) as Array<{ suppliers: number }>;
    const [{ journeys }] = (await queryRunner.query(`
      SELECT COUNT(*)::int AS journeys FROM "journeys" WHERE "custody_supplier_id" IS NOT NULL
    `)) as Array<{ journeys: number }>;
    if (lines > 0 || suppliers > 0 || journeys > 0) {
      throw new Error(
        `Custody supplier data still in use: ${lines} ledger lines, ${suppliers} suppliers, ${journeys} journeys`,
      );
    }

    await queryRunner.query(`
      ALTER TABLE "journeys"
      DROP COLUMN IF EXISTS "custody_supplier_id",
      DROP COLUMN IF EXISTS "custody_supplier_amount"
    `);

    await queryRunner.query(`
      ${CUSTODY_SUPPLIER_TREE}
      DELETE FROM "accounts" WHERE id IN (SELECT id FROM subtree)
    `);

    await queryRunner.query(`ALTER TYPE "supplier_type_enum" RENAME TO "supplier_type_enum_old"`);
    await queryRunner.query(
      `CREATE TYPE "supplier_type_enum" AS ENUM ('GOODS', 'SERVICES', 'TRANSPORTATION')`,
    );
    await queryRunner.query(`
      ALTER TABLE "suppliers"
      ALTER COLUMN "type" TYPE "supplier_type_enum" USING "type"::text::"supplier_type_enum"
    `);
    await queryRunner.query(`DROP TYPE "supplier_type_enum_old"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TYPE "supplier_type_enum" ADD VALUE IF NOT EXISTS 'CUSTODY'`);
    await queryRunner.query(`
      ALTER TABLE "journeys"
      ADD COLUMN IF NOT EXISTS "custody_supplier_id" integer,
      ADD COLUMN IF NOT EXISTS "custody_supplier_amount" numeric(14,2)
    `);
  }
}
