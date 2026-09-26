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

import { AccountService } from '../account/account.service';
import { ClientService } from './client.service';
import { ClientDTO } from './dtos/client.dto';
import { CreateClientDTO } from './dtos/create-client.dto';
import { UpdateClientDTO } from './dtos/update-client.dto';

import { PageRequest, pageRequestSortString } from 'src/core/utils/pagination.entity';
import { HeaderUtil } from 'src/core/utils/header-util';

import {
  mapCreateClientDtoToEntity,
  mapClientToClientDtoSelective,
  mapUpdateClientDtoToEntity,
} from './client.mapper';

import { UserDTO } from '../user/dtos/user.dto';
import { ClientQueryDTO } from './dtos/query-client.dto';

@Controller('api/clients')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiTags('clients-module')
export class ClientController {
  private readonly logger = new Logger('ClientController');

  constructor(
    private readonly clientService: ClientService,
    private readonly accountService: AccountService,
  ) {}

  // ------------------------------------------------------------------------
  // GET ALL (paginated)
  // ------------------------------------------------------------------------
  @Get('/')
  @Roles(UserRole.ADMIN, UserRole.USER, UserRole.DATA_ENTRY)
  @ApiOperation({ summary: 'Get list of clients paginated' })
  @ApiResponse({
    status: 200,
    description: 'List of clients',
    type: ClientDTO,
    isArray: true,
  })
  async getAllClients(
    @Req() req: Request,
    @Query() query: ClientQueryDTO,
  ): Promise<Partial<ClientDTO>[]> {
    const pageRequest = new PageRequest(
      +(query.page ?? 1),
      +(query.pageSize ?? 10),
      pageRequestSortString(query.sortField, query.sortOrder),
    );

    const [results, count] = await this.clientService.findAndCount(
      {
        skip: +pageRequest.page * pageRequest.size,
        take: +pageRequest.size,
        order: pageRequest.sort.asOrder(),
      },
      query,
    );

    const dtos = mapClientToClientDtoSelective(results, [
      'id',
      'name',
      'commercialRecord',
      'taxInvoice',
      'companyCode',
      'destinationsFile',
      'pricingSheetKind',
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
  // GET BY ID
  // ------------------------------------------------------------------------
  @Get('/:id')
  @Roles(UserRole.ADMIN, UserRole.USER, UserRole.DATA_ENTRY)
  @ApiOperation({ summary: 'Get client by id' })
  @ApiResponse({ status: 200, description: 'Client found', type: ClientDTO })
  async getClientById(@Param('id', ParseIntPipe) id: number): Promise<ClientDTO> {
    const existing = await this.clientService.findByFields({ where: { id } });
    if (!existing) throw new NotFoundException(`Client with id ${id} not found`);

    return mapClientToClientDtoSelective(existing, [
      'id',
      'name',
      'commercialRecord',
      'taxInvoice',
      'companyCode',
      'destinationsFile',
      'pricingSheetKind',
      'createdBy',
      'updatedBy',
      'createdAt',
      'updatedAt',
    ]) as ClientDTO;
  }

  // ------------------------------------------------------------------------
  // CREATE
  // ------------------------------------------------------------------------
  @Post('/')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new client' })
  @ApiResponse({ status: 201, description: 'Record created', type: ClientDTO })
  async create(@Body() dto: CreateClientDTO, @AuthUser() user: UserDTO): Promise<ClientDTO> {
    const existing = await this.clientService.findByFields({
      where: { commercialRecord: dto.commercialRecord },
    });

    if (existing)
      throw new BadRequestException(
        `Client with commercial record ${dto.commercialRecord} already exists`,
      );

    const entity = mapCreateClientDtoToEntity(dto);
    const saved = await this.clientService.save(entity, user?.email);
    await this.accountService.createClientAccounts(saved.id, saved.name, user?.email);
    return saved;
  }

  // ------------------------------------------------------------------------
  // UPDATE
  // ------------------------------------------------------------------------
  @Put('/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update client' })
  @ApiResponse({ status: 200, description: 'Record updated', type: ClientDTO })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateClientDTO,
    @AuthUser() user: UserDTO,
  ): Promise<ClientDTO> {
    const existing = await this.clientService.findByFields({ where: { id } });
    if (!existing) throw new NotFoundException(`Client with id ${id} not found`);

    dto.id = id;

    // Check duplicate Commercial Record
    if (dto.commercialRecord) {
      const existingCR = await this.clientService.findByFields({
        where: { commercialRecord: dto.commercialRecord },
      });

      if (existingCR && existingCR.id !== id) {
        throw new BadRequestException(
          `Client with commercial record ${dto.commercialRecord} already exists`,
        );
      }
    }

    const entity = mapUpdateClientDtoToEntity(dto);
    return this.clientService.update(entity, user?.email);
  }

  // ------------------------------------------------------------------------
  // DELETE
  // ------------------------------------------------------------------------
  @Delete('/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Soft delete client' })
  async delete(@Param('id', ParseIntPipe) id: number, @AuthUser() user: UserDTO): Promise<void> {
    const existing = await this.clientService.findById(id);
    if (!existing) throw new NotFoundException(`Client with id ${id} not found`);

    await this.clientService.softDelete(id, user?.email);
  }
}
