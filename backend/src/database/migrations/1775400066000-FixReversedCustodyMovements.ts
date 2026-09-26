import { MigrationInterface, QueryRunner } from 'typeorm';

const CUSTODY_MOVEMENT_DESCRIPTION = 'عهده خارجيه من%';

/**
 * Must run before the corrected custodyMovement() posts any new lines, otherwise
 * correct entries would be swapped into reversed ones. Migrations run at bootstrap
 * before the app serves traffic, so every matching row is pre-fix by definition.
 */
export class FixReversedCustodyMovements1775400066000 implements MigrationInterface {
  private readonly repointMisroutedLines = `
    UPDATE "transaction_lines" tl
    SET "account_id" = custody."id"
    FROM "transactions" t,
         "accounts" wrong,
         "accounts" custody,
         "accounts" custody_parent
    WHERE tl."transaction_id" = t."id"
      AND t."description" LIKE $1
      AND wrong."id" = tl."account_id"
      AND custody_parent."name" = 'عهد'
      AND custody."name" = wrong."name"
      AND custody."parent_account_id" = custody_parent."id"
      AND wrong."parent_account_id" IS DISTINCT FROM custody_parent."id"
  `;

  private readonly swapEntryTypes = `
    UPDATE "transaction_lines" tl
    SET "entryType" = CASE tl."entryType"
                        WHEN 'DEBIT' THEN 'CREDIT'::"transaction_lines_entrytype_enum"
                        ELSE 'DEBIT'::"transaction_lines_entrytype_enum"
                      END
    FROM "transactions" t
    WHERE tl."transaction_id" = t."id"
      AND t."description" LIKE $1
  `;

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(this.repointMisroutedLines, [CUSTODY_MOVEMENT_DESCRIPTION]);
    await queryRunner.query(this.swapEntryTypes, [CUSTODY_MOVEMENT_DESCRIPTION]);
  }

  /**
   * Only the entry types are restored. The original account_id of a misrouted line
   * pointed at the wrong person account and is not recoverable from the row itself.
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(this.swapEntryTypes, [CUSTODY_MOVEMENT_DESCRIPTION]);
  }
}
