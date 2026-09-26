import {
  BadRequestException,
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Body,
  Req,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CarModelService } from './car-model.service';
import { CarManufacturerService } from '../car-manufacturer/car-manufacturer.service';
import { HeaderUtil } from 'src/core/utils/header-util';
import { Roles } from 'src/core/security';
import { UserRole } from 'src/core/enums/user-role';
import { CarModelDTO } from './dtos/car-model.dto';
import { CarModelQueryDTO } from './dtos/query-car-model.dto';
import { PageRequest, pageRequestSortString } from 'src/core/utils/pagination.entity';
import type { Request } from 'src/core/utils/request';
import { CreateCarModelDTO } from './dtos/create-car-model.dto';
import { mapCarModelToDtoSelective } from './car-model.mapper';

@ApiTags('Car Models')
@Controller('api/car-models')
export class CarModelController {
  constructor(
    private readonly carModelService: CarModelService,
    private readonly carManufacturerService: CarManufacturerService,
  ) {}

  // ------------------------------------------------------------------------
  // GET ALL PAGINATED
  // ------------------------------------------------------------------------
  @Get('/')
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({ summary: 'Get list of car models paginated' })
  @ApiResponse({
    status: 200,
    type: CarModelDTO,
    isArray: true,
  })
  async getAll(
    @Req() req: Request,
    @Query() query: CarModelQueryDTO,
  ): Promise<Partial<CarModelDTO>[]> {
    const pageRequest = new PageRequest(
      +(query.page ?? 1),
      +(query.pageSize ?? 10),
      pageRequestSortString(query.sortField, query.sortOrder),
    );

    const where: any = {};

    if (query.name) where.name = query.name;
    if (query.manufacturerId) where.manufacturer = { id: query.manufacturerId };

    const [results, count] = await this.carModelService.findAndCount(
      {
        where,
        skip: +pageRequest.page * pageRequest.size,
        take: +pageRequest.size,
        order: pageRequest.sort.asOrder(),
      },
      query,
    );

    const dtos = mapCarModelToDtoSelective(results, [
      'id',
      'name',
      'manufacturer',
      'createdAt',
      'updatedAt',
      'createdBy',
      'updatedBy',
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
  // CREATE
  // ------------------------------------------------------------------------
  @Post('/')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a car model' })
  async create(@Body() dto: CreateCarModelDTO, @Req() req: Request) {
    const manufacturer = await this.carManufacturerService.findById(dto.manufacturerId);
    if (!manufacturer) {
      throw new BadRequestException(
        `Car manufacturer with id ${dto.manufacturerId} does not exist`,
      );
    }

    return await this.carModelService.create(
      {
        name: dto.name,
        manufacturer: { id: dto.manufacturerId } as any,
      },
      req.user?.username,
    );
  }

  // ------------------------------------------------------------------------
  // DELETE
  // ------------------------------------------------------------------------
  @Delete('/:id')
  @Roles(UserRole.ADMIN)
  async delete(@Param('id') id: number) {
    await this.carModelService.delete(id);
    return { message: 'Car model deleted' };
  }
}
