import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { OfficeRequestType } from 'src/core/enums/office-request';
import {
  CreateOfficeRequestDTO,
  CreateAskForCustodyOfficeRequestDTO,
  CreateEndWorkingShiftOfficeRequestDTO,
  CreatePrintDelegationOfficeRequestDTO,
} from './dtos/create-office-request.dto';

@Injectable()
export class CreateOfficeRequestValidationPipe implements PipeTransform {
  async transform(value: unknown): Promise<CreateOfficeRequestDTO> {
    if (!value || typeof value !== 'object' || !('type' in value)) {
      throw new BadRequestException('type is required');
    }

    const type = (value as { type: OfficeRequestType }).type;
    let instance: CreateOfficeRequestDTO;

    switch (type) {
      case OfficeRequestType.PRINT_DELEGATION:
        instance = plainToInstance(CreatePrintDelegationOfficeRequestDTO, value, {
          enableImplicitConversion: true,
        });
        break;
      case OfficeRequestType.ASK_FOR_CUSTODY:
        instance = plainToInstance(CreateAskForCustodyOfficeRequestDTO, value, {
          enableImplicitConversion: true,
        });
        break;
      case OfficeRequestType.END_WORKING_SHIFT:
        instance = plainToInstance(CreateEndWorkingShiftOfficeRequestDTO, value, {
          enableImplicitConversion: true,
        });
        break;
      default:
        throw new BadRequestException(`Invalid office request type: ${type}`);
    }

    const errors = await validate(instance as object);

    if (errors.length > 0) {
      const messages = errors.flatMap((error) => Object.values(error.constraints ?? {}));
      throw new BadRequestException(messages);
    }

    return instance;
  }
}
