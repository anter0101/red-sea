import {
  Controller,
  Logger,
  UseGuards,
  Post,
  Put,
  Delete,
  Body,
  Param,
  NotFoundException,
  BadRequestException,
  Get,
  Req,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard, Roles, RolesGuard, AuthUser } from 'src/core/security';
import { UserRole } from 'src/core/enums/user-role';
import type { Request } from 'src/core/utils/request';

import { SupplierService } from './supplier.service';
import { GovernmentService } from '../government/government.service';
import { SupplierDTO } from './dtos/supplier.dto';
import { CreateSupplierDTO } from './dtos/create-supplier.dto';
import { UpdateSupplierDTO } from './dtos/update-supplier.dto';

import { PageRequest, pageRequestSortString } from 'src/core/utils/pagination.entity';
import { HeaderUtil } from 'src/core/utils/header-util';

import {
  mapCreateSupplierDtoToEntity,
  mapSupplierToSupplierDtoSelective,
  mapUpdateSupplierDtoToEntity,
} from './supplier.mapper';

import { UserDTO } from '../user/dtos/user.dto';
import { SupplierQueryDTO } from './dtos/query-supplier.dto';
import { SupplierType } from './enums/supplier-type.enum';

@Controller('api/suppliers')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiTags('suppliers-module')
export class SupplierController {
  private readonly logger = new Logger('SupplierController');

  constructor(
    private readonly supplierService: SupplierService,
    private readonly governmentService: GovernmentService,
  ) {}

  // ------------------------------------------------------------------------
  // GET ALL (paginated)
  // ------------------------------------------------------------------------
  @Get('/')
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({ summary: 'Get list of suppliers paginated' })
  @ApiResponse({
    status: 200,
    description: 'List of suppliers',
    type: SupplierDTO,
    isArray: true,
  })
  async getAllSuppliers(
    @Req() req: Request,
    @Query() query: SupplierQueryDTO,
  ): Promise<Partial<SupplierDTO>[]> {
    const pageRequest = new PageRequest(
      +(query.page ?? 1),
      +(query.pageSize ?? 10),
      pageRequestSortString(query.sortField, query.sortOrder),
    );

    const [results, count] = await this.supplierService.findAndCount(
      {
        skip: +pageRequest.page * pageRequest.size,
        take: +pageRequest.size,
        order: pageRequest.sort.asOrder(),
      },
      query,
    );

    const dtos = mapSupplierToSupplierDtoSelective(results, [
      'id',
      'code',
      'name',
      'type',
      'government',
      'phone',
      'commercialRegister',
      'taxCard',
      'taxRegistrationNumber',
      'createdBy',
      'updatedBy',
      'createdAt',
      'updatedAt',
    ]);

    HeaderUtil.addPaginationHeaders(
      req.res!,
      count,
      pageRequest.page,
      count > pageRequest.page * pageRequest.size,
    );

    return dtos;
  }

  // ------------------------------------------------------------------------
  // SUPPLIER TYPES
  // ------------------------------------------------------------------------
  @Get('/types')
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({ summary: 'List available supplier types' })
  @ApiResponse({ status: 200, description: 'Supplier type values', isArray: true })
  getSupplierTypes(): SupplierType[] {
    return Object.values(SupplierType);
  }

  // ------------------------------------------------------------------------
  // GET BY ID
  // ------------------------------------------------------------------------
  @Get('/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get supplier by id' })
  @ApiResponse({ status: 200, description: 'Supplier found', type: SupplierDTO })
  async getSupplierById(@Param('id', ParseIntPipe) id: number): Promise<SupplierDTO> {
    const existing = await this.supplierService.findByFields({ where: { id } });
    if (!existing) throw new NotFoundException(`Supplier with id ${id} not found`);

    return mapSupplierToSupplierDtoSelective(existing, [
      'id',
      'code',
      'name',
      'type',
      'government',
      'phone',
      'commercialRegister',
      'taxCard',
      'taxRegistrationNumber',
      'createdBy',
      'updatedBy',
      'createdAt',
      'updatedAt',
    ]) as SupplierDTO;
  }

  // ------------------------------------------------------------------------
  // CREATE
  // ------------------------------------------------------------------------
  @Post('/')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new supplier' })
  @ApiResponse({ status: 201, description: 'Record created', type: SupplierDTO })
  async create(@Body() dto: CreateSupplierDTO, @AuthUser() user: UserDTO): Promise<SupplierDTO> {
    const government = await this.governmentService.findById(dto.governmentId);
    if (!government) {
      throw new BadRequestException(`Government with id ${dto.governmentId} does not exist`);
    }

    const existingCR = await this.supplierService.findByFields({
      where: { commercialRegister: dto.commercialRegister },
    });
    if (existingCR)
      throw new BadRequestException(
        `Supplier with commercial register ${dto.commercialRegister} already exists`,
      );

    const existingTaxCard = await this.supplierService.findByFields({
      where: { taxCard: dto.taxCard },
    });
    if (existingTaxCard)
      throw new BadRequestException(`Supplier with tax card ${dto.taxCard} already exists`);

    const existingTRN = await this.supplierService.findByFields({
      where: { taxRegistrationNumber: dto.taxRegistrationNumber },
    });
    if (existingTRN)
      throw new BadRequestException(
        `Supplier with tax registration number ${dto.taxRegistrationNumber} already exists`,
      );

    const entity = mapCreateSupplierDtoToEntity(dto);
    return this.supplierService.save(entity, user?.email);
  }

  // ------------------------------------------------------------------------
  // UPDATE
  // ------------------------------------------------------------------------
  @Put('/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update supplier' })
  @ApiResponse({ status: 200, description: 'Record updated', type: SupplierDTO })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSupplierDTO,
    @AuthUser() user: UserDTO,
  ): Promise<SupplierDTO> {
    const existing = await this.supplierService.findByFields({ where: { id } });
    if (!existing) throw new NotFoundException(`Supplier with id ${id} not found`);

    dto.id = id;

    if (dto.governmentId !== undefined) {
      const government = await this.governmentService.findById(dto.governmentId);
      if (!government) {
        throw new BadRequestException(`Government with id ${dto.governmentId} does not exist`);
      }
    }

    if (dto.commercialRegister) {
      const existingCR = await this.supplierService.findByFields({
        where: { commercialRegister: dto.commercialRegister },
      });
      if (existingCR && existingCR.id !== id)
        throw new BadRequestException(
          `Supplier with commercial register ${dto.commercialRegister} already exists`,
        );
    }

    if (dto.taxCard) {
      const existingTaxCard = await this.supplierService.findByFields({
        where: { taxCard: dto.taxCard },
      });
      if (existingTaxCard && existingTaxCard.id !== id)
        throw new BadRequestException(`Supplier with tax card ${dto.taxCard} already exists`);
    }

    if (dto.taxRegistrationNumber) {
      const existingTRN = await this.supplierService.findByFields({
        where: { taxRegistrationNumber: dto.taxRegistrationNumber },
      });
      if (existingTRN && existingTRN.id !== id)
        throw new BadRequestException(
          `Supplier with tax registration number ${dto.taxRegistrationNumber} already exists`,
        );
    }

    const entity = mapUpdateSupplierDtoToEntity(dto);
    return this.supplierService.update(entity, user?.email);
  }

  // ------------------------------------------------------------------------
  // DELETE
  // ------------------------------------------------------------------------
  @Delete('/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete supplier' })
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    const existing = await this.supplierService.findById(id);
    if (!existing) throw new NotFoundException(`Supplier with id ${id} not found`);

    await this.supplierService.delete(id);
  }
}
