import { waitFor } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Providers, createTestQueryClient } from '../../../../test/renderWithProviders';
import { useProductsQuery } from './products';

describe('useProductsQuery', () => {
  it('fetches catalog via TanStack Query + MSW', async () => {
    const queryClient = createTestQueryClient();
    const { result } = renderHook(() => useProductsQuery(), {
      wrapper: ({ children }) => <Providers queryClient={queryClient}>{children}</Providers>,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.items[0]?.id).toBe('p-001');
    expect(result.current.data?.total).toBe(1);
  });
});
