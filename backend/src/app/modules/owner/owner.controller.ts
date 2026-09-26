// src/owner/owner.controller.ts
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
import { PageRequest, pageRequestSortString } from 'src/core/utils/pagination.entity';

import { OwnerService } from './owner.service';

import { OwnerDTO } from './dtos/owner.dto';
import { CreateOwnerDTO } from './dtos/create-owner.dto';
import { UpdateOwnerDTO } from './dtos/update-owner.dto';

import {
  mapOwnerToOwnerDtoSelective,
  mapCreateOwnerDtoToEntity,
  mapUpdateOwnerDtoToEntity,
} from './owner.mapper';
import { OwnerQueryDTO } from './dtos/query-owner.dto';
import { BulkAssignOwnerDTO } from './dtos/bulk-assign.dto';
import { RelCarOwnerService } from '../rel-car-owner/rel-car-owner.services';
import { RelTrailerOwnerService } from '../rel-trailer-owner/rel-trailer-owner.services';
import { TrailerService } from '../trailer/trailer.service';
import { CarService } from '../car/car.service';
import { DataSource, In } from 'typeorm';
import { withTransaction } from 'src/core/utils/transaction';
import { RelCarOwner } from '../rel-car-owner/rel-car-owner.entity';
import { RelTrailerOwner } from '../rel-trailer-owner/rel-trailer-owner.entity';
import { OwnerShipType } from 'src/core/enums/ownerShip-types';

@Controller('api/owners')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiTags('owners-module')
export class OwnerController {
  logger = new Logger('OwnerController');

  constructor(
    private readonly ownerService: OwnerService,
    private readonly relCarOwnerService: RelCarOwnerService,
    private readonly relTrailerOwnerService: RelTrailerOwnerService,
    private readonly carService: CarService,
    private readonly trailerService: TrailerService,
    private readonly dataSource: DataSource,
  ) {}

  // GET ALL (PAGINATED)
  @Get('/')
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({ summary: 'Get list of owners (paginated)' })
  @ApiResponse({ status: 200, description: 'List all owners', type: OwnerDTO, isArray: true })
  async getAllOwners(@Req() req: Request, @Query() query: OwnerQueryDTO) {
    const pageRequest = new PageRequest(
      +(query.page ?? 1),
      +(query.pageSize ?? 10),
      pageRequestSortString(query.sortField, query.sortOrder),
    );

    const [results, count] = await this.ownerService.findAndCount(
      {
        skip: pageRequest.page * pageRequest.size,
        take: pageRequest.size,
        order: pageRequest.sort.asOrder(),
        relations: [
          'carOwnerships',
          'carOwnerships.car',
          'trailerOwnerships',
          'trailerOwnerships.trailer',
        ],
      },
      query,
    );

    const dtos = mapOwnerToOwnerDtoSelective(results, [
      'id',
      'name',
      'phone',
      'address',
      'email',
      'bankAccountNumber',
      'bankName',
      'transactionType',
      'trailerOwnerships',
      'carOwnerships',
      'createdAt',
      'updatedAt',
      'createdBy',
      'updatedBy',
    ]);

    req.res!.setHeader('X-Total-Count', count);
    req.res!.setHeader('X-Page', pageRequest.page);
    req.res!.setHeader(
      'X-Has-Next-Page',
      count > pageRequest.page * pageRequest.size + results.length ? 'true' : 'false',
    );

    return dtos;
  }

