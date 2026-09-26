import { Trailer } from './trailer.entity';
import { TrailerDTO } from './dtos/trailer.dto';
import { CreateTrailerDTO } from './dtos/create-trailer.dto';
import { UpdateTrailerDTO } from './dtos/update-trailer.dto';
import { BaseDTO } from 'src/core/utils/base.dto';

/**
 * Allowed DTO keys for selective mapping.
 * Ensures security and prevents exposing extra fields.
 */
const allowedTrailerDtoKeys: ReadonlyArray<keyof TrailerDTO | keyof BaseDTO> = [
  'id',
  'code',
  'chaseType',
  'manufacturer',
  'status',
  'manufactureYear',
  'color',
  'maxWeight',
  'plateNumber',
  'plateLetters',
  'chassisNumber',
  'licenseNumber',
  'licenseExpiryDate',
  'ownerShip',
  'axles',
  'Ownerships',
  'trailerAttachments',
  'axleCount',
  'notes',
  'createdAt',
  'updatedAt',
  'createdBy',
  'updatedBy',
];

/**
 * Selective Trailer → TrailerDTO mapper
 */
export function mapTrailerToTrailerDtoSelective(
  trailer: Trailer,
  keys?: (keyof TrailerDTO | keyof BaseDTO)[],
): Partial<TrailerDTO>;
export function mapTrailerToTrailerDtoSelective(
  trailers: Trailer[],
  keys?: (keyof TrailerDTO | keyof BaseDTO)[],
): Partial<TrailerDTO>[];
export function mapTrailerToTrailerDtoSelective(
  trailerOrTrailers: Trailer | Trailer[],
  keys?: (keyof TrailerDTO | keyof BaseDTO)[],
): Partial<TrailerDTO> | Partial<TrailerDTO>[] {
  const mapSingle = (trailer: Trailer): Partial<TrailerDTO> => {
    const dto: Partial<TrailerDTO> = {};

    const keysToMap = (keys || allowedTrailerDtoKeys).filter((key) =>
      allowedTrailerDtoKeys.includes(key),
    );

    keysToMap.forEach((key) => {
      if (key in trailer && trailer[key as keyof Trailer] !== undefined) {
        (dto as any)[key] = trailer[key as keyof Trailer];
      }

      // Special relations
      if (key === 'axles' && trailer.axles) {
        dto.axles = trailer.axles as unknown as TrailerDTO['axles'];
      }
      if (key === 'Ownerships' && trailer.Ownerships) {
        dto.Ownerships = trailer.Ownerships as unknown as TrailerDTO['Ownerships'];
      }
      if (key === 'trailerAttachments' && trailer.trailerAttachments) {
        dto.trailerAttachments = trailer.trailerAttachments as unknown as TrailerDTO['trailerAttachments'];
      }
    });

    return dto;
  };

  return Array.isArray(trailerOrTrailers)
    ? trailerOrTrailers.map(mapSingle)
    : mapSingle(trailerOrTrailers);
}

/**
 * CreateTrailerDTO → Trailer Entity
 */
export const mapCreateTrailerDtoToEntity = (dto: CreateTrailerDTO): Trailer => {
  const trailer = new Trailer();

  if (dto.chaseType !== undefined) trailer.chaseType = dto.chaseType;
  if (dto.manufacturer !== undefined) trailer.manufacturer = dto.manufacturer;
  if (dto.status !== undefined) trailer.status = dto.status;
  if (dto.manufactureYear !== undefined) trailer.manufactureYear = dto.manufactureYear;
  if (dto.color !== undefined) trailer.color = dto.color;
  if (dto.maxWeight !== undefined) trailer.maxWeight = dto.maxWeight;
  if (dto.plateNumber !== undefined) trailer.plateNumber = dto.plateNumber;
  if (dto.plateLetters !== undefined) trailer.plateLetters = dto.plateLetters;
  if (dto.chassisNumber !== undefined) trailer.chassisNumber = dto.chassisNumber;
  if (dto.licenseNumber !== undefined) trailer.licenseNumber = dto.licenseNumber;
  if (dto.ownerShip !== undefined) trailer.ownerShip = dto.ownerShip;
  if (dto.licenseExpiryDate !== undefined) {
    trailer.licenseExpiryDate = new Date(dto.licenseExpiryDate);
  }

  if (dto.axleCount !== undefined) {
    trailer.axleCount = dto.axleCount;
  } else if (dto.axles !== undefined) {
    trailer.axleCount = dto.axles.length;
  }

  if (dto.notes !== undefined) trailer.notes = dto.notes;

  return trailer;
};

/**
 * UpdateTrailerDTO → Trailer Entity
 */
export const mapUpdateTrailerDtoToEntity = (dto: UpdateTrailerDTO): Trailer => {
  const trailer = new Trailer();

  if (dto.id !== undefined) trailer.id = dto.id;
  if (dto.code !== undefined) trailer.code = dto.code;
  if (dto.chaseType !== undefined) trailer.chaseType = dto.chaseType;
  if (dto.manufacturer !== undefined) trailer.manufacturer = dto.manufacturer;
  if (dto.status !== undefined) trailer.status = dto.status;
  if (dto.manufactureYear !== undefined) trailer.manufactureYear = dto.manufactureYear;
  if (dto.color !== undefined) trailer.color = dto.color;
  if (dto.maxWeight !== undefined) trailer.maxWeight = dto.maxWeight;
  if (dto.plateNumber !== undefined) trailer.plateNumber = dto.plateNumber;
  if (dto.plateLetters !== undefined) trailer.plateLetters = dto.plateLetters;
  if (dto.chassisNumber !== undefined) trailer.chassisNumber = dto.chassisNumber;
  if (dto.licenseNumber !== undefined) trailer.licenseNumber = dto.licenseNumber;
  if (dto.ownerShip !== undefined) trailer.ownerShip = dto.ownerShip;

  if (dto.licenseExpiryDate !== undefined) {
    trailer.licenseExpiryDate = new Date(dto.licenseExpiryDate);
  }

  // Use axleCount from request if provided, otherwise calculate from axles array if provided
  if (dto.axleCount !== undefined) {
    trailer.axleCount = dto.axleCount;
  } else if (dto.axles !== undefined && Array.isArray(dto.axles)) {
    trailer.axleCount = dto.axles.length;
  }

  if (dto.notes !== undefined) trailer.notes = dto.notes;

  return trailer;
};
