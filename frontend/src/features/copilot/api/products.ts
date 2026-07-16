import { useQuery } from '@tanstack/react-query';

import { ProductsResponseSchema } from '../../../contracts/generated/schemas';
import { fetchJson } from './http';
import { productQueryKeys } from './queryKeys';

const API_BASE = '/api';

export function useProductsQuery() {
  return useQuery({
    queryKey: productQueryKeys.list(),
    queryFn: () => fetchJson(`${API_BASE}/products`, ProductsResponseSchema),
    staleTime: 60_000,
  });
}
