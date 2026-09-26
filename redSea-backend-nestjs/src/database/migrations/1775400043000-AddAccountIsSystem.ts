import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAccountIsSystem1775400043000 implements MigrationInterface {
  name = 'AddAccountIsSystem1775400043000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "accounts" ADD "isSystem" boolean NOT NULL DEFAULT false`);
    await queryRunner.query(`UPDATE "accounts" SET "isSystem" = true WHERE created_by = 'system'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "accounts" DROP COLUMN "isSystem"`);
  }
}
