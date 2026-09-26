import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';
import { PaginateDTO } from './paginate.dto';

/** Only allow simple identifier names — prevents SQL injection in dynamic field references */
const SAFE_FIELD_REGEX = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

// ---------------------------------------------------------------------------
// Interfaces
// ---------------------------------------------------------------------------

/**
 * Config for a single relation that is already LEFT JOIN'd in the QueryBuilder.
 * Its string fields participate in the global ?search= OR sweep.
 */
export interface RelationConfig {
  /** QueryBuilder alias used when the relation was joined (e.g. 'user'). */
  alias: string;
  /** String columns of the relation included in the global ?search= OR sweep. */
  searchableFields?: string[];
}

export interface QueryFilterConfig {
  /** QueryBuilder alias for the root entity. */
  alias: string;
  /**
   * Root-entity string columns included in global ?search= OR sweep.
   * Use `getStringColumns(EntityClass)` from entity-meta.util.ts to get all
   * string columns automatically.
   */
  searchableFields?: string[];
  /** Root-entity enum columns for exact-match AND filtering. */
  enumFilters?: string[];
  /** Root-entity date columns supporting From/To range params. */
  dateFields?: string[];
  /**
   * Joined relations whose string fields participate in the global ?search= sweep.
   * The relation MUST already be JOIN'd by the service before calling this function.
   */
  relations?: RelationConfig[];
}

// ---------------------------------------------------------------------------
// Main utility
// ---------------------------------------------------------------------------

/**
 * Applies search, enum filtering, date-range filtering, sorting and pagination
 * to an existing TypeORM SelectQueryBuilder.
 *
 * ?search=ABC  →  case-insensitive OR across all root + relation text columns.
 *
 * @param qb     - QueryBuilder with root alias + required joins already added
 * @param query  - The DTO (must extend PaginateDTO)
 * @param config - Declarative config describing which fields/relations to handle
 */
export function applyQueryFilters<T extends ObjectLiteral>(
  qb: SelectQueryBuilder<T>,
  query: PaginateDTO & Record<string, any>,
  config: QueryFilterConfig,
): SelectQueryBuilder<T> {
  const {
    alias,
    searchableFields = [],
    enumFilters = [],
    dateFields = [],
    relations = [],
  } = config;

  // --------------------------------------------------------------------------
  // 1. Global search — case-insensitive OR across root + relation text columns
  // --------------------------------------------------------------------------
  const rootRefs = searchableFields.map(f => (f.includes('.') ? f : `${alias}.${f}`));
  const relRefs = relations.flatMap(rel =>
    (rel.searchableFields ?? []).map(f => `${rel.alias}.${f}`),
  );
  const allSearchRefs = [...rootRefs, ...relRefs];

  if (query.search && allSearchRefs.length > 0) {
    const conditions = allSearchRefs.map((ref, i) => `LOWER(${ref}) LIKE LOWER(:_s${i})`);
    const params = Object.fromEntries(
      allSearchRefs.map((_, i) => [`_s${i}`, `%${query.search}%`]),
    );
    qb.andWhere(`(${conditions.join(' OR ')})`, params);
  }

  // --------------------------------------------------------------------------
  // 2. Root-entity enum filters (AND exact match)
  // --------------------------------------------------------------------------
  for (const field of enumFilters) {
    const value = query[field];
    if (value !== undefined && value !== null && value !== '') {
      qb.andWhere(`${alias}.${field} = :_e_${field}`, { [`_e_${field}`]: value });
    }
  }

  // --------------------------------------------------------------------------
  // 3. Root-entity date-range filters (e.g. createdAtFrom / createdAtTo)
  // --------------------------------------------------------------------------
  for (const field of dateFields) {
    const fromKey = `${field}From`;
    const toKey = `${field}To`;
    if (query[fromKey]) {
      qb.andWhere(`${alias}.${field} >= :_df_${field}`, {
        [`_df_${field}`]: new Date(query[fromKey] as string),
      });
    }
    if (query[toKey]) {
      qb.andWhere(`${alias}.${field} <= :_dt_${field}`, {
        [`_dt_${field}`]: new Date(query[toKey] as string),
      });
    }
  }

  // --------------------------------------------------------------------------
  // 4. Sorting (field name validated to prevent SQL injection)
  // --------------------------------------------------------------------------
  const sortField = query.sortField;
  const sortOrder: 'ASC' | 'DESC' = query.sortOrder === 'DESC' ? 'DESC' : 'ASC';

  if (sortField) {
    const segments = sortField.split('.');
    const isValid = segments.every(s => SAFE_FIELD_REGEX.test(s));
    if (isValid) {
      const sortRef = sortField.includes('.') ? sortField : `${alias}.${sortField}`;
      qb.orderBy(sortRef, sortOrder);
    } else {
      qb.orderBy(`${alias}.id`, 'DESC');
    }
  } else {
    qb.orderBy(`${alias}.id`, 'DESC');
  }

  // --------------------------------------------------------------------------
  // 5. Pagination
  // --------------------------------------------------------------------------
  const page = Math.max(1, +(query.page ?? 1));
  const pageSize = Math.max(1, +(query.pageSize ?? 10));
  qb.skip((page - 1) * pageSize).take(pageSize);

  return qb;
}
