import type { ClassifiedProduct, MatchedProductRow } from '../../types/api';
import { CATALOG_MATCH_REASON } from './matchReasons';

export function matchedProductsFromCatalog(
  productIds: string[],
  classifiedById: Map<string, ClassifiedProduct>,
  existing: MatchedProductRow[],
): MatchedProductRow[] {
  if (existing.length > 0) {
    return existing;
  }
  const rows: MatchedProductRow[] = [];
  for (const id of productIds) {
    const product = classifiedById.get(id);
    if (!product) {
      continue;
    }
    rows.push({
      id: product.id,
      name: product.name,
      spend: product.googleAdsSpend,
      revenue: product.netRevenue,
      profit: product.profit,
      stock: product.stock,
      margin: product.marginPercent,
      segment: product.segment,
      matchReason: CATALOG_MATCH_REASON,
    });
  }
  return rows;
}
