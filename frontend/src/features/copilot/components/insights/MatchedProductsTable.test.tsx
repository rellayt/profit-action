import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '../../../../../test/renderWithProviders';
import type { MatchedProductRow } from '../../types/api';
import { MatchedProductsTable } from './MatchedProductsTable';

function row(id: string, name: string): MatchedProductRow {
  return {
    id,
    name,
    spend: 10,
    revenue: 20,
    profit: 5,
    stock: 3,
    margin: 12,
    segment: 'neutral',
    matchReason: 'test',
  };
}

describe('MatchedProductsTable', () => {
  it('paginates matched products', async () => {
    const user = userEvent.setup();
    const products = Array.from({ length: 8 }, (_, index) =>
      row(`p-${index}`, `Produkt ${index + 1}`),
    );

    renderWithProviders(<MatchedProductsTable products={products} onSelect={vi.fn()} />);

    expect(screen.getByText('Produkt 1')).toBeInTheDocument();
    expect(screen.queryByText('Produkt 7')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '2' }));
    expect(screen.getByText('Produkt 7')).toBeInTheDocument();
  });
});
