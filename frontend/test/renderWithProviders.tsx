import { MantineProvider } from '@mantine/core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, type RenderOptions } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';

import { copilotTheme } from '../src/design/mantine-theme';

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
}

interface ProvidersProps {
  children: ReactNode;
  route?: string;
  queryClient?: QueryClient;
}

export function Providers({
  children,
  route = '/',
  queryClient = createTestQueryClient(),
}: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider theme={copilotTheme} defaultColorScheme="dark">
        <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
      </MantineProvider>
    </QueryClientProvider>
  );
}

export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & {
    route?: string;
    queryClient?: QueryClient;
  },
) {
  const { route, queryClient, ...renderOptions } = options ?? {};
  return render(ui, {
    wrapper: ({ children }) => (
      <Providers route={route} queryClient={queryClient}>
        {children}
      </Providers>
    ),
    ...renderOptions,
  });
}
