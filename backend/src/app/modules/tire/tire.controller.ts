import {
  Controller,
  Logger,
  UseGuards,
  Put,
  Delete,
  Body,
  Param,
  NotFoundException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard, Roles, RolesGuard, AuthUser } from 'src/core/security';
import { UserRole } from 'src/core/enums/user-role';
import { TireService } from './tire.service';
import { TireDTO } from './dtos/tire.dto';
import { UpdateTireDTO } from './dtos/update-tire.dto';
import { mapUpdateTireDtoToEntity } from './tire.mapper';
import { UserDTO } from '../user/dtos/user.dto';

@Controller('api/tires')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiTags('tires-module')
export class TireController {
  private readonly logger = new Logger('TireController');

  constructor(private readonly tireService: TireService) {}

  @Put('/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update existing tire record' })
  @ApiResponse({ status: 200, description: 'Tire updated', type: TireDTO })
  async update(
    @Param('id') id: number,
    @Body() dto: UpdateTireDTO,
    @AuthUser() user: UserDTO,
  ): Promise<TireDTO> {
    const existing = await this.tireService.findById(id);
    if (!existing) {
      throw new NotFoundException(`Tire with id ${id} not found`);
    }

    // Preserve ID in DTO for mapper
    dto.id = id;

    const mappedTire = mapUpdateTireDtoToEntity(dto);

    return this.tireService.update(mappedTire, user?.email);
  }

  @Delete('/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete tire record' })
  @ApiResponse({ status: 200, description: 'Tire deleted' })
  async delete(@Param('id') id: number): Promise<void> {
    const existing = await this.tireService.findById(id);
    if (!existing) {
      throw new NotFoundException(`Tire with id ${id} not found`);
    }

    await this.tireService.delete(existing.id);
  }
}
