import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class CreatePhysicalAttachmentCheckDTO {
  @ApiProperty({ example: true })
  @IsBoolean()
  checked: boolean;
}

export class PhysicalAttachmentCheckDTO {
  @ApiProperty()
  id: number;

  @ApiProperty()
  physicalAttachmentId: number;

  @ApiProperty()
  checked: boolean;

  @ApiProperty()
  recordedAt: Date;

  @ApiProperty()
  recordedBy: string;
}
