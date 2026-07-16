import { describe, expect, it } from 'vitest';

import { formatProductCount } from './format';

describe('formatProductCount', () => {
  it('uses Polish plural forms', () => {
    expect(formatProductCount(1)).toBe('1 produkt');
    expect(formatProductCount(2)).toBe('2 produkty');
    expect(formatProductCount(5)).toBe('5 produktów');
    expect(formatProductCount(22)).toBe('22 produkty');
  });
});
