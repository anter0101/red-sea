import { CreateAskForCustodyOfficeRequestDTO } from './create-ask-for-custody-office-request.dto';
import { CreateEndWorkingShiftOfficeRequestDTO } from './create-end-working-shift-office-request.dto';
import { CreatePrintDelegationOfficeRequestDTO } from './create-print-delegation-office-request.dto';

export type CreateOfficeRequestDTO =
  | CreatePrintDelegationOfficeRequestDTO
  | CreateAskForCustodyOfficeRequestDTO
  | CreateEndWorkingShiftOfficeRequestDTO;

export {
  CreatePrintDelegationOfficeRequestDTO,
  CreateAskForCustodyOfficeRequestDTO,
  CreateEndWorkingShiftOfficeRequestDTO,
};
