import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard, AuthUser, Roles, RolesGuard } from 'src/core/security';
import { UserRole } from 'src/core/enums/user-role';
import { UpdateUserDTO } from '../user/dtos/update-user.dto';
import { JourneyDelegationPrintService } from './journey-delegation-print.service';
import { JourneyDelegationPrintDTO } from './dtos/journey-delegation-print.dto';
import { mapJourneyDelegationPrintToDto } from './journey-delegation-print.mapper';

@Controller('api/journey-delegation-prints')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiTags('journey-delegation-prints-module')
export class JourneyDelegationPrintController {
  constructor(private readonly journeyDelegationPrintService: JourneyDelegationPrintService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.DATA_ENTRY)
  @ApiOperation({ summary: 'List journeys whose delegation has not been printed' })
  @ApiResponse({ status: 200, type: [JourneyDelegationPrintDTO] })
  async listUnprinted(): Promise<JourneyDelegationPrintDTO[]> {
    const rows = await this.journeyDelegationPrintService.findUnprintedJourneys();
    return rows.map((row) => ({
      journeyId: row.journeyId,
      delegateNumber: row.delegateNumber,
      status: row.status,
      canPrint: false,
    }));
  }

  @Get('/:journeyId')
  @Roles(UserRole.ADMIN, UserRole.USER, UserRole.DATA_ENTRY)
  @ApiOperation({ summary: 'Get delegation print state for a journey' })
  @ApiResponse({ status: 200, description: 'Print state found', type: JourneyDelegationPrintDTO })
  async getByJourneyId(
    @Param('journeyId', ParseIntPipe) journeyId: number,
  ): Promise<JourneyDelegationPrintDTO> {
    await this.journeyDelegationPrintService.assertJourneyExists(journeyId);

    const record =
      (await this.journeyDelegationPrintService.findByJourneyId(journeyId)) ??
      (await this.journeyDelegationPrintService.createForJourney(journeyId));

    return mapJourneyDelegationPrintToDto(record);
  }

  @Post('/:journeyId/mark-printed')
  @Roles(UserRole.DATA_ENTRY)
  @ApiOperation({ summary: 'Mark journey delegation as physically printed' })
  @ApiResponse({ status: 200, description: 'Marked as printed', type: JourneyDelegationPrintDTO })
  async markPrinted(
    @Param('journeyId', ParseIntPipe) journeyId: number,
    @AuthUser() user: UpdateUserDTO,
  ): Promise<JourneyDelegationPrintDTO> {
    await this.journeyDelegationPrintService.assertJourneyExists(journeyId);

    const updated = await this.journeyDelegationPrintService.markPrinted(journeyId, user?.email);
    return mapJourneyDelegationPrintToDto(updated);
  }
}
