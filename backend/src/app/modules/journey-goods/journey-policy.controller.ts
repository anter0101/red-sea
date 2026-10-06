import { JourneyAttachment } from '../journey-attachment/journey-attachment.entity';
import { GovernmentService } from '../government/government.service';
import {
  BadRequestException,
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
import { JourneyPolicyService } from './journey-policy.service';
import { JourneyPolicyDTO } from './dtos/journey-policy.dto';
import { CreateJourneyPolicyDTO } from './dtos/create-journey-policy.dto';
import { UpdateJourneyPolicyDTO } from './dtos/update-journey-policy.dto';
import {
  mapCreateJourneyPolicyDtoToEntity,
  mapJourneyPolicyToDtoSelective,
  mapUpdateJourneyPolicyDtoToEntity,
} from './journey-policy.mapper';
import { JourneyService } from '../journey/journey.service';
import { Journey } from '../journey/journey.entity';
import { JourneyRevenueService } from '../journey/journey-revenue.service';
import { AreaService } from '../area/area.service';
import { HeaderUtil } from 'src/core/utils/header-util';
import { PageRequest, pageRequestSortString } from 'src/core/utils/pagination.entity';
import type { Request } from 'src/core/utils/request';
import { JourneyPolicyQueryDTO } from './dtos/query-journey-policy.dto';
import { EmployeeService } from '../employee/employee.service';
import { JourneyAttachmentService } from '../journey-attachment/journey-attachment.service';
import { PolicyLedgerService } from './policy-ledger.service';
import { ApplyLedgerDTO } from './dtos/apply-ledger.dto';
import { JourneyAttachmentType, JourneyStatus } from 'src/core/enums/journey';
import { OwnerShipType } from 'src/core/enums/ownerShip-types';
import { JourneyPolicyFormDTO } from './dtos/journey-policy-form.dto';
import { withTransaction } from 'src/core/utils/transaction';
import { DataSource } from 'typeorm';

@Controller('api/journey-policies')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiTags('journey-policy-module')
export class JourneyPolicyController {
  private readonly logger = new Logger('JourneyPolicyController');

  constructor(
    private readonly policyService: JourneyPolicyService,
    private readonly journeyService: JourneyService,
    private readonly governmentService: GovernmentService,
    private readonly areaService: AreaService,
    private readonly employeeService: EmployeeService,
    private readonly journeyAttachmentService: JourneyAttachmentService,
    private readonly journeyRevenueService: JourneyRevenueService,
    private readonly policyLedgerService: PolicyLedgerService,
    private readonly dataSource: DataSource,
  ) {}

  // ---------------------------
  // GET ALL (paginated)
  // ---------------------------
  @Get('/')
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({ summary: 'Get list of journey policies paginated' })
  @ApiResponse({
    status: 200,
    description: 'List of journey policies',
    type: JourneyPolicyDTO,
    isArray: true,
  })
  async getAll(
    @Req() req: Request,
    @Query() query: JourneyPolicyQueryDTO,
  ): Promise<Partial<JourneyPolicyDTO>[]> {
    const pageRequest = new PageRequest(
      +(query.page ?? 1),
      +(query.pageSize ?? 10),
      pageRequestSortString(query.sortField, query.sortOrder),
    );

    // Load with relations
    const [results, count] = await this.policyService.findAndCount(
      {
        skip: +pageRequest.page * pageRequest.size,
        take: +pageRequest.size,
        order: pageRequest.sort.asOrder(),
        relations: ['journey', 'deliveryGov', 'deliveryArea', 'employee'],
      },
      query,
    );

    const dtos = mapJourneyPolicyToDtoSelective(results, [
      'id',
      'journey',
      'deliveryGov',
      'deliveryArea',
      'employee',
      'createdAt',
      'createdBy',
    ]);

    HeaderUtil.addPaginationHeaders(
      req.res!,
      count,
      pageRequest.page,
      count > pageRequest.page * pageRequest.size,
    );

    return dtos;
  }

  // ---------------------------
  // GET ONE
  // ---------------------------
  @Get('journey/:id/ledger')
  @Roles(UserRole.ADMIN, UserRole.USER, UserRole.DATA_ENTRY)
  @ApiOperation({ summary: 'Preview policy ledger lines before apply' })
  async previewLedger(
    @Param('id', ParseIntPipe) journeyId: number,
    @Query() query: ApplyLedgerDTO,
  ) {
    return this.policyLedgerService.preview(journeyId, query);
  }

  @Post('journey/:id/ledger/apply')
  @Roles(UserRole.ADMIN, UserRole.DATA_ENTRY)
  @ApiOperation({ summary: 'Post the policy ledger set once' })
  async applyLedger(
    @Param('id', ParseIntPipe) journeyId: number,
    @Body() body: ApplyLedgerDTO,
    @AuthUser() user: any,
  ) {
    return withTransaction(this.dataSource, (manager) =>
      this.policyLedgerService.apply(journeyId, body ?? {}, user?.email, manager),
    );
  }

  @Get('journey/:id')
  @Roles(UserRole.ADMIN, UserRole.USER, UserRole.DATA_ENTRY)
  @ApiOperation({ summary: 'Get policy details for a journey' })
  @ApiResponse({ status: 200, description: 'Policy found', type: JourneyPolicyFormDTO })
  async getById(@Param('id', ParseIntPipe) id: number): Promise<JourneyPolicyFormDTO> {
    const existing = await this.journeyService.findById(id);
    if (!existing) throw new NotFoundException(`Journey with id ${id} not found`);

    const row = await this.policyService.getPolicyFormByJourneyId(id);

    if (!row || !row.policyform) throw new NotFoundException(`Policy with id ${id} not found`);

    // Merge main policy data with joined JSON objects so all
    // related pieces (areas, governments, employee, attachments)
    // are returned together.
    return {
      ...row.policyform,
      deliveryArea: row.deliveryArea,
      deliveryGov: row.deliveryGov,
      loadingGov: row.loadingGov,
      employee: row.employee,
      attachments: row.attachments,
    };
  }

  // ---------------------------
  // CREATE (same structure as JourneyController)
  // ---------------------------
  @Post('/')
  @Roles(UserRole.ADMIN, UserRole.DATA_ENTRY)
  @ApiOperation({ summary: 'Create a new journey policy' })
  @ApiResponse({ status: 201, description: 'Policy created', type: JourneyPolicyDTO })
  async create(@Body() dto: CreateJourneyPolicyDTO, @AuthUser() user: any) {
    // 1. Validate FK relations
    const journey = await this.journeyService.findByFields({
      where: { id: dto.journeyId },
      relations: ['deliveryArea', 'deliveryGov', 'car', 'transportSupplier'],
    });
    if (!journey) throw new NotFoundException(`Journey with id ${dto.journeyId} not found`);

    //cheack if it has policy already
    const existingPolicy = await this.policyService.findByFields({
      where: { journey: { id: dto.journeyId } },
    });
    if (existingPolicy)
      throw new BadRequestException(`Journey with id ${dto.journeyId} already has a policy`);

    await this.applyDelegationContext(dto, journey, user?.id);
    await this.validatePolicyReferences(dto.journeyId, dto);
    this.assertTransportSupplier(journey, dto.transportSupplierId);

    // 2. Map to entity
    const entity = mapCreateJourneyPolicyDtoToEntity(dto);
    // link to existing journey so relation (and id) is set
    entity.journey = journey;

    // Save
    const saved = await withTransaction(this.dataSource, async manager => {
      const savedPolicy = await this.policyService.save(entity, user?.email);
      await this.journeyService.transitionStatus(
        dto.journeyId,
        JourneyStatus.POLICY_COLLECTED,
        user?.email,
        manager,
      );
      await this.journeyRevenueService.applyFromPolicy(savedPolicy, user?.email, manager);
      await this.policyLedgerService.apply(
        dto.journeyId,
        {
          transportSupplierId: dto.transportSupplierId,
          custodySupplierId: dto.custodySupplierId,
          custodySupplierAmount: dto.custodySupplierAmount,
        },
        user?.email,
        manager,
      );

      if (dto.policyFile) {
        const policyAttachment = new JourneyAttachment();
        policyAttachment.journey = savedPolicy.journey;
        policyAttachment.url = dto.policyFile;
        policyAttachment.type = JourneyAttachmentType.POLICY;
        await this.journeyAttachmentService.save(policyAttachment, user?.email);
      }

      return savedPolicy;
    });

    return mapJourneyPolicyToDtoSelective(saved);
  }

  // ---------------------------
  // UPDATE (same style as JourneyController)
  // ---------------------------
  @Put('journey/:id')
  @Roles(UserRole.ADMIN, UserRole.DATA_ENTRY)
  @ApiOperation({ summary: 'Update journey policy details' })
  @ApiResponse({ status: 200, description: 'Policy updated', type: JourneyPolicyDTO })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateJourneyPolicyDTO,
    @AuthUser() user: any,
  ) {
    const existing = await this.policyService.findByFields({
      where: { journey: { id } },
      relations: ['journey', 'deliveryGov', 'deliveryArea'],
    });

    if (!existing) throw new NotFoundException(`Policy with id ${id} not found`);

    const journey = await this.journeyService.findByFields({
      where: { id: existing.journey.id },
      relations: ['deliveryArea', 'deliveryGov', 'car', 'transportSupplier'],
    });
    await this.applyDelegationContext(dto, journey ?? existing.journey, user?.id);
    await this.validatePolicyReferences(existing.journey.id, dto);
    this.assertTransportSupplier(journey ?? existing.journey, dto.transportSupplierId);

    const updated = await withTransaction(this.dataSource, async manager => {
      const updatedEntity = mapUpdateJourneyPolicyDtoToEntity(dto, existing);
      const savedPolicy = await this.policyService.update(updatedEntity, user?.email);

      await this.journeyService.transitionStatus(
        existing.journey.id,
        JourneyStatus.POLICY_COLLECTED,
        user?.email,
        manager,
      );
      await this.journeyRevenueService.applyFromPolicy(savedPolicy, user?.email, manager);
      await this.policyLedgerService.apply(
        existing.journey.id,
        {
          transportSupplierId: dto.transportSupplierId,
          custodySupplierId: dto.custodySupplierId,
          custodySupplierAmount: dto.custodySupplierAmount,
        },
        user?.email,
        manager,
      );

      // Handle policy file attachment on update
      if (dto.policyFile) {
        const existingAttachment = await this.journeyAttachmentService.findByFields({
          where: {
            journey: { id: savedPolicy.journey.id },
            type: JourneyAttachmentType.POLICY,
          },
        });

        if (existingAttachment) {
          existingAttachment.url = dto.policyFile;
          await this.journeyAttachmentService.update(existingAttachment, user?.email);
        } else {
          const policyAttachment = new JourneyAttachment();
          policyAttachment.journey = savedPolicy.journey;
          policyAttachment.url = dto.policyFile;
          policyAttachment.type = JourneyAttachmentType.POLICY;
          await this.journeyAttachmentService.save(policyAttachment, user?.email);
        }
      }

      return savedPolicy;
    });

    return mapJourneyPolicyToDtoSelective(updated);
  }

  // ---------------------------
  // DELETE
  // ---------------------------
  @Delete('/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete journey policy' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    const existing = await this.policyService.findById(id);
    if (!existing) throw new NotFoundException(`Policy with id ${id} not found`);
    await this.policyService.delete(id);
  }

  // ============================================================
  // VALIDATION HELPER
  // ============================================================

  private async validatePolicyReferences(
    journeyId: number,
    dto: CreateJourneyPolicyDTO | UpdateJourneyPolicyDTO,
  ): Promise<void> {
    const journey = await this.journeyService.findById(journeyId);
    if (!journey) throw new NotFoundException(`Journey with id ${journeyId} not found`);

    // Validate deliverySite if provided
    if (dto.deliveryAreaId !== undefined) {
      const deliverySite = await this.areaService.findById(dto.deliveryAreaId);
      if (!deliverySite)
        throw new NotFoundException(`Area (delivery site) with id ${dto.deliveryAreaId} not found`);
    }

    // Validate deliveryGov if provided
    if (dto.deliveryGovId !== undefined) {
      const deliveryGov = await this.governmentService.findById(dto.deliveryGovId);
      if (!deliveryGov)
        throw new NotFoundException(`Government with id ${dto.deliveryGovId} not found`);
    }

    // Validate employee if provided
    if (dto.employeeId !== undefined) {
      const employee = await this.employeeService.findById(dto.employeeId);
      if (!employee) throw new NotFoundException(`Employee with id ${dto.employeeId} not found`);
    }
  }

  private async applyDelegationContext(
    dto: CreateJourneyPolicyDTO | UpdateJourneyPolicyDTO,
    journey: Journey,
    userId?: number,
  ): Promise<void> {
    this.assertPolicyDateAfterDelegation(dto.policyDate, journey.delegateDate);

    if (!userId) {
      throw new BadRequestException('لا يوجد موظف مرتبط بهذا المستخدم');
    }
    const employee = await this.employeeService.findByFields({
      where: { user: { id: userId } },
    });
    if (!employee) {
      throw new BadRequestException('لا يوجد موظف مرتبط بهذا المستخدم');
    }
    dto.employeeId = employee.id;
    if (dto.deliveryAreaId == null && journey.deliveryArea?.id) {
      dto.deliveryAreaId = journey.deliveryArea.id;
    }
    if (dto.deliveryGovId == null && journey.deliveryGov?.id) {
      dto.deliveryGovId = journey.deliveryGov.id;
    }
  }

  private assertTransportSupplier(journey: Journey, transportSupplierId?: number): void {
    const mode = journey.car?.ownerShip;
    const postsExpense =
      mode === OwnerShipType.NOLON_CAR || mode === OwnerShipType.CONTRACT_CAR;
    if (!postsExpense) return;
    if (transportSupplierId || journey.transportSupplier?.id) return;
    throw new BadRequestException('مورد النقل مطلوب للنولون والعقد.');
  }

  private assertPolicyDateAfterDelegation(
    policyDate?: Date | string,
    delegateDate?: Date | string,
  ): void {
    if (!policyDate || !delegateDate) return;
    if (this.dayKey(policyDate) <= this.dayKey(delegateDate)) {
      throw new BadRequestException('تاريخ البوليصة لازم يكون بعد تاريخ إصدار التفويض');
    }
  }

  private dayKey(value: Date | string): string {
    if (typeof value === 'string') return value.slice(0, 10);
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
