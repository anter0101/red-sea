import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class ViewUrlQueryDto {
  @ApiProperty({
    example: 'http://localhost/red-sea/uploads/pdf/1760000000000_contract.pdf',
    description: 'Stored file URL (any host) or object key under uploads/',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(1024)
  readonly url: string;
}
