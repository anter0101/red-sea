import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class MakePhysicalAttachmentPhotoOptionalAddPrice1775400060000
  implements MigrationInterface
{
  private table = 'physical_attachments';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable(this.table);
    if (!table) return;

    const photoColumn = table.findColumnByName('photoUrl');
    if (photoColumn && !photoColumn.isNullable) {
      await queryRunner.query(
        `ALTER TABLE "${this.table}" ALTER COLUMN "photoUrl" DROP NOT NULL`,
      );
    }

    if (!table.findColumnByName('price')) {
      await queryRunner.addColumn(
        this.table,
        new TableColumn({
          name: 'price',
          type: 'decimal',
          precision: 12,
          scale: 2,
          isNullable: true,
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable(this.table);
    if (!table) return;

    if (table.findColumnByName('price')) {
      await queryRunner.dropColumn(this.table, 'price');
    }

    await queryRunner.query(
      `UPDATE "${this.table}" SET "photoUrl" = '' WHERE "photoUrl" IS NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "${this.table}" ALTER COLUMN "photoUrl" SET NOT NULL`,
    );
  }
}
