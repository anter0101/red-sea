import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddApprovedDelegationPrintStatus1775400077000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TYPE "journey_delegation_prints_status_enum" ADD VALUE IF NOT EXISTS 'APPROVED'
    `);
  }

  public async down(): Promise<void> {
    // PostgreSQL cannot drop a single enum value in place.
  }
}
