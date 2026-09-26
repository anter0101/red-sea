import { getMetadataArgsStorage } from 'typeorm';

// Columns that should never appear in text search results
const EXCLUDED_COLUMNS = new Set(['password', 'createdBy', 'updatedBy', 'deletedBy']);

/**
 * Returns the names of all string / text columns declared on an entity class.
 * Uses TypeORM's decorator metadata — zero runtime DB cost, evaluated once at startup.
 *
 * Excluded: numeric, boolean, date, json, enum columns and internal audit fields.
 *
 * @example
 * // In a service:
 * import { getStringColumns } from 'src/core/utils/entity-meta.util';
 * import { Car } from './car.entity';
 *
 * searchableFields: getStringColumns(Car)
 * // → ['code', 'manufacturer', 'model', 'color', 'plateNumber', 'plateLetters',
 * //    'chassisNumber', 'licenseNumber', 'notes']
 */
export function getStringColumns(entityClass: Function): string[] {
  const storage = getMetadataArgsStorage();
  return storage.columns
    .filter(col => col.target === entityClass)
    .filter(col => {
      const opts = (col as any).options ?? {};
      const t = opts.type;
      return (
        !t ||
        t === String ||
        t === 'varchar' ||
        t === 'text' ||
        t === 'character varying' ||
        t === 'nvarchar' ||
        t === 'citext'
      );
    })
    .map(col => col.propertyName as string)
    .filter(name => !EXCLUDED_COLUMNS.has(name));
}
