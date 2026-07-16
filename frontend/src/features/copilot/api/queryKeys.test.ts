import { describe, expect, it } from 'vitest';

import { conversationQueryKeys, healthQueryKeys, productQueryKeys } from './queryKeys';

describe('query keys', () => {
  it('builds stable product list keys', () => {
    expect(productQueryKeys.list()).toEqual(['products', 'list']);
  });

  it('builds stable health keys', () => {
    expect(healthQueryKeys.detail()).toEqual(['health']);
  });

  it('builds stable conversation keys', () => {
    expect(conversationQueryKeys.list()).toEqual(['conversations', 'list']);
    expect(conversationQueryKeys.detail('c_1')).toEqual(['conversations', 'detail', 'c_1']);
  });
});
