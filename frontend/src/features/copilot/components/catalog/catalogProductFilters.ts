import type { ClassifiedProduct } from '../../types/api';

export type CatalogSortKey = 'name' | 'spend' | 'revenue' | 'profit' | 'margin' | 'stock';
export type CatalogSortDir = 'asc' | 'desc';

export function filterAndSortCatalogProducts(
  products: ClassifiedProduct[],
  search: string,
  sortKey: CatalogSortKey,
  sortDir: CatalogSortDir,
): ClassifiedProduct[] {
  const query = search.trim().toLowerCase();
  let rows = products;
  if (query) {
    rows = rows.filter(
      (product) =>
        product.name.toLowerCase().includes(query) ||
        product.id.toLowerCase().includes(query) ||
        product.sku.toLowerCase().includes(query),
    );
  }
  return [...rows].sort((a, b) => {
    const factor = sortDir === 'asc' ? 1 : -1;
    if (sortKey === 'name') {
      return a.name.localeCompare(b.name) * factor;
    }
    if (sortKey === 'spend') {
      return (a.googleAdsSpend - b.googleAdsSpend) * factor;
    }
    if (sortKey === 'revenue') {
      return (a.netRevenue - b.netRevenue) * factor;
    }
    if (sortKey === 'profit') {
      return (a.profit - b.profit) * factor;
    }
    if (sortKey === 'stock') {
      return (a.stock - b.stock) * factor;
    }
    return (a.marginPercent - b.marginPercent) * factor;
  });
}
