import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard, AuthUser, Roles, RolesGuard } from 'src/core/security';
import { UserRole } from 'src/core/enums/user-role';
import type { Request } from 'src/core/utils/request';
import { HeaderUtil } from 'src/core/utils/header-util';
import { JourneyAttachmentService } from './journey-attachment.service';
import { JourneyAttachmentDTO } from './dtos/journey-attachment.dto';
import { CreateJourneyAttachmentDTO } from './dtos/create-journey-attachment.dto';
import { UpdateJourneyAttachmentDTO } from './dtos/update-journey-attachment.dto';
import { JourneyAttachmentQueryDTO } from './dtos/query-journey-attachment.dto';
import {
  mapCreateJourneyAttachmentDtoToEntity,
  mapJourneyAttachmentToDtoSelective,
  mapUpdateJourneyAttachmentDtoToEntity,
} from './journey-attachment.mapper';
import { JourneyService } from '../journey/journey.service';

@Controller('api/journey-attachments')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiTags('journey-attachments-module')
export class JourneyAttachmentController {
  logger = new Logger('JourneyAttachmentController');

  constructor(
    private readonly attService: JourneyAttachmentService,
    private readonly journeyService: JourneyService,
  ) {}

  @Get('/')
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({ summary: 'Get list of journey attachments (paginated, searchable)' })
  @ApiResponse({
    status: 200,
    description: 'List of attachments',
    type: JourneyAttachmentDTO,
    isArray: true,
  })
  async getAll(@Req() req: Request, @Query() query: JourneyAttachmentQueryDTO) {
    const [results, count] = await this.attService.findAndCount(query);
    HeaderUtil.addPaginationHeaders(req.res!, count, +(query.page ?? 1), false);
    return results.map((a) => mapJourneyAttachmentToDtoSelective(a));
  }

  @Get('/:journeyId')
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({ summary: 'Get attachment info for a journey' })
  @ApiResponse({ status: 200, description: 'Attachment found', type: JourneyAttachmentDTO })
  async getByJourneyId(@Param('journeyId', ParseIntPipe) journeyId: number) {
    const existing = await this.attService.findByFields({ where: { journey: { id: journeyId } } });
    if (!existing) throw new NotFoundException(`Attachment for journey ${journeyId} not found`);
    return mapJourneyAttachmentToDtoSelective(existing);
  }

  @Post('/')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create attachment info for a journey' })
  @ApiResponse({ status: 201, description: 'Attachment created', type: JourneyAttachmentDTO })
  async create(@Body() dto: CreateJourneyAttachmentDTO, @AuthUser() user: any) {
    const journey = await this.journeyService.findById(dto.journeyId);
    if (!journey) throw new NotFoundException(`Journey with id ${dto.journeyId} not found`);

    const entity = mapCreateJourneyAttachmentDtoToEntity(dto);
    const saved = await this.attService.save(entity, user?.email);
    return mapJourneyAttachmentToDtoSelective(saved);
  }

  @Put('/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update attachment info for a journey' })
  @ApiResponse({ status: 200, description: 'Attachment updated', type: JourneyAttachmentDTO })
  async update(
    @Body() dto: UpdateJourneyAttachmentDTO,
    @AuthUser() user: any,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const existing = await this.attService.findByFields({ where: { id: id } });
    if (!existing) throw new NotFoundException(`Attachment with id ${id} not found`);

    const updatedEntity = mapUpdateJourneyAttachmentDtoToEntity(dto, existing);
    const updated = await this.attService.update(updatedEntity, user?.email);
    return mapJourneyAttachmentToDtoSelective(updated);
  }

  @Delete('/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete attachment info for a journey' })
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    const existing = await this.attService.findByFields({ where: { id: id } });
    if (!existing) throw new NotFoundException(`Attachment with id ${id} not found`);
    await this.attService.delete(existing.id);
  }
}
