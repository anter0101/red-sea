import { OwnerShipTypes } from '@/enums/ownership';
import type { INolonTrailerFormValues } from '@/features/trailers/types/trailer-schema';
import type { INolonTrailerMutationRequest } from '@/features/trailers/types/mutation-request';
import {
  compactPlateLetters,
  formatPlateLettersForApi,
} from '@/lib/plate-letters';

export { compactPlateLetters, formatPlateLettersForApi } from '@/lib/plate-letters';

export function buildNolonTrailerMutationPayload(
  data: INolonTrailerFormValues,
): INolonTrailerMutationRequest {
  return {
    ownerShip: OwnerShipTypes.NOLON_CAR,
    plateNumber: data.plateNumber.trim(),
    plateLetters: formatPlateLettersForApi(data.plateLetters),
    licenseNumber: data.licenseNumber.trim(),
    licenseExpiryDate: data.licenseExpiryDate.toISOString().slice(0, 10),
  };
}
