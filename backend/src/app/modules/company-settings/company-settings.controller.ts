import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard, AuthUser, Roles, RolesGuard } from 'src/core/security';
import { UserRole } from 'src/core/enums/user-role';
import { CompanySettingsService } from './company-settings.service';
import { UpdateCompanySettingsDTO } from './dtos/update-company-settings.dto';

@Controller('api/company-settings')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiTags('company-settings')
export class CompanySettingsController {
  constructor(private readonly companySettingsService: CompanySettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Get the Red Sea company header used on invoices' })
  get() {
    return this.companySettingsService.get();
  }

  @Put()
  @ApiOperation({ summary: 'Update the Red Sea company header used on invoices' })
  update(@Body() body: UpdateCompanySettingsDTO, @AuthUser() user: { email?: string }) {
    return this.companySettingsService.update(body, user?.email);
  }
}
