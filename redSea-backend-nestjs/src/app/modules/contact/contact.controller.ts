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
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard, Roles, RolesGuard, AuthUser } from 'src/core/security';
import { ContactDTO } from './dtos/contact.dto';
import { UserRole } from 'src/core/enums/user-role';
import { UpdateContactDTO } from './dtos/update-contact.dto';
import { CreateContactDTO } from './dtos/create-contact.dto';
import { ContactService } from './contact.service';
import { UserDTO } from '../user/dtos/user.dto';
import { mapCreateContactDtoToEntity, mapUpdateContactDtoToEntity } from './contact.mapper';
import { UserService } from '../user/user.service';
import { Contact } from './contact.entity';

@Controller('api/contacts')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiTags('contacts-module')
export class ContactController {
  logger = new Logger('ContactsController');

  constructor(
    private readonly contactService: ContactService,
    private readonly userService: UserService,
  ) {}

  @Post('/')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create multiple contacts' })
  @ApiResponse({ status: 201, description: 'Records created', type: ContactDTO, isArray: true })
  async create(
    @Body() createContactDTOs: CreateContactDTO | CreateContactDTO[],
    @AuthUser() user: UserDTO,
  ): Promise<ContactDTO[]> {
    const dtos = Array.isArray(createContactDTOs)
      ? createContactDTOs
      : createContactDTOs
        ? [createContactDTOs]
        : [];

    if (dtos.length === 0) {
      throw new BadRequestException('At least one contact is required');
    }

    await Promise.all(
      dtos.map(async (dto) => {
        const existing = await this.contactService.findByFields({
          where: { phone: dto.phone },
        });
        if (existing) {
          throw new BadRequestException(`Contact with phone ${dto.phone} already exists`);
        }

        const existingUser = await this.userService.findByFields({
          where: { id: dto.userId },
        });
        if (!existingUser) {
          throw new BadRequestException(`User with id ${dto.userId} does not exist`);
        }
      }),
    );

    const mappedContacts = mapCreateContactDtoToEntity(dtos);

    const savedContacts = (await this.contactService.save(
      mappedContacts,
      user?.email,
    )) as ContactDTO[];

    return savedContacts;
  }

  @Put('/')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update one or multiple contacts' })
  @ApiResponse({
    status: 200,
    description: 'Record(s) updated successfully',
    type: ContactDTO,
    isArray: true,
  })
  async update(
    @Body() dto: UpdateContactDTO | UpdateContactDTO[],
    @AuthUser() user: UserDTO,
  ): Promise<ContactDTO | ContactDTO[]> {
    const dtos = Array.isArray(dto) ? dto : [dto];

    // Validate each contact before updating
    for (const item of dtos) {
      if (!item.id) throw new BadRequestException('Each contact must include an id.');
      const existing = await this.contactService.findById(item.id);
      if (!existing) throw new NotFoundException(`Contact with id ${item.id} not found`);
    }

    // Map and update
    const mappedContacts = mapUpdateContactDtoToEntity(dtos) as Contact[];

    return this.contactService.update(mappedContacts, user?.email);
  }

  @Delete('/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete contact' })
  async delete(@Param('id') id: number): Promise<void> {
    const existing = await this.contactService.findById(id);
    if (!existing) throw new NotFoundException(`Contact with id ${id} not found`);
    await this.contactService.delete(id);
  }
}
