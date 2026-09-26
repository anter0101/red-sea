/**
 * Returns true if the array contains any duplicated value.
 * Works with primitives and objects (using strict equality ===).
 */
export function hasDuplicates<T>(items: T[] | null | undefined): boolean {
  if (!items || items.length <= 1) return false;

  const seen = new Set<T>();
  for (const item of items) {
    if (seen.has(item)) return true;
    seen.add(item);
  }

  return false;
}

/**
 * Throws an error if the array contains duplicates.
 * Useful inside service validation logic.
 */
export function assertNoDuplicates<T>(
  items: T[] | null | undefined,
  errorFactory: () => Error,
): void {
  if (hasDuplicates(items)) {
    throw errorFactory();
  }
}
