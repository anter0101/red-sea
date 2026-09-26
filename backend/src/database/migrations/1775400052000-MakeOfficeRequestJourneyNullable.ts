import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeOfficeRequestJourneyNullable1775400052000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "office_requests" ALTER COLUMN "journey_id" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "office_requests" ALTER COLUMN "journey_id" SET NOT NULL`,
    );
  }
}
