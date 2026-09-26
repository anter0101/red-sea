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
import type { Request } from 'src/core/utils/request';
import { PageRequest, pageRequestSortString } from 'src/core/utils/pagination.entity';
import { HeaderUtil } from 'src/core/utils/header-util';

import { TransactionService } from './transaction.service';
import { CreateTransactionDTO } from './dtos/create-transaction.dto';
import {
  mapTransactionToTransactionDtoSelective,
  mapCreateTransactionDtoToEntity,
  mapUpdateTransactionDtoToEntity,
} from './transaction.mapper';
import { QueryTransactionDTO } from './dtos/query-transaction.dto';
import { TransactionDTO } from './dtos/transaction.dto';
import { UpdateTransactionDTO } from './dtos/update-transaction.dto';
import { AccountService } from '../account/account.service';

@Controller('api/accounting/transactions')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiTags('accounting-transactions')
export class TransactionController {
  logger = new Logger('TransactionController');

  constructor(
    private readonly transactionService: TransactionService,
    private readonly accountService: AccountService,
  ) {}

  @Get('/')
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({ summary: 'Get list of transactions paginated' })
  @ApiResponse({
    status: 200,
    description: 'List of transactions',
    type: TransactionDTO,
    isArray: true,
  })
  async getAll(
    @Req() req: Request,
    @Query() query: QueryTransactionDTO,
  ): Promise<Partial<TransactionDTO>[]> {
    const pageRequest = new PageRequest(
      +(query.page ?? 1),
      +(query.pageSize ?? 10),
      pageRequestSortString(query.sortField, query.sortOrder),
    );

    const [transactions, count] = await this.transactionService.findAndCount(query);

    HeaderUtil.addPaginationHeaders(
      req.res!,
      count,
      pageRequest.page,
      count > pageRequest.page * pageRequest.size,
    );

    return mapTransactionToTransactionDtoSelective(transactions);
  }

  @Get('/:id')
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({ summary: 'Get transaction by id' })
  @ApiResponse({ status: 200, description: 'The found transaction', type: TransactionDTO })
  async getOne(@Param('id', ParseIntPipe) id: number): Promise<Partial<TransactionDTO>> {
    const transaction = await this.transactionService.findById(id);
    if (!transaction) throw new NotFoundException(`Transaction with id ${id} not found`);
    return mapTransactionToTransactionDtoSelective(transaction);
  }

  @Post('/')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new transaction' })
  @ApiResponse({ status: 201, description: 'Transaction created', type: TransactionDTO })
  async create(
    @Body() dto: CreateTransactionDTO,
    @AuthUser() user: any,
  ): Promise<Partial<TransactionDTO>> {
    for (const line of dto.transactionLines) {
      await this.accountService.ensureAccountAcceptsJournalLines(line.accountId);
    }

    // each account appers once
    const accountIds = dto.transactionLines.map((line) => line.accountId);
    const uniqueAccountIds = new Set(accountIds);
    if (accountIds.length !== uniqueAccountIds.size)
      throw new BadRequestException(`Each account should appear once`);

    const entity = mapCreateTransactionDtoToEntity(dto);
    const saved = await this.transactionService.save(entity, user?.email);
    return mapTransactionToTransactionDtoSelective(saved);
  }

  @Put('/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update transaction' })
  @ApiResponse({ status: 200, description: 'Transaction updated', type: TransactionDTO })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTransactionDTO,
    @AuthUser() user: any,
  ): Promise<Partial<TransactionDTO>> {
    const existing = await this.transactionService.findById(id);
    if (!existing) throw new NotFoundException(`Transaction with id ${id} not found`);

    const updated = mapUpdateTransactionDtoToEntity(dto, existing);
    const saved = await this.transactionService.update(updated, user?.email);
    return mapTransactionToTransactionDtoSelective(saved);
  }

  @Delete('/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete transaction' })
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    const existing = await this.transactionService.findById(id);
    if (!existing) throw new NotFoundException(`Transaction with id ${id} not found`);
    await this.transactionService.delete(existing.id);
  }
}
