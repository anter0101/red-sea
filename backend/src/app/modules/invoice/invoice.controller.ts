import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DataSource } from 'typeorm';
import { AuthGuard, AuthUser, Roles, RolesGuard } from 'src/core/security';
import { UserRole } from 'src/core/enums/user-role';
import { HeaderUtil } from 'src/core/utils/header-util';
import { PageRequest, pageRequestSortString } from 'src/core/utils/pagination.entity';
import type { Request } from 'src/core/utils/request';
import { withTransaction } from 'src/core/utils/transaction';
import { CreateInvoiceDTO } from './dtos/create-invoice.dto';
import { QueryInvoiceDTO } from './dtos/query-invoice.dto';
import { InvoiceService } from './invoice.service';

@Controller('api/invoices')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiTags('invoice-module')
export class InvoiceController {
  constructor(
    private readonly invoiceService: InvoiceService,
    private readonly dataSource: DataSource,
  ) {}

  @Post('preview')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Preview the invoice journal before issuing' })
  preview(@Body() body: CreateInvoiceDTO) {
    return this.invoiceService.preview(body);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Issue one invoice for the selected journeys' })
  issue(@Body() body: CreateInvoiceDTO, @AuthUser() user: { email?: string }) {
    return withTransaction(this.dataSource, (manager) =>
      this.invoiceService.issue(body, user?.email, manager),
    );
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'List invoices' })
  async findAll(@Req() req: Request, @Query() query: QueryInvoiceDTO) {
    const pageRequest = new PageRequest(
      +(query.page ?? 1),
      +(query.pageSize ?? 10),
      pageRequestSortString(query.sortField, query.sortOrder),
    );
    const [rows, count] = await this.invoiceService.findAndCount(query);
    HeaderUtil.addPaginationHeaders(
      req.res!,
      count,
      pageRequest.page,
      count > pageRequest.page * pageRequest.size,
    );
    return rows;
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get one invoice' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const invoice = await this.invoiceService.findById(id);
    if (!invoice) throw new NotFoundException('الفاتورة غير موجودة');
    return invoice;
  }
}
