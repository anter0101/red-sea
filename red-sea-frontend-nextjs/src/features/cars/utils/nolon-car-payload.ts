import { OwnerShipTypes } from '@/enums/ownership';
import type { INolonCarFormValues } from '@/features/cars/types/car-schema';
import type INolonCarMutationRequest from '@/features/cars/types/mutation-request';
import {
  compactPlateLetters,
  formatPlateLettersForApi,
} from '@/lib/plate-letters';

export { compactPlateLetters, formatPlateLettersForApi } from '@/lib/plate-letters';
export function buildNolonCarMutationPayload(
  data: INolonCarFormValues,
): INolonCarMutationRequest {
  return {
    ownerShip: OwnerShipTypes.NOLON_CAR,
    plateNumber: data.plateNumber.trim(),
    plateLetters: formatPlateLettersForApi(data.plateLetters),
    licenseNumber: data.licenseNumber.trim(),
    licenseExpiryDate: data.licenseExpiryDate.toISOString().slice(0, 10),
  };
}
