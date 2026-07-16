import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import type { ReactNode } from 'react';

import { PA_STORAGE_KEYS } from '../lib/storage/localStorageKeys';
import { IntroModalProvider, useIntroModal } from './IntroModalProvider';

function wrapper({ children }: { children: ReactNode }) {
  return <IntroModalProvider>{children}</IntroModalProvider>;
}

describe('IntroModalProvider', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('opens on first visit, persists dismiss, and reopens on demand', () => {
    const { result, unmount } = renderHook(() => useIntroModal(), { wrapper });

    expect(result.current.opened).toBe(true);

    act(() => {
      result.current.dismissIntro();
    });
    expect(result.current.opened).toBe(false);
    expect(localStorage.getItem(PA_STORAGE_KEYS.introSeen)).toBe('true');

    act(() => {
      result.current.openIntro();
    });
    expect(result.current.opened).toBe(true);

    act(() => {
      result.current.dismissIntro();
    });
    expect(result.current.opened).toBe(false);

    unmount();
    localStorage.removeItem(PA_STORAGE_KEYS.introSeen);

    const remounted = renderHook(() => useIntroModal(), { wrapper });
    expect(remounted.result.current.opened).toBe(true);
  });
});
