import type { ITrailer } from '@/types';
import type { IAxle, IAxleFormValues, IUpdateAxleRequest } from '@/types/axles';
import type ITire from '@/types/axles/axle';

/**
 * Location code mapping between form field names and API codes
 * For trailers with 2, 3, or 4 axles
 */

type TirePosition = 'leftOuter' | 'leftInner' | 'rightOuter' | 'rightInner';

/**
 * Tire positions shown/required per axle (trailers use dual tires on every axle).
 */
export function getTirePositionsForAxle(_axleIndex: number): TirePosition[] {
  return ['leftOuter', 'leftInner', 'rightOuter', 'rightInner'];
}

const FIRST_AXLE_MAPPING: Record<TirePosition, string> = {
  leftOuter: 'FIRST_LEFT_OUTER',
  leftInner: 'FIRST_LEFT_INNER',
  rightOuter: 'FIRST_RIGHT_OUTER',
  rightInner: 'FIRST_RIGHT_INNER',
};

const SECOND_AXLE_MAPPING: Record<TirePosition, string> = {
  leftOuter: 'SECOND_LEFT_OUTER',
  leftInner: 'SECOND_LEFT_INNER',
  rightOuter: 'SECOND_RIGHT_OUTER',
  rightInner: 'SECOND_RIGHT_INNER',
};

const THIRD_AXLE_MAPPING: Record<TirePosition, string> = {
  leftOuter: 'THIRD_LEFT_OUTER',
  leftInner: 'THIRD_LEFT_INNER',
  rightOuter: 'THIRD_RIGHT_OUTER',
  rightInner: 'THIRD_RIGHT_INNER',
};

const FOURTH_AXLE_MAPPING: Record<TirePosition, string> = {
  leftOuter: 'FOURTH_LEFT_OUTER',
  leftInner: 'FOURTH_LEFT_INNER',
  rightOuter: 'FOURTH_RIGHT_OUTER',
  rightInner: 'FOURTH_RIGHT_INNER',
};

/**
 * Get API location code from form field name based on axle index
 */
export function getApiLocationCode(position: TirePosition, axleIndex: number): string {
  if (axleIndex === 0) {
    return FIRST_AXLE_MAPPING[position];
  } else if (axleIndex === 1) {
    return SECOND_AXLE_MAPPING[position];
  } else if (axleIndex === 2) {
    return THIRD_AXLE_MAPPING[position];
  } else {
    return FOURTH_AXLE_MAPPING[position];
  }
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
 * Transform complete form data to API payload format for trailers
 */
export function transformFormToApiPayload(formData: IAxleFormValues): IAxle[] {
  return formData.axles.map((axle, index) => ({
    number: index + 1,
    trailerId: formData.trailerId,
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
    FIRST_LEFT_OUTER: { axleIndex: 0, position: 'leftOuter' },
    FIRST_LEFT_INNER: { axleIndex: 0, position: 'leftInner' },
    FIRST_RIGHT_OUTER: { axleIndex: 0, position: 'rightOuter' },
    FIRST_RIGHT_INNER: { axleIndex: 0, position: 'rightInner' },
    SECOND_LEFT_OUTER: { axleIndex: 1, position: 'leftOuter' },
    SECOND_LEFT_INNER: { axleIndex: 1, position: 'leftInner' },
    SECOND_RIGHT_OUTER: { axleIndex: 1, position: 'rightOuter' },
    SECOND_RIGHT_INNER: { axleIndex: 1, position: 'rightInner' },
    THIRD_LEFT_OUTER: { axleIndex: 2, position: 'leftOuter' },
    THIRD_LEFT_INNER: { axleIndex: 2, position: 'leftInner' },
    THIRD_RIGHT_OUTER: { axleIndex: 2, position: 'rightOuter' },
    THIRD_RIGHT_INNER: { axleIndex: 2, position: 'rightInner' },
    FOURTH_LEFT_OUTER: { axleIndex: 3, position: 'leftOuter' },
    FOURTH_LEFT_INNER: { axleIndex: 3, position: 'leftInner' },
    FOURTH_RIGHT_OUTER: { axleIndex: 3, position: 'rightOuter' },
    FOURTH_RIGHT_INNER: { axleIndex: 3, position: 'rightInner' },
  };

  return mapping[location] || null;
}

/**
 * Transform API axles data to form values
 */
export function transformApiAxlesToForm(
  trailerAxles: IAxle[] | undefined,
  axleCount: number,
  trailerId: number,
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

  // If trailer has existing axles with tires, populate the form values
  if (trailerAxles && trailerAxles.length > 0) {
    trailerAxles.forEach((trailerAxle) => {
      if (trailerAxle.tires && trailerAxle.tires.length > 0) {
        trailerAxle.tires.forEach((tire) => {
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

  return { trailerId, axles };
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
      // Find existing tire by location to preserve its ID
      const existingTire = existingTires.find((t) => t.location === tire.location);

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
