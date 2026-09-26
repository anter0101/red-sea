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
import { PageRequest, pageRequestSortString } from 'src/core/utils/pagination.entity';
import { HeaderUtil } from 'src/core/utils/header-util';

import { TransactionLineService } from './transaction-line.service';
import { CreateTransactionLineDTO } from './dtos/create-transaction-line.dto';
import {
  mapTransactionLineToTransactionLineDtoSelective,
  mapCreateTransactionLineDtoToEntity,
  mapUpdateTransactionLineDtoToEntity,
} from './transaction-line.mapper';
import { TransactionLineDTO } from './dtos/transaction-line.dto';
import { UpdateTransactionLineDTO } from './dtos/update-transaction-line.dto';
import { PaginateDTO } from 'src/core/utils/paginate.dto';

@Controller('api/accounting/transaction-lines')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiTags('accounting-transaction-lines')
export class TransactionLineController {
  logger = new Logger('TransactionLineController');

  constructor(private readonly transactionLineService: TransactionLineService) {}

  @Get('/')
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({ summary: 'Get list of transaction lines paginated' })
  @ApiResponse({
    status: 200,
    description: 'List of transaction lines',
    type: TransactionLineDTO,
    isArray: true,
  })
  async getAll(
    @Req() req: Request,
    @Query() query: PaginateDTO,
  ): Promise<Partial<TransactionLineDTO>[]> {
    const pageRequest = new PageRequest(
      +(query.page ?? 1),
      +(query.pageSize ?? 10),
      pageRequestSortString(query.sortField, query.sortOrder),
    );

    const [lines, count] = await this.transactionLineService.findAndCount({
      skip: (pageRequest.page - 1) * pageRequest.size,
      take: pageRequest.size,
      order: pageRequest.sort.asOrder(),
      relations: ['account', 'transaction'],
    });

    HeaderUtil.addPaginationHeaders(
      req.res!,
      count,
      pageRequest.page,
      count > pageRequest.page * pageRequest.size,
    );

    return mapTransactionLineToTransactionLineDtoSelective(lines);
  }

  @Get('/:id')
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({ summary: 'Get transaction line by id' })
  @ApiResponse({ status: 200, description: 'The found transaction line', type: TransactionLineDTO })
  async getOne(@Param('id', ParseIntPipe) id: number): Promise<Partial<TransactionLineDTO>> {
    const line = await this.transactionLineService.findById(id);
    if (!line) throw new NotFoundException(`Transaction line with id ${id} not found`);
    return mapTransactionLineToTransactionLineDtoSelective(line);
  }

  @Post('/')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new transaction line' })
  @ApiResponse({ status: 201, description: 'Transaction line created', type: TransactionLineDTO })
  async create(
    @Body() dto: CreateTransactionLineDTO,
    @AuthUser() user: any,
  ): Promise<Partial<TransactionLineDTO>> {
    const entity = mapCreateTransactionLineDtoToEntity(dto);
    const saved = await this.transactionLineService.save(entity, user?.email);
    return mapTransactionLineToTransactionLineDtoSelective(saved);
  }

  @Put('/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update transaction line' })
  @ApiResponse({ status: 200, description: 'Transaction line updated', type: TransactionLineDTO })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTransactionLineDTO,
    @AuthUser() user: any,
  ): Promise<Partial<TransactionLineDTO>> {
    const existing = await this.transactionLineService.findById(id);
    if (!existing) throw new NotFoundException(`Transaction line with id ${id} not found`);

    const updated = mapUpdateTransactionLineDtoToEntity(dto, existing);
    const saved = await this.transactionLineService.update(updated, user?.email);
    return mapTransactionLineToTransactionLineDtoSelective(saved);
  }

  @Delete('/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete transaction line' })
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    const existing = await this.transactionLineService.findById(id);
    if (!existing) throw new NotFoundException(`Transaction line with id ${id} not found`);
    await this.transactionLineService.delete(existing.id);
  }
}
