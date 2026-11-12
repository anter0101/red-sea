import { MigrationInterface, QueryRunner } from 'typeorm';

const LEAVES: Array<[string, string]> = [
  ['TRIP_EXP_DIESEL', 'سولار'],
  ['TRIP_EXP_CARD', 'كارته'],
  ['TRIP_EXP_SCALE', 'ميزان'],
  ['TRIP_EXP_TIPS', 'اكراميات'],
];

/** Expense leaves the driver custody settlement (TRN3) debits, one per trip expense type. */
export class TripExpenseAccounts1775400085000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const [key, name] of LEAVES) {
      await queryRunner.query(
        `
        INSERT INTO "accounts" (
          "code", "name", "type", "normalBalance", "parent_account_id", "isLeaf", "isSystem",
          "system_key", "opening_balance", "opening_balance_locked", "created_by", "created_at"
        )
        SELECT
          $1::varchar, $2::varchar, 'EXPENSE', 'DEBIT', parent.id, true, true, $3::varchar,
          0, false, 'system', NOW()
        FROM "accounts" parent
        WHERE parent."name" = 'المصروفات التشغيلية'
          AND NOT EXISTS (SELECT 1 FROM "accounts" WHERE "system_key" = $3::varchar)
        LIMIT 1
        `,
        [`A-${key.replace(/_/g, '-')}`, name, key],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "accounts" WHERE "system_key" = ANY($1)`, [
      LEAVES.map(([key]) => key),
    ]);
  }
}
