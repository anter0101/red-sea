import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class SetAccountOpeningBalanceDTO {
  @ApiProperty({
    description:
      'Opening balance in account currency (signed in the account’s normal-balance sense). Can be changed at any time.',
    example: 15000.5,
  })
  @IsNumber()
  amount: number;
}
