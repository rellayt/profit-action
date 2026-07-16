import { useQuery } from '@tanstack/react-query';

import { HealthResponseSchema, type HealthResponse } from '../../../contracts/generated/schemas';
import { fetchJson } from './http';
import { healthQueryKeys } from './queryKeys';

export type { HealthResponse };

export function useHealthQuery() {
  return useQuery({
    queryKey: healthQueryKeys.detail(),
    queryFn: () => fetchJson('/health', HealthResponseSchema),
    staleTime: 30_000,
  });
}
