import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from 'typeorm';

export class AddCustodyDriverId1775400049000 implements MigrationInterface {
  private table = 'custodies';
  private column = 'driver_id';
  private foreignKey = 'FK_custodies_driver_id';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasTable = await queryRunner.hasTable(this.table);
    if (!hasTable) {
      return;
    }

    const hasColumn = await queryRunner.hasColumn(this.table, this.column);
    if (!hasColumn) {
      await queryRunner.addColumn(
        this.table,
        new TableColumn({
          name: this.column,
          type: 'int4',
          isNullable: true,
        }),
      );
    }

    await queryRunner.query(
      `ALTER TABLE "${this.table}" DROP CONSTRAINT IF EXISTS "${this.foreignKey}"`,
    );

    await queryRunner.createForeignKey(
      this.table,
      new TableForeignKey({
        name: this.foreignKey,
        columnNames: [this.column],
        referencedTableName: 'drivers',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasTable = await queryRunner.hasTable(this.table);
    if (!hasTable) {
      return;
    }

    await queryRunner.query(
      `ALTER TABLE "${this.table}" DROP CONSTRAINT IF EXISTS "${this.foreignKey}"`,
    );

    const hasColumn = await queryRunner.hasColumn(this.table, this.column);
    if (hasColumn) {
      await queryRunner.dropColumn(this.table, this.column);
    }
  }
}
