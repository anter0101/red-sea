import type { ICar } from '@/types';
import type { IAxle, IAxleFormValues, IUpdateAxleRequest } from '@/types/axles';
import type ITire from '@/types/axles/axle';

/**
 * Location code mapping between form field names and API codes
 * Front axle (axleIndex 0): leftOuter → FRONT_LEFT, rightOuter → FRONT_RIGHT (single tire per side)
 * Back axle (axleIndex 1): leftOuter → BACK_LEFT_OUTER, leftInner → BACK_LEFT_INNER, etc.
 * Third axle (axleIndex 2): leftOuter → THIRD_LEFT_OUTER, leftInner → THIRD_LEFT_INNER, etc.
 */

type TirePosition = 'leftOuter' | 'leftInner' | 'rightOuter' | 'rightInner';

const FRONT_SINGLE_AXLE_MAPPING: Record<'leftOuter' | 'rightOuter', string> = {
  leftOuter: 'FRONT_LEFT',
  rightOuter: 'FRONT_RIGHT',
};

const BACK_AXLE_MAPPING: Record<TirePosition, string> = {
  leftOuter: 'BACK_LEFT_OUTER',
  leftInner: 'BACK_LEFT_INNER',
  rightOuter: 'BACK_RIGHT_OUTER',
  rightInner: 'BACK_RIGHT_INNER',
};

const THIRD_AXLE_MAPPING: Record<TirePosition, string> = {
  leftOuter: 'THIRD_LEFT_OUTER',
  leftInner: 'THIRD_LEFT_INNER',
  rightOuter: 'THIRD_RIGHT_OUTER',
  rightInner: 'THIRD_RIGHT_INNER',
};

/**
 * Tire positions shown/required per axle index.
 */
export function getTirePositionsForAxle(axleIndex: number): TirePosition[] {
  if (axleIndex === 0) {
    return ['leftOuter', 'rightOuter'];
  }
  return ['leftOuter', 'leftInner', 'rightOuter', 'rightInner'];
}

/**
 * Get API location code from form field name based on axle index
 */
export function getApiLocationCode(position: TirePosition, axleIndex: number): string {
  if (axleIndex === 0) {
    if (position === 'leftOuter') return FRONT_SINGLE_AXLE_MAPPING.leftOuter;
    if (position === 'rightOuter') return FRONT_SINGLE_AXLE_MAPPING.rightOuter;
    throw new Error(`Front axle does not support position: ${position}`);
  }
  if (axleIndex === 1) {
    return BACK_AXLE_MAPPING[position];
  }
  return THIRD_AXLE_MAPPING[position];
}

/**
 * Transform a single axle form data to tire array for API
 */
export function transformAxleToTires(
  axleData: IAxleFormValues['axles'][0],
  axleIndex: number,
): ITire[] {
  return getTirePositionsForAxle(axleIndex).map((position) => ({
    location: getApiLocationCode(position, axleIndex),
    type: axleData.type[position],
    healthPercentage: `${axleData.thickness[position]}`,
    serialNumber: axleData.serialNumber[position] || '',
    createdDate: axleData.createdDate[position]?.toISOString() || new Date().toISOString(),
  }));
}

/**
 * Transform complete form data to API payload format
 */
export function transformFormToApiPayload(formData: IAxleFormValues): IAxle[] {
  return formData.axles.map((axle, index) => ({
    number: index + 1,
    carId: formData.carId,
    tires: transformAxleToTires(axle, index),
  }));
}

/**
 * Get the form position from API location code
 */
function getFormPosition(location: string): {
  axleIndex: number;
  position: TirePosition;
} | null {
  const mapping: Record<string, { axleIndex: number; position: TirePosition }> = {
    FRONT_LEFT: { axleIndex: 0, position: 'leftOuter' },
    FRONT_RIGHT: { axleIndex: 0, position: 'rightOuter' },
    FRONT_LEFT_OUTER: { axleIndex: 0, position: 'leftOuter' },
    FRONT_LEFT_INNER: { axleIndex: 0, position: 'leftInner' },
    FRONT_RIGHT_OUTER: { axleIndex: 0, position: 'rightOuter' },
    FRONT_RIGHT_INNER: { axleIndex: 0, position: 'rightInner' },
    BACK_LEFT_OUTER: { axleIndex: 1, position: 'leftOuter' },
    BACK_LEFT_INNER: { axleIndex: 1, position: 'leftInner' },
    BACK_RIGHT_OUTER: { axleIndex: 1, position: 'rightOuter' },
    BACK_RIGHT_INNER: { axleIndex: 1, position: 'rightInner' },
    THIRD_LEFT_OUTER: { axleIndex: 2, position: 'leftOuter' },
    THIRD_LEFT_INNER: { axleIndex: 2, position: 'leftInner' },
    THIRD_RIGHT_OUTER: { axleIndex: 2, position: 'rightOuter' },
    THIRD_RIGHT_INNER: { axleIndex: 2, position: 'rightInner' },
  };

  return mapping[location] || null;
}

