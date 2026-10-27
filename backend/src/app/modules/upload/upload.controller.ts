import { Controller, Post, Body, Get, Query, UseGuards } from '@nestjs/common';
import { UploadService } from './upload.service';
import { CreatePresignedUrlDto } from './dto/create-presignedUrl.dto';
import { ViewUrlQueryDto } from './dto/view-url-query.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard, Roles, RolesGuard } from 'src/core/security';
import { UserRole } from 'src/core/enums/user-role';
@Controller('api/v1/upload')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiTags('upload-module')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('presigned-url')
  async getPresignedUrl(@Body() createPresignedUrlDto: CreatePresignedUrlDto) {
    return this.uploadService.generatePresignedUrl(createPresignedUrlDto);
  }

  @Get('view-url')
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({ summary: 'Short-lived signed link to open a stored file' })
  async getViewUrl(@Query() query: ViewUrlQueryDto) {
    return this.uploadService.generateViewUrl(query.url);
  }
}
