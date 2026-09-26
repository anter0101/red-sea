import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class SetAccountOpeningBalanceDTO {
  @ApiProperty({
    description:
      'Opening balance in account currency (signed in the account’s normal-balance sense). Can only be set once per account.',
    example: 15000.5,
  })
  @IsNumber()
  amount: number;
}
