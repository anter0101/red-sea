import { IntersectionType } from '@nestjs/swagger';
import { DateRangeDTO } from './date-range.dto';
import { ReportFlatQueryDTO } from './report-flat-flag.dto';

/** Query params for the income-statement report. */
export class IncomeStatementQueryDTO extends IntersectionType(DateRangeDTO, ReportFlatQueryDTO) {}
