import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class ExtendSalarySchemes1775400061000 implements MigrationInterface {
  private table = 'salaries';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TYPE "public"."salaries_salarytype_enum" ADD VALUE IF NOT EXISTS 'COMMISSION';
      EXCEPTION
        WHEN duplicate_object THEN null;
        WHEN undefined_object THEN null;
      END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TYPE "public"."salaries_salarytype_enum" ADD VALUE IF NOT EXISTS 'NOLON_PERCENT';
      EXCEPTION
        WHEN duplicate_object THEN null;
        WHEN undefined_object THEN null;
      END $$;
    `);

    const table = await queryRunner.getTable(this.table);
    if (!table) return;

    if (!table.findColumnByName('commissionPercent')) {
      await queryRunner.addColumn(
        this.table,
        new TableColumn({
          name: 'commissionPercent',
          type: 'decimal',
          precision: 5,
          scale: 2,
          isNullable: true,
        }),
      );
    }
    if (!table.findColumnByName('nolonPercent')) {
      await queryRunner.addColumn(
        this.table,
        new TableColumn({
          name: 'nolonPercent',
          type: 'decimal',
          precision: 5,
          scale: 2,
          isNullable: true,
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable(this.table);
    if (!table) return;

    for (const col of ['nolonPercent', 'commissionPercent']) {
      if (table.findColumnByName(col)) {
        await queryRunner.dropColumn(this.table, col);
      }
    }
  }
}