  // GET BY ID
  @Get('/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get owner by ID' })
  @ApiResponse({ status: 200, description: 'Owner found', type: OwnerDTO })
  async getOwnerById(@Param('id', ParseIntPipe) id: number): Promise<Partial<OwnerDTO>> {
    const owner = await this.ownerService.findOne({
      where: { id },
      relations: [
        'carOwnerships',
        'carOwnerships.car',
        'trailerOwnerships',
        'trailerOwnerships.trailer',
      ],
    });

    if (!owner) throw new NotFoundException(`Owner with id ${id} not found`);

    return mapOwnerToOwnerDtoSelective(owner, [
      'id',
      'name',
      'phone',
      'address',
      'email',
      'bankAccountNumber',
      'bankName',
      'transactionType',
      'trailerOwnerships',
      'carOwnerships',
      'createdAt',
      'updatedAt',
      'createdBy',
      'updatedBy',
    ]);
  }
  // Only change in create & update:
  @Post('/')
  async create(@Body() dto: CreateOwnerDTO, @AuthUser() user: any): Promise<Partial<OwnerDTO>> {
    // Validate bank details: if one is provided, both must be provided
    if ((dto.bankAccountNumber && !dto.bankName) || (!dto.bankAccountNumber && dto.bankName)) {
      throw new BadRequestException(
        'Both bankAccountNumber and bankName must be provided together or both must be empty',
      );
    }

    // Check for duplicate phone number in database
    const existingPhone = await this.ownerService.findByFields({ where: { phone: dto.phone } });
    if (existingPhone) {
      throw new BadRequestException(`Owner with phone number ${dto.phone} already exists`);
    }

    // Check for duplicate email in database (if provided)
    if (dto.email) {
      const existingEmail = await this.ownerService.findByFields({ where: { email: dto.email } });
      if (existingEmail) {
        throw new BadRequestException(`Owner with email ${dto.email} already exists`);
      }
    }

    // Check for duplicate bank account number in database (if provided)
    if (dto.bankAccountNumber) {
      const existingBankAccount = await this.ownerService.findByFields({
        where: { bankAccountNumber: dto.bankAccountNumber },
      });
      if (existingBankAccount) {
        throw new BadRequestException(
          `Owner with bank account number ${dto.bankAccountNumber} already exists`,
        );
      }
    }

    const owner = mapCreateOwnerDtoToEntity(dto);

    // Validate car ownerships before transaction
    if (owner.carOwnerships && owner.carOwnerships.length > 0) {
      const carIds = owner.carOwnerships.map((rel) => rel.car.id);

      // Check for duplicates within the request array
      const hasDuplicates = carIds.length !== new Set(carIds).size;
      if (hasDuplicates) {
        throw new BadRequestException('Duplicate car ownerships found');
      }

      // Check if all car IDs exist
      for (const carId of carIds) {
        const car = await this.carService.findById(carId);
        if (!car) {
          throw new NotFoundException(`Car with id ${carId} not found`);
        }
      }
    }

    // Validate trailer ownerships before transaction
    if (owner.trailerOwnerships && owner.trailerOwnerships.length > 0) {
      const trailerIds = owner.trailerOwnerships.map((rel) => rel.trailer.id);

      // Check for duplicates within the request array
      const hasDuplicates = trailerIds.length !== new Set(trailerIds).size;
      if (hasDuplicates) {
        throw new BadRequestException('Duplicate trailer ownerships found');
      }

      // Check if all trailer IDs exist
      for (const trailerId of trailerIds) {
        const trailer = await this.trailerService.findById(trailerId);
        if (!trailer) {
          throw new NotFoundException(`Trailer with id ${trailerId} not found`);
        }
      }
    }

    // Execute save operation within transaction
    const saved = await withTransaction(this.dataSource, async () => {
      return await this.ownerService.save(owner, user?.email);
    });

    return this.getOwnerById(saved.id);
  }

  @Put('/:id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOwnerDTO,
    @AuthUser() user: any,
  ): Promise<Partial<OwnerDTO>> {
    const existing = await this.ownerService.findOne({
      where: { id },
      relations: ['carOwnerships', 'trailerOwnerships'],
    });
    if (!existing) throw new NotFoundException(`Owner ${id} not found`);

    // Validate bank details: if one is provided, both must be provided
    if ((dto.bankAccountNumber && !dto.bankName) || (!dto.bankAccountNumber && dto.bankName)) {
      throw new BadRequestException(
        'Both bankAccountNumber and bankName must be provided together or both must be empty',
      );
    }

    // Check for duplicate phone number (only if changed)
    if (dto.phone && dto.phone !== existing.phone) {
      const existingPhone = await this.ownerService.findByFields({ where: { phone: dto.phone } });
      if (existingPhone) {
        throw new BadRequestException(`Owner with phone number ${dto.phone} already exists`);
      }
    }

    // Check for duplicate email (only if changed and provided)
    if (dto.email && dto.email !== existing.email) {
      const existingEmail = await this.ownerService.findByFields({ where: { email: dto.email } });
      if (existingEmail) {
        throw new BadRequestException(`Owner with email ${dto.email} already exists`);
      }
    }

    // Check for duplicate bank account number (only if changed and provided)
    if (dto.bankAccountNumber && dto.bankAccountNumber !== existing.bankAccountNumber) {
      const existingBankAccount = await this.ownerService.findByFields({
        where: { bankAccountNumber: dto.bankAccountNumber },
      });
      if (existingBankAccount) {
        throw new BadRequestException(
          `Owner with bank account number ${dto.bankAccountNumber} already exists`,
        );
      }
    }

    // Validate car ownerships if provided in DTO
    if (dto.carOwnerships && dto.carOwnerships.length > 0) {
      const carIds = (dto.carOwnerships as any[]).map((rel) => rel.carId).filter(Boolean);

      // Check for duplicates within the request array
      const hasDuplicates = carIds.length !== new Set(carIds).size;
      if (hasDuplicates) {
        throw new BadRequestException('Duplicate car ownerships found');
      }

      // Check if all car IDs exist
      for (const carId of carIds) {
        const car = await this.carService.findById(carId);
        if (!car) {
          throw new NotFoundException(`Car with id ${carId} not found`);
        }
      }
    }

    // Validate trailer ownerships if provided in DTO
    if (dto.trailerOwnerships && dto.trailerOwnerships.length > 0) {
      const trailerIds = (dto.trailerOwnerships as any[])
        .map((rel) => rel.trailerId)
        .filter(Boolean);

      // Check for duplicates within the request array
      const hasDuplicates = trailerIds.length !== new Set(trailerIds).size;
      if (hasDuplicates) {
        throw new BadRequestException('Duplicate trailer ownerships found');
      }

      // Check if all trailer IDs exist
      for (const trailerId of trailerIds) {
        const trailer = await this.trailerService.findById(trailerId);
        if (!trailer) {
          throw new NotFoundException(`Trailer with id ${trailerId} not found`);
        }
      }
    }

    dto.id = id;

    // Execute update operation within transaction
    await withTransaction(this.dataSource, async () => {
      const mapped = mapUpdateOwnerDtoToEntity(dto, existing);

      // Handle car ownerships: upsert logic (update if exists, create if new)
      if (dto.carOwnerships !== undefined) {
        if (dto.carOwnerships.length > 0) {
          const carIds = (dto.carOwnerships as any[]).map((rel) => rel.carId);

          // Find existing car ownerships for this owner
          const existingCarOwnerships = await this.dataSource.getRepository(RelCarOwner).find({
            where: { owner: { id }, car: { id: In(carIds) } },
            relations: ['car'],
          });

          const existingCarMap = new Map(existingCarOwnerships.map((rel) => [rel.car.id, rel]));

          // Prepare car ownerships: update existing, create new
          mapped.carOwnerships = (dto.carOwnerships as any[]).map((input) => {
            const existing = existingCarMap.get(input.carId);
            if (existing) {
              // Update existing relationship
              existing.percentage = input.percentage ?? existing.percentage;
              existing.updatedBy = user?.email;
              return existing;
            }
            // Create new relationship
            const rel = new RelCarOwner();
            rel.car = { id: input.carId } as any;
            rel.owner = { id } as any;
            if (input.percentage !== undefined) rel.percentage = input.percentage;
            return rel;
          });
        } else {
          // Empty array means delete all car ownerships
          if (existing.carOwnerships?.length > 0) {
            const carOwnershipIds = existing.carOwnerships.map((rel) => rel.id);
            await this.dataSource.getRepository(RelCarOwner).delete({ id: In(carOwnershipIds) });
          }
          mapped.carOwnerships = [];
        }
      } else {
        // Not provided, preserve existing
        mapped.carOwnerships = existing.carOwnerships;
      }

      // Handle trailer ownerships: upsert logic (update if exists, create if new)
      if (dto.trailerOwnerships !== undefined) {
        if (dto.trailerOwnerships.length > 0) {
          const trailerIds = (dto.trailerOwnerships as any[]).map((rel) => rel.trailerId);

          // Find existing trailer ownerships for this owner
          const existingTrailerOwnerships = await this.dataSource
            .getRepository(RelTrailerOwner)
            .find({
              where: { owner: { id }, trailer: { id: In(trailerIds) } },
              relations: ['trailer'],
            });

          const existingTrailerMap = new Map(
            existingTrailerOwnerships.map((rel) => [rel.trailer.id, rel]),
          );

          // Prepare trailer ownerships: update existing, create new
          mapped.trailerOwnerships = (dto.trailerOwnerships as any[]).map((input) => {
            const existing = existingTrailerMap.get(input.trailerId);
            if (existing) {
              // Update existing relationship
              existing.percentage = input.percentage ?? existing.percentage;
              existing.updatedBy = user?.email;
              return existing;
            }
            // Create new relationship
            const rel = new RelTrailerOwner();
            rel.trailer = { id: input.trailerId } as any;
            rel.owner = { id } as any;
            if (input.percentage !== undefined) rel.percentage = input.percentage;
            return rel;
          });
        } else {
          // Empty array means delete all trailer ownerships
          if (existing.trailerOwnerships?.length > 0) {
            const trailerOwnershipIds = existing.trailerOwnerships.map((rel) => rel.id);
            await this.dataSource
              .getRepository(RelTrailerOwner)
              .delete({ id: In(trailerOwnershipIds) });
          }
          mapped.trailerOwnerships = [];
        }
      } else {
        // Not provided, preserve existing
        mapped.trailerOwnerships = existing.trailerOwnerships;
      }

      await this.ownerService.update(mapped, user?.email);
    });

    return this.getOwnerById(id);
  }

  // DELETE
  @Delete('/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Soft delete owner' })
  async delete(@Param('id', ParseIntPipe) id: number, @AuthUser() user: any): Promise<void> {
    const existing = await this.ownerService.findById(id);
    if (!existing) throw new NotFoundException(`Owner with id ${id} not found`);
    await this.ownerService.softDelete(id, user?.email);
  }

  // bulk assign owners to vehicles

  @Post('/bulk-assign')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Bulk assign owners to vehicles' })
  @ApiResponse({ status: 200, description: 'Owners assigned successfully' })
  async bulkAssignOwners(@Body() assignments: BulkAssignOwnerDTO, @AuthUser() user: any) {
    if (!assignments.carId && !assignments.trailerId) {
      throw new BadRequestException('Either carId or trailerId must be provided');
    }

    if (assignments.carId && assignments.trailerId) {
      throw new BadRequestException('Only one of carId or trailerId should be provided');
    }

    // Check for duplicate owner IDs in the request
    const ownerIds = assignments.owners.map((owner) => owner.id);
    if (ownerIds.length !== new Set(ownerIds).size) {
      throw new BadRequestException('Duplicate owner IDs found in the request');
    }

    // Validate car ID exists
    if (assignments.carId) {
      const car = await this.carService.findById(assignments.carId);
      if (!car) {
        throw new NotFoundException(`Car with id ${assignments.carId} not found`);
      }

      if (
        car.ownerShip === OwnerShipType.NOLON_CAR ||
        car.ownerShip === OwnerShipType.COMPANY_CAR
      ) {
        throw new BadRequestException(
          'Cannot assign owners to NOLON or company-owned cars',
        );
      }

      if (car.ownerShip === OwnerShipType.CONTRACT_CAR) {
        if (assignments.owners.length !== 1) {
          throw new BadRequestException('Contract car must have exactly one owner');
        }
        if (assignments.owners[0].percentage == null) {
          assignments.owners[0].percentage = 100;
        }
      }

      if (car.ownerShip === OwnerShipType.SHARE) {
        if (assignments.owners.length < 1) {
          throw new BadRequestException('Shared ownership requires at least one owner');
        }
        const totalPercentage = assignments.owners.reduce(
          (sum, owner) => sum + (owner.percentage ?? 0),
          0,
        );
        if (totalPercentage !== 100) {
          throw new BadRequestException(
            'Shared ownership percentages must sum to 100',
          );
        }
      }

      return await this.relCarOwnerService.bulkAssignOwners(assignments, user?.email);
    }

    // Validate trailer ID exists
    if (assignments.trailerId) {
      const trailer = await this.trailerService.findById(assignments.trailerId);
      if (!trailer) {
        throw new NotFoundException(`Trailer with id ${assignments.trailerId} not found`);
      }

      if (
        trailer.ownerShip === OwnerShipType.NOLON_CAR ||
        trailer.ownerShip === OwnerShipType.COMPANY_CAR
      ) {
        throw new BadRequestException(
          'Cannot assign owners to NOLON or company-owned trailers',
        );
      }

      return await this.relTrailerOwnerService.bulkAssignOwners(assignments, user?.email);
    }
  }
}
