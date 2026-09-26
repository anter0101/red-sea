import { MigrationInterface, QueryRunner } from 'typeorm';

export class MigrateEmployeeRoleToDataEntry1775400056000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "users"
      SET "role" = 'DATA_ENTRY'
      WHERE "role" = 'EMPLOYEE'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "users"
      SET "role" = 'EMPLOYEE'
      WHERE "role" = 'DATA_ENTRY'
        AND "id" IN (
          SELECT "userId" FROM "employees" WHERE "userId" IS NOT NULL
        )
    `);
  }
}
