import { describe, expect, it } from 'vitest';

import { getProductRowStyle } from './productTableStyles';

describe('productTableStyles', () => {
  it('highlights selected rows', () => {
    expect(getProductRowStyle('p-1', 'p-1', { clickable: true }).borderLeft).toContain(
      'rgb(var(--pa-green-primary))',
    );
  });

  it('leaves unselected rows transparent', () => {
    expect(getProductRowStyle('p-1', 'p-2').borderLeft).toBe('3px solid transparent');
  });
});
