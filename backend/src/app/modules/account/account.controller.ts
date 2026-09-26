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

import { AccountService } from './account.service';
import { CreateAccountDTO } from './dtos/create-account.dto';
import {
  mapAccountToAccountDtoSelective,
  mapCreateAccountDtoToEntity,
  mapUpdateAccountDtoToEntity,
} from './account.mapper';
import { QueryAccountDTO } from './dtos/query-account.dto';
import { AccountDTO } from './dtos/account.dto';
import { UpdateAccountDTO } from './dtos/update-account.dto';
import { SetAccountOpeningBalanceDTO } from './dtos/set-account-opening-balance.dto';

@Controller('api/accounting/accounts')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiTags('accounting-accounts')
export class AccountController {
  logger = new Logger('AccountController');

  constructor(private readonly accountService: AccountService) {}

  @Get('/')
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({ summary: 'Get list of accounts paginated' })
  @ApiResponse({ status: 200, description: 'List of accounts', type: AccountDTO, isArray: true })
  async getAll(
    @Req() req: Request,
    @Query() query: QueryAccountDTO,
  ): Promise<Partial<AccountDTO>[]> {
    const pageRequest = new PageRequest(
      +(query.page ?? 1),
      +(query.pageSize ?? 10),
      pageRequestSortString(query.sortField, query.sortOrder),
    );

    const [accounts, count] = await this.accountService.findAndCount(query);

    HeaderUtil.addPaginationHeaders(
      req.res!,
      count,
      pageRequest.page,
      count > pageRequest.page * pageRequest.size,
    );

    return mapAccountToAccountDtoSelective(accounts, [
      'id',
      'code',
      'name',
      'type',
      'isLeaf',
      'isSystem',
      'normalBalance',
      'openingBalance',
      'openingBalanceLocked',
      'parentAccount',
      'createdBy',
      'updatedBy',
      'createdAt',
      'updatedAt',
    ]);
  }

  @Get('/:id')
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({ summary: 'Get account by id' })
  @ApiResponse({ status: 200, description: 'The found account', type: AccountDTO })
  async getOne(@Param('id', ParseIntPipe) id: number): Promise<Partial<AccountDTO>> {
    const account = await this.accountService.findById(id);
    if (!account) throw new NotFoundException(`Account with id ${id} not found`);
    return mapAccountToAccountDtoSelective(account, [
      'id',
      'code',
      'name',
      'type',
      'isLeaf',
      'isSystem',
      'normalBalance',
      'openingBalance',
      'openingBalanceLocked',
      'parentAccount',
      'childAccounts',
      'createdBy',
      'updatedBy',
      'createdAt',
      'updatedAt',
    ]);
  }

  @Post('/')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Create a new account',
    description:
      'Root accounts: set type and normalBalance freely. Child accounts: parent must exist and be active; normalBalance always matches the parent; type must match the parent, except CASH is allowed under an ASSET parent (e.g. cash/bank ledgers).',
  })
  @ApiResponse({ status: 201, description: 'Account created', type: AccountDTO })
  async create(@Body() dto: CreateAccountDTO, @AuthUser() user: any): Promise<Partial<AccountDTO>> {
    const entity = mapCreateAccountDtoToEntity(dto);
    const saved = await this.accountService.save(entity, user?.email);
    return mapAccountToAccountDtoSelective(saved, [
      'id',
      'code',
      'name',
      'type',
      'isLeaf',
      'isSystem',
      'normalBalance',
      'openingBalance',
      'openingBalanceLocked',
      'parentAccount',
      'createdBy',
      'updatedBy',
      'createdAt',
      'updatedAt',
    ]);
  }

  @Put('/:id/opening-balance')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Set opening balance (once)',
    description:
      'Stores the account opening balance used in financial reports before posted activity. ' +
      'Can only be called once per non-system account. System accounts are set by the seeder.',
  })
  @ApiResponse({ status: 200, description: 'Opening balance saved', type: AccountDTO })
  async setOpeningBalance(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: SetAccountOpeningBalanceDTO,
    @AuthUser() user: any,
  ): Promise<Partial<AccountDTO>> {
    const saved = await this.accountService.setOpeningBalance(id, dto.amount, user?.email);
    return mapAccountToAccountDtoSelective(saved, [
      'id',
      'code',
      'name',
      'type',
      'isLeaf',
      'isSystem',
      'normalBalance',
      'openingBalance',
      'openingBalanceLocked',
      'parentAccount',
      'createdBy',
      'updatedBy',
      'createdAt',
      'updatedAt',
    ]);
  }

  @Put('/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Update account',
    description:
      'normalBalance cannot be changed after create (set once for root accounts at creation, or inherited from the parent for children). If the account has a parent, type must match the parent (or CASH under an ASSET parent).',
  })
  @ApiResponse({ status: 200, description: 'Account updated', type: AccountDTO })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAccountDTO,
    @AuthUser() user: any,
  ): Promise<Partial<AccountDTO>> {
    const existing = await this.accountService.findById(id);
    if (!existing) throw new NotFoundException(`Account with id ${id} not found`);

    if (dto.parentAccountId !== undefined && dto.parentAccountId !== null) {
      // Prevent self-reference
      if (dto.parentAccountId === id) {
        throw new BadRequestException('An account cannot be its own parent');
      }

      const parentAccount = await this.accountService.findById(dto.parentAccountId);
      if (!parentAccount) {
        throw new NotFoundException(`Parent account with id ${dto.parentAccountId} not found`);
      }

      // Prevent circular reference: new parent must not be a descendant of current account
      const wouldCreateCycle = await this.accountService.isDescendant(dto.parentAccountId, id);
      if (wouldCreateCycle) {
        throw new BadRequestException(
          `Circular reference detected: account ${dto.parentAccountId} is already a descendant of account ${id}`,
        );
      }
    }

    const updated = mapUpdateAccountDtoToEntity(dto, existing);
    const saved = await this.accountService.update(updated, user?.email);
    return mapAccountToAccountDtoSelective(saved, [
      'id',
      'code',
      'name',
      'type',
      'isLeaf',
      'isSystem',
      'normalBalance',
      'openingBalance',
      'openingBalanceLocked',
      'parentAccount',
      'createdBy',
      'updatedBy',
      'createdAt',
      'updatedAt',
    ]);
  }

  @Delete('/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete account' })
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    // All validation (children, transaction lines, 404) is handled in the service
    await this.accountService.delete(id);
  }
}
