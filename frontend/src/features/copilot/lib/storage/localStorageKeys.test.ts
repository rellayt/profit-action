import { describe, expect, it } from 'vitest';

import { PA_STORAGE_KEYS, PA_STORAGE_PREFIX } from './localStorageKeys';

describe('localStorageKeys', () => {
  it('uses a shared pa-copilot prefix', () => {
    expect(PA_STORAGE_PREFIX).toBe('pa-copilot');
    expect(PA_STORAGE_KEYS.settings).toBe('pa-copilot-settings');
    expect(PA_STORAGE_KEYS.conversations).toBe('pa-copilot-conversations-v2');
    expect(PA_STORAGE_KEYS.introSeen).toBe('pa-copilot-intro-seen');
  });
});
