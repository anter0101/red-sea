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
import { JourneyTransactionService } from './journey-transaction.service';
import { JourneyTransactionDTO } from './dtos/journey-transaction.dto';
import { CreateJourneyTransactionDTO } from './dtos/create-journey-transaction.dto';
import { UpdateJourneyTransactionDTO } from './dtos/update-journey-transaction.dto';
import {
  mapCreateJourneyTransactionDtoToEntity,
  mapJourneyTransactionToDtoSelective,
  mapUpdateJourneyTransactionDtoToEntity,
} from './journey-transaction.mapper';
import { JourneyService } from '../journey/journey.service';
import type { Request } from 'src/core/utils/request';
import { PageRequest, pageRequestSortString } from 'src/core/utils/pagination.entity';
import { HeaderUtil } from 'src/core/utils/header-util';
import { JourneyTransactionsGroupedDTO } from './dtos/create-journey-transactions-grouped.dto';
import { JourneyTransactionsBulkUpdateDTO } from './dtos/update-journey-transactions-grouped.dto';
import { JourneyTransaction } from './journey-transaction.entity';
import { FindOptionsWhere, In } from 'typeorm';
import { QueryJourneyTransactionDTO } from './dtos/query-journey-transaction.dto';

@Controller('api/journey-transactions')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiTags('journey-transactions-module')
export class JourneyTransactionController {
  logger = new Logger('JourneyTransactionController');

  constructor(
    private readonly journeyTransactionService: JourneyTransactionService,
    private readonly journeyService: JourneyService,
  ) {}

  @Get('/')
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({ summary: 'Get list of journey transactions paginated' })
  @ApiResponse({
    status: 200,
    description: 'Transactions list',
    type: JourneyTransactionDTO,
    isArray: true,
  })
  async getAll(@Req() req: Request, @Query() query: QueryJourneyTransactionDTO): Promise<any> {
    const pageRequest = new PageRequest(
      +(query.page ?? 1), // zero-based for skip
      +(query.pageSize ?? 10),
      pageRequestSortString(query.sortField, query.sortOrder),
    );
    const whereConditions: FindOptionsWhere<JourneyTransaction> = {};

    if (req.query.journeyId) {
      whereConditions.journey = { id: +req.query.journeyId };
    }

    const [results, count] = await this.journeyTransactionService.findAndCount(
      {
        skip: +pageRequest.page * pageRequest.size,
        take: +pageRequest.size,
        order: pageRequest.sort.asOrder(),
        where: whereConditions,
      },
      query,
    );

    const dtos = mapJourneyTransactionToDtoSelective(results);

    HeaderUtil.addPaginationHeaders(
      req.res!,
      count,
      pageRequest.page,
      count > pageRequest.page * pageRequest.size,
    );

    return dtos;
  }

  @Post('/')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a transaction for a journey' })
  @ApiResponse({ status: 201, description: 'Transaction created', type: JourneyTransactionDTO })
  async create(@Body() dto: CreateJourneyTransactionDTO, @AuthUser() user: any) {
    const journey = await this.journeyService.findById(dto.journeyId);
    if (!journey) throw new NotFoundException(`Journey with id ${dto.journeyId} not found`);

    const alreadyExists = await this.journeyTransactionService.findByFields({
      where: {
        journey: { id: dto.journeyId },
        category: dto.category,
      },
    });

    if (alreadyExists)
      throw new NotFoundException(`Journey with id ${dto.journeyId} already has a transaction`);

    const entity = mapCreateJourneyTransactionDtoToEntity(dto);
    const saved = await this.journeyTransactionService.save(entity, user?.email);

    return mapJourneyTransactionToDtoSelective(saved);
  }
  @Post('/bulk')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create or update multiple transactions for a journey' })
  @ApiResponse({
    status: 201,
    description: 'Transactions created or updated',
    type: [JourneyTransactionDTO],
  })
  async createBulk(
    @Body() payload: JourneyTransactionsGroupedDTO,
    @AuthUser() user: any,
  ): Promise<Partial<JourneyTransactionDTO>[]> {
    const { journeyId, transactionType, transactions } = payload;

    const journey = await this.journeyService.findById(journeyId);
    if (!journey) throw new NotFoundException(`Journey with id ${journeyId} not found`);

    // Get existing transactions for this journey
    const existingTransactions = await this.journeyTransactionService.find({
      where: { journey: { id: journeyId } },
    });

    const existingMap = new Map<string, JourneyTransaction>();
    existingTransactions.forEach((tx) => {
      existingMap.set(tx.category, tx);
    });

    const toCreate: JourneyTransaction[] = [];
    const toUpdate: JourneyTransaction[] = [];

    // Process each incoming transaction
    for (const tx of transactions) {
      const existing = existingMap.get(tx.category);

      const txWithDefaults = {
        ...tx,
        transactionType: transactionType,
        journeyId,
      };

      if (existing) {
        // Update existing transaction
        const updatedEntity = mapUpdateJourneyTransactionDtoToEntity(txWithDefaults, existing);
        toUpdate.push(updatedEntity);
      } else {
        // Create new transaction
        const newEntity = mapCreateJourneyTransactionDtoToEntity(txWithDefaults);
        toCreate.push(newEntity);
      }
    }

    await this.journeyService.update(journey, user?.email);

    // Save all changes
    const saved: JourneyTransaction[] = [];
    if (toCreate.length > 0) {
      const createdTransactions = await this.journeyTransactionService.saveMany(
        toCreate,
        user?.email,
      );
      saved.push(...createdTransactions);
    }
    if (toUpdate.length > 0) {
      const updatedTransactions = await this.journeyTransactionService.saveMany(
        toUpdate,
        user?.email,
      );
      saved.push(...updatedTransactions);
    }

    return mapJourneyTransactionToDtoSelective(saved);
  }

