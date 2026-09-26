import { IntersectionType } from '@nestjs/swagger';
import { DateRangeDTO } from './date-range.dto';
import { ReportFlatQueryDTO } from './report-flat-flag.dto';

/** Query params for the trial-balance report. */
export class TrialBalanceQueryDTO extends IntersectionType(DateRangeDTO, ReportFlatQueryDTO) {}