/**
 * Transform API axles data to form values
 */
export function transformApiAxlesToForm(
  carAxles: IAxle[] | undefined,
  axleCount: number,
  carId: number,
): IAxleFormValues {
  const axles: IAxleFormValues['axles'] = [];

  // Initialize empty axles structure
  for (let i = 0; i < axleCount; i++) {
    axles.push({
      thickness: {
        leftOuter: 0,
        leftInner: 0,
        rightOuter: 0,
        rightInner: 0,
      },
      type: {
        leftOuter: '',
        leftInner: '',
        rightOuter: '',
        rightInner: '',
      },
      createdDate: {
        leftOuter: undefined,
        leftInner: undefined,
        rightOuter: undefined,
        rightInner: undefined,
      },
      updatedDate: {
        leftOuter: undefined,
        leftInner: undefined,
        rightOuter: undefined,
        rightInner: undefined,
      },
      serialNumber: {
        leftOuter: '',
        leftInner: '',
        rightOuter: '',
        rightInner: '',
      },
    });
  }

  // If car has existing axles with tires, populate the form values
  if (carAxles && carAxles.length > 0) {
    carAxles.forEach((carAxle) => {
      if (carAxle.tires && carAxle.tires.length > 0) {
        carAxle.tires.forEach((tire) => {
          const formPosition = getFormPosition(tire.location || '');
          if (formPosition && formPosition.axleIndex < axleCount) {
            const { axleIndex, position } = formPosition;
            const axle = axles[axleIndex];

            // Set thickness (healthPercentage)
            if (tire.healthPercentage) {
              axle.thickness[position] = Number(tire.healthPercentage);
            }

            // Set type
            if (tire.type) {
              axle.type[position] = tire.type;
            }

            // Set serial number
            if (tire.serialNumber) {
              axle.serialNumber[position] = tire.serialNumber;
            }

            // Set created date
            if (tire.createdDate) {
              axle.createdDate[position] = new Date(tire.createdDate);
            }

            // Set updated date from updatedAt field
            if (tire.updatedAt) {
              axle.updatedDate[position] = new Date(tire.updatedAt);
            }
          }
        });
      }
    });
  }

  return { carId, axles };
}

/**
 * Transform form data to bulk update payload for existing axles
 * Returns an array of axle items for bulk update API
 */
export function transformFormToUpdatePayload(
  formData: IAxleFormValues,
  existingAxles: IAxle[],
): IUpdateAxleRequest {
  return formData.axles.map((axle, index) => {
    // Find the existing axle by number (index + 1)
    const existingAxle = existingAxles.find((a) => a.number === index + 1);
    const axleId = existingAxle?.id || 0;

    // Get existing tire IDs for mapping
    const existingTires = existingAxle?.tires || [];

    const tires = transformAxleToTires(axle, index).map((tire) => {
      const existingTire =
        existingTires.find((t) => t.location === tire.location) ??
        (tire.location === 'FRONT_LEFT'
          ? existingTires.find((t) => t.location === 'FRONT_LEFT_OUTER')
          : undefined) ??
        (tire.location === 'FRONT_RIGHT'
          ? existingTires.find((t) => t.location === 'FRONT_RIGHT_OUTER')
          : undefined);

      return {
        id: existingTire?.id,
        serialNumber: tire.serialNumber || '',
        type: tire.type || '',
        healthPercentage: tire.healthPercentage || '',
        location: tire.location || '',
        createdDate: tire.createdDate,
      };
    });

    return {
      id: axleId,
      number: index + 1,
      tires,
    };
  });
}
