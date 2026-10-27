import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddJourneyDeliveryPlace1775400076000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "journeys"
      ADD COLUMN IF NOT EXISTS "delivery_area_id" integer,
      ADD COLUMN IF NOT EXISTS "delivery_gov_id" integer
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE "journeys"
        ADD CONSTRAINT "FK_journeys_delivery_area"
        FOREIGN KEY ("delivery_area_id") REFERENCES "areas"("id") ON DELETE SET NULL;
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE "journeys"
        ADD CONSTRAINT "FK_journeys_delivery_gov"
        FOREIGN KEY ("delivery_gov_id") REFERENCES "governments"("id") ON DELETE SET NULL;
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "journeys" DROP CONSTRAINT IF EXISTS "FK_journeys_delivery_gov"`,
    );
    await queryRunner.query(
      `ALTER TABLE "journeys" DROP CONSTRAINT IF EXISTS "FK_journeys_delivery_area"`,
    );
    await queryRunner.query(`ALTER TABLE "journeys" DROP COLUMN IF EXISTS "delivery_gov_id"`);
    await queryRunner.query(`ALTER TABLE "journeys" DROP COLUMN IF EXISTS "delivery_area_id"`);
  }
}
