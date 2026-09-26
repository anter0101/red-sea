import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { UploadService } from './upload.service';
import { CreatePresignedUrlDto } from './dto/create-presignedUrl.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
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
}
