import { MigrationInterface, QueryRunner } from 'typeorm';

export class BackfillPhysicalAttachmentCheckHistory1775400079100 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "physical_attachment_checks"
      ADD COLUMN IF NOT EXISTS "recorded_at" timestamptz,
      ADD COLUMN IF NOT EXISTS "recorded_by" varchar
    `);

    await queryRunner.query(`
      UPDATE "physical_attachment_checks"
      SET
        "recorded_at" = COALESCE("recorded_at", "created_at", now()),
        "recorded_by" = COALESCE(NULLIF("recorded_by", ''), NULLIF("created_by", ''), 'user')
      WHERE "recorded_at" IS NULL
         OR "recorded_by" IS NULL
         OR "recorded_by" = ''
    `);

    await queryRunner.query(`
      ALTER TABLE "physical_attachment_checks"
      ALTER COLUMN "recorded_at" SET NOT NULL,
      ALTER COLUMN "recorded_by" SET NOT NULL
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'physical_attachment_checks' AND column_name = 'label'
        ) THEN
          ALTER TABLE "physical_attachment_checks" ALTER COLUMN "label" DROP NOT NULL;
        END IF;
      END $$
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'physical_attachment_checks' AND column_name = 'sortOrder'
        ) THEN
          ALTER TABLE "physical_attachment_checks" ALTER COLUMN "sortOrder" DROP NOT NULL;
        END IF;
      END $$
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "physical_attachment_checks"
      DROP COLUMN IF EXISTS "recorded_by",
      DROP COLUMN IF EXISTS "recorded_at"
    `);
  }
}
