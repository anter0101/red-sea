import { ApiPropertyOptional } from '@nestjs/swagger';
import { BaseDTO } from 'src/core/utils/base.dto';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { JourneyDTO } from '../../journey/dtos/journey.dto';
import { JourneyAttachmentType } from 'src/core/enums/journey';

export class JourneyAttachmentDTO extends BaseDTO {
  @ApiPropertyOptional({ example: 'RECEIPT' })
  @IsOptional()
  @IsEnum(JourneyAttachmentType)
  type: JourneyAttachmentType;

  @ApiPropertyOptional({ example: 'http://example.com/attachment.jpg' })
  @IsString()
  url: string;

  @ApiPropertyOptional({ type: () => JourneyDTO })
  journey: JourneyDTO;
}
