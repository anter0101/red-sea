import { MigrationInterface, QueryRunner } from 'typeorm';

const REMOVED = [
  'Office Fees',
  'Loading Fees',
  'Toll Fees',
  'Crossing Fees',
  'Port Permit Fees',
  'Port Fees',
  'Other Expenses',
];

/**
 * Trip expenses are now only سولار، كارته، ميزان، اكراميات. Rows of the removed types never
 * posted to the ledger, so deleting them leaves the books unchanged.
 */
export class DropOldExpenseCategories1775400087000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const [column] = (await queryRunner.query(`
      SELECT udt_name FROM information_schema.columns
      WHERE table_name = 'journey_transactions' AND column_name = 'category'
    `)) as Array<{ udt_name: string }>;
    if (!column) return;
    const typeName = column.udt_name;

    await queryRunner.query(
      `DELETE FROM "journey_transactions" WHERE "category"::text = ANY($1)`,
      [REMOVED],
    );

    const labels = (
      (await queryRunner.query(
        `
        SELECT e.enumlabel FROM pg_enum e
        JOIN pg_type t ON t.oid = e.enumtypid
        WHERE t.typname = $1
        ORDER BY e.enumsortorder
        `,
        [typeName],
      )) as Array<{ enumlabel: string }>
    )
      .map((row) => row.enumlabel)
      .filter((label) => !REMOVED.includes(label));

    const users = (await queryRunner.query(
      `SELECT table_name, column_name FROM information_schema.columns WHERE udt_name = $1`,
      [typeName],
    )) as Array<{ table_name: string; column_name: string }>;

    const quoted = labels.map((label) => `'${label.replace(/'/g, "''")}'`).join(', ');
    await queryRunner.query(`ALTER TYPE "${typeName}" RENAME TO "${typeName}_old"`);
    await queryRunner.query(`CREATE TYPE "${typeName}" AS ENUM (${quoted})`);
    for (const use of users) {
      await queryRunner.query(`
        ALTER TABLE "${use.table_name}"
        ALTER COLUMN "${use.column_name}" TYPE "${typeName}"
        USING "${use.column_name}"::text::"${typeName}"
      `);
    }
    await queryRunner.query(`DROP TYPE "${typeName}_old"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const [column] = (await queryRunner.query(`
      SELECT udt_name FROM information_schema.columns
      WHERE table_name = 'journey_transactions' AND column_name = 'category'
    `)) as Array<{ udt_name: string }>;
    if (!column) return;
    for (const label of REMOVED) {
      await queryRunner.query(`ALTER TYPE "${column.udt_name}" ADD VALUE IF NOT EXISTS '${label}'`);
    }
  }
}
