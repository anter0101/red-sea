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
  Get,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard, Roles, RolesGuard, AuthUser } from 'src/core/security';
import { UserRole } from 'src/core/enums/user-role';

import { UserAttachmentService } from './user-attachment.service';
import { UserService } from '../user/user.service';

import { UserAttachmentDTO } from './dtos/user-attachment.dto';
import { CreateUserAttachmentDTO } from './dtos/create-user-attachment.dto';
import { UpdateUserAttachmentDTO } from './dtos/update-user-attachment.dto';

import {
  mapUserAttachmentToDtoSelective,
  mapCreateUserAttachmentDtoToEntity,
  mapUpdateUserAttachmentDtoToEntity,
} from './user-attachment.mapper';

@Controller('api/user-attachments')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiTags('user-attachments-module')
export class UserAttachmentController {
  logger = new Logger('UserAttachmentController');

  constructor(
    private readonly attachmentService: UserAttachmentService,
    private readonly userService: UserService,
  ) {}

  // ----------------------------------------------------------------------
  // GET BY ID
  // ----------------------------------------------------------------------
  @Get('/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get user attachment by ID' })
  @ApiResponse({ status: 200, description: 'User attachment found', type: UserAttachmentDTO })
  async getById(@Param('id', ParseIntPipe) id: number): Promise<Partial<UserAttachmentDTO>> {
    const existing = await this.attachmentService.findById(id);
    if (!existing) throw new NotFoundException(`User attachment with id ${id} not found`);

    return mapUserAttachmentToDtoSelective(existing, [
      'id',
      'user',
      'url',
      'type',
      'notes',
      'documentExpiryDate',
      'createdAt',
      'createdBy',
    ]);
  }

  // ----------------------------------------------------------------------
  // CREATE
  // ----------------------------------------------------------------------
  @Post('/')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new user attachment' })
  @ApiResponse({ status: 201, description: 'User attachment created', type: UserAttachmentDTO })
  async create(
    @Body() dto: CreateUserAttachmentDTO,
    @AuthUser() user: any,
  ): Promise<Partial<UserAttachmentDTO>> {
    const existingUser = await this.userService.findByFields({ where: { id: dto.userId } });
    if (!existingUser) throw new NotFoundException(`User with id ${dto.userId} not found`);

    const mapped = mapCreateUserAttachmentDtoToEntity(dto);
    const saved = await this.attachmentService.save(mapped, user?.email);

    return mapUserAttachmentToDtoSelective(saved);
  }

  // ----------------------------------------------------------------------
  // UPDATE
  // ----------------------------------------------------------------------
  @Put('/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update user attachment' })
  @ApiResponse({ status: 200, description: 'User attachment updated', type: UserAttachmentDTO })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserAttachmentDTO,
    @AuthUser() user: any,
  ): Promise<Partial<UserAttachmentDTO>> {
    const existing = await this.attachmentService.findById(id);
    if (!existing) throw new NotFoundException(`User attachment with id ${id} not found`);

    dto.id = id;
    const mapped = mapUpdateUserAttachmentDtoToEntity(dto);
    const updated = await this.attachmentService.update(mapped, user?.email);

    return mapUserAttachmentToDtoSelective(updated);
  }

  // ----------------------------------------------------------------------
  // DELETE
  // ----------------------------------------------------------------------
  @Delete('/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete user attachment' })
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    const existing = await this.attachmentService.findById(id);
    if (!existing) throw new NotFoundException(`User attachment with id ${id} not found`);

    await this.attachmentService.delete(existing.id);
  }
}
