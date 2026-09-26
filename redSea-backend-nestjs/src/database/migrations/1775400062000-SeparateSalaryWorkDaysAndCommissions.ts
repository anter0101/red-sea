import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';
import { baseColumns } from 'src/core/utils/base.migration';

export class SeparateSalaryWorkDaysAndCommissions1775400062000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const salaries = await queryRunner.getTable('salaries');
    if (salaries?.findColumnByName('workDays')) {
      await queryRunner.dropColumn('salaries', 'workDays');
    }
    if (salaries?.findColumnByName('commissionPerJourney')) {
      await queryRunner.dropColumn('salaries', 'commissionPerJourney');
    }

    const [idColumn, ...otherBaseColumns] = baseColumns;

    if (!(await queryRunner.hasTable('salary_work_days'))) {
      await queryRunner.createTable(
        new Table({
          name: 'salary_work_days',
          columns: [
            idColumn,
            { name: 'salary_id', type: 'int4', isNullable: false },
            { name: 'workDate', type: 'date', isNullable: false },
            { name: 'notes', type: 'text', isNullable: true },
            ...otherBaseColumns,
          ],
          indices: [
            new TableIndex({
              name: 'IDX_salary_work_days_salary_id',
              columnNames: ['salary_id'],
            }),
          ],
          foreignKeys: [
            new TableForeignKey({
              name: 'FK_salary_work_days_salary_id',
              columnNames: ['salary_id'],
              referencedTableName: 'salaries',
              referencedColumnNames: ['id'],
              onDelete: 'CASCADE',
            }),
          ],
        }),
      );
    }

    if (!(await queryRunner.hasTable('salary_journey_commissions'))) {
      await queryRunner.createTable(
        new Table({
          name: 'salary_journey_commissions',
          columns: [
            idColumn,
            { name: 'salary_id', type: 'int4', isNullable: false },
            {
              name: 'amount',
              type: 'decimal',
              precision: 12,
              scale: 2,
              isNullable: false,
            },
            { name: 'commissionDate', type: 'date', isNullable: true },
            { name: 'journeyId', type: 'int4', isNullable: true },
            { name: 'notes', type: 'text', isNullable: true },
            ...otherBaseColumns,
          ],
          indices: [
            new TableIndex({
              name: 'IDX_salary_journey_commissions_salary_id',
              columnNames: ['salary_id'],
            }),
          ],
          foreignKeys: [
            new TableForeignKey({
              name: 'FK_salary_journey_commissions_salary_id',
              columnNames: ['salary_id'],
              referencedTableName: 'salaries',
              referencedColumnNames: ['id'],
              onDelete: 'CASCADE',
            }),
          ],
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('salary_journey_commissions', true);
    await queryRunner.dropTable('salary_work_days', true);
  }
}
