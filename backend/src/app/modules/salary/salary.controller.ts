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
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard, Roles, RolesGuard, AuthUser } from 'src/core/security';
import { UserRole } from 'src/core/enums/user-role';
import type { Request } from 'src/core/utils/request';
import { SalaryService } from './salary.service';
import { SalaryDTO } from './dtos/salary.dto';
import { CreateSalaryDTO } from './dtos/create-salary.dto';
import { UpdateSalaryDTO } from './dtos/update-salary.dto';
import { SalaryQueryDTO } from './dtos/query-salary.dto';
import { PageRequest, pageRequestSortString } from 'src/core/utils/pagination.entity';
import { HeaderUtil } from 'src/core/utils/header-util';
import { mapSalaryToSalaryDtoSelective, mapUpdateSalaryDtoToEntity } from './salary.mapper';
import { UserDTO } from '../user/dtos/user.dto';
import { UserService } from '../user/user.service';

@Controller('api/salaries')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiTags('salaries-module')
export class SalaryController {
  logger = new Logger('SalaryController');

  constructor(
    private readonly salaryService: SalaryService,
    private readonly userService: UserService,
  ) {}

  @Get('/')
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({ summary: 'Get the list of salaries paginated' })
  @ApiResponse({
    status: 200,
    description: 'List all salaries',
    type: SalaryDTO,
    isArray: true,
  })
  async getAllSalaries(
    @Req() req: Request,
    @Query() query: SalaryQueryDTO,
  ): Promise<Partial<SalaryDTO>[]> {
    const pageRequest: PageRequest = new PageRequest(
      +(query.page ?? 1),
      +(query.pageSize ?? 10),
      pageRequestSortString(query.sortField, query.sortOrder),
    );

    const [results, count] = await this.salaryService.findAndCount(
      {
        skip: +pageRequest.page * pageRequest.size,
        take: +pageRequest.size,
        order: pageRequest.sort.asOrder(),
        relations: ['user'],
      },
      query,
    );

    const salaryDtos = mapSalaryToSalaryDtoSelective(
      results,
      [
        'id',
        'salaryType',
        'salaryAmount',
        'dailyWorkPrice',
        'commissionPerJourney',
        'commissionIsPercentage',
        'nolonPercent',
        'createdAt',
        'updatedAt',
      ],
      true,
    );

    HeaderUtil.addPaginationHeaders(
      req.res!,
      count,
      pageRequest.page,
      count > pageRequest.page * pageRequest.size,
    );

    return salaryDtos;
  }

  @Post('/')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Create or update salary by userId (upsert)',
    description:
      'Creates a new salary record for the user. If a salary already exists for userId, updates it instead of returning an error.',
  })
  @ApiResponse({ status: 201, description: 'Record created or updated', type: SalaryDTO })
  async create(
    @Body() createSalaryDTO: CreateSalaryDTO,
    @AuthUser() user: UserDTO,
  ): Promise<SalaryDTO | UpdateSalaryDTO> {
    const existingUser = await this.userService.findByFields({
      where: { id: createSalaryDTO.userId },
    });

    if (!existingUser) {
      throw new BadRequestException(`User with id ${createSalaryDTO.userId} does not exist`);
    }

    const existing = await this.salaryService.findByUserId(createSalaryDTO.userId);

    if (existing) {
      const updateDto: UpdateSalaryDTO = {
        id: existing.id,
        salaryType: createSalaryDTO.salaryType,
        salaryAmount: createSalaryDTO.salaryAmount,
        dailyWorkPrice: createSalaryDTO.dailyWorkPrice,
        commissionPerJourney: createSalaryDTO.commissionPerJourney,
        commissionIsPercentage: createSalaryDTO.commissionIsPercentage,
        nolonPercent: createSalaryDTO.nolonPercent,
      };
      const mappedSalary = mapUpdateSalaryDtoToEntity(updateDto, existing);
      return this.salaryService.update(mappedSalary, user?.email);
    }

    return this.salaryService.save(createSalaryDTO, user?.email);
  }

  @Put('/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update existing salary record' })
  @ApiResponse({ status: 200, description: 'Record updated', type: SalaryDTO })
  async update(
    @Param('id') id: number,
    @Body() dto: UpdateSalaryDTO,
    @AuthUser() user: any,
  ): Promise<UpdateSalaryDTO> {
    const existing = await this.salaryService.findById(id);
    if (!existing) throw new NotFoundException(`Salary with id ${id} not found`);

    dto.id = id;

    const mappedSalary = mapUpdateSalaryDtoToEntity(dto, existing);

    return this.salaryService.update(mappedSalary, user?.email);
  }

  @Delete('/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete salary record' })
  async delete(@Param('id') id: number): Promise<void> {
    const existing = await this.salaryService.findById(id);
    if (!existing) throw new NotFoundException(`Salary with id ${id} not found`);

    await this.salaryService.delete(existing.id);
  }
}
