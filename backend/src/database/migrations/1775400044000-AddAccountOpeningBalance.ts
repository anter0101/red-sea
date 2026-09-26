import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAccountOpeningBalance1775400044000 implements MigrationInterface {
  name = 'AddAccountOpeningBalance1775400044000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "accounts" ADD "opening_balance" numeric(14,2) NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE "accounts" ADD "opening_balance_locked" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "accounts" DROP COLUMN "opening_balance_locked"`);
    await queryRunner.query(`ALTER TABLE "accounts" DROP COLUMN "opening_balance"`);
  }
}
