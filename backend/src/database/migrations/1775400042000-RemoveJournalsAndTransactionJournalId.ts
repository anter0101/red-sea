import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Removes journal bookkeeping: transactions no longer reference journals,
 * and the journals table is dropped.
 */
export class RemoveJournalsAndTransactionJournalId1775400042000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasTransactions = await queryRunner.hasTable('transactions');
    if (!hasTransactions) {
      return;
    }

    // FK name may differ (e.g. sync vs migrations); drop any FK from transactions → journals
    const fkRows: { conname: string }[] = await queryRunner.query(`
      SELECT c.conname
      FROM pg_constraint c
      JOIN pg_class t ON t.oid = c.conrelid
      JOIN pg_namespace tn ON tn.oid = t.relnamespace
      JOIN pg_class r ON r.oid = c.confrelid
      JOIN pg_namespace rn ON rn.oid = r.relnamespace
      WHERE c.contype = 'f'
        AND tn.nspname = 'public'
        AND t.relname = 'transactions'
        AND rn.nspname = 'public'
        AND r.relname = 'journals'
    `);
    for (const { conname } of fkRows) {
      await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT IF EXISTS "${conname}"`);
    }

    await queryRunner.query(
      `ALTER TABLE "transactions" DROP CONSTRAINT IF EXISTS "FK_transactions_journal_id"`,
    );

    const hasJournalId = await queryRunner.hasColumn('transactions', 'journal_id');
    if (hasJournalId) {
      await queryRunner.dropColumn('transactions', 'journal_id');
    }

    const hasJournals = await queryRunner.hasTable('journals');
    if (hasJournals) {
      await queryRunner.dropTable('journals');
    }
  }

  public async down(): Promise<void> {
    await Promise.resolve();
    throw new Error('RemoveJournalsAndTransactionJournalId1775400042000 is irreversible');
  }
}
