import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateAccountDTO } from './create-account.dto';

/** normalBalance is immutable after create (set once on root, or inherited for children). */
export class UpdateAccountDTO extends PartialType(
  OmitType(CreateAccountDTO, ['normalBalance'] as const),
) {}