  @Get('/bulk/:journeyId')
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({ summary: 'Get grouped transactions for a journey' })
  @ApiResponse({
    status: 200,
    description: 'Grouped journey transactions (same shape as bulk update)',
    type: JourneyTransactionsBulkUpdateDTO,
  })
  /*************  ✨ Windsurf Command ⭐  *************/
  /**
   * Retrieves all transactions for a journey grouped by transactionType.
   * @return Promise<JourneyTransactionsBulkUpdateDTO>
   */
  /*******  74d7ff0e-755d-40a5-a29b-d6724705f26e  *******/
  async getBulkByJourney(
    @Param('journeyId', ParseIntPipe) journeyId: number,
  ): Promise<JourneyTransactionsBulkUpdateDTO> {
    const journey = await this.journeyService.findById(journeyId);
    if (!journey) {
      throw new NotFoundException(`Journey with id ${journeyId} not found`);
    }

    const transactions = await this.journeyTransactionService.find({
      where: { journey: { id: journeyId } },
      order: { id: 'ASC' },
    });

    return {
      journeyId,
      transactions: transactions.map((tx) => ({
        id: tx.id,
        transactionType: tx.transactionType,
        category: tx.category,
        amount: tx.amount,
        quantity: tx.quantity,
        unitPrice: tx.unitPrice,
        placeOrService: tx.placeOrService,
        invoiceUrl: tx.invoiceUrl,
        description: tx.description,
      })),
    };
  }

  @Put('/bulk')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update multiple transactions for a journey' })
  @ApiResponse({ status: 200, description: 'Transactions updated', type: [JourneyTransactionDTO] })
  async updateBulk(
    @Body() payload: JourneyTransactionsBulkUpdateDTO,
    @AuthUser() user: any,
  ): Promise<Partial<JourneyTransactionDTO>[]> {
    const { journeyId, transactions } = payload;

    const journey = await this.journeyService.findById(journeyId);
    if (!journey) throw new NotFoundException(`Journey with id ${journeyId} not found`);

    // Load existing transactions for this journey by ids from payload
    const ids = Array.from(
      new Set(transactions.map((tx) => Number((tx as any).id)).filter((id) => !Number.isNaN(id))),
    );
    if (!ids.length) {
      throw new NotFoundException('No transaction ids provided for bulk update');
    }

    const existingList = await this.journeyTransactionService.find({
      where: {
        id: In(ids),
        journey: { id: journeyId },
      },
    });

    const existingMap = new Map<number, JourneyTransaction>();
    existingList.forEach((tx) => existingMap.set(tx.id, tx));

    const toUpdate: JourneyTransaction[] = [];

    for (const dto of transactions as any[]) {
      const id = dto.id as number;
      const existing = existingMap.get(id);
      if (!existing) {
        throw new NotFoundException(`Transaction with id ${id} not found for journey ${journeyId}`);
      }
      const updatedEntity = mapUpdateJourneyTransactionDtoToEntity(dto, existing);
      toUpdate.push(updatedEntity);
    }

    const saved = await this.journeyTransactionService.saveMany(toUpdate, user?.email);

    return mapJourneyTransactionToDtoSelective(saved);
  }

  @Put('/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a transaction' })
  @ApiResponse({ status: 200, description: 'Transaction updated', type: JourneyTransactionDTO })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateJourneyTransactionDTO,
    @AuthUser() user: any,
  ) {
    const existing = await this.journeyTransactionService.findById(id);
    if (!existing) throw new NotFoundException(`Transaction with id ${id} not found`);

    const updatedEntity = mapUpdateJourneyTransactionDtoToEntity(dto, existing);
    const updated = await this.journeyTransactionService.update(updatedEntity, user?.email);
    return mapJourneyTransactionToDtoSelective(updated);
  }

  @Delete('/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a transaction' })
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    const existing = await this.journeyTransactionService.findById(id);
    if (!existing) throw new NotFoundException(`Transaction with id ${id} not found`);
    await this.journeyTransactionService.delete(existing.id);
  }
}
