import { ProductStatus } from './warehouse.enums';

const PROTECTED_STATUSES = new Set<ProductStatus>([
  ProductStatus.RESERVED,
  ProductStatus.DISCONTINUED,
  ProductStatus.PENDING,
  ProductStatus.NEW,
]);

/**
 * Derive stock status from quantity without overriding protected workflow statuses.
 */
export function resolveStockStatus(current: ProductStatus, quantity: number): ProductStatus {
  if (PROTECTED_STATUSES.has(current)) {
    return current;
  }

  if (quantity <= 0) {
    return ProductStatus.OUT_OF_STOCK;
  }

  if (current === ProductStatus.OUT_OF_STOCK) {
    return ProductStatus.AVAILABLE;
  }

  return current;
}
