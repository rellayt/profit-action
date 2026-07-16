import { useLocalStorage } from '@mantine/hooks';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { PA_STORAGE_KEYS } from '../lib/storage/localStorageKeys';

interface IntroModalValue {
  opened: boolean;
  dismissIntro: () => void;
  openIntro: () => void;
}

const IntroModalContext = createContext<IntroModalValue | null>(null);

export function IntroModalProvider({ children }: { children: ReactNode }) {
  const [introSeen, setIntroSeen] = useLocalStorage<boolean>({
    key: PA_STORAGE_KEYS.introSeen,
    defaultValue: false,
  });
  const [forceOpen, setForceOpen] = useState(false);

  const dismissIntro = useCallback(() => {
    setForceOpen(false);
    setIntroSeen(true);
  }, [setIntroSeen]);

  const openIntro = useCallback(() => {
    setForceOpen(true);
  }, []);

  const value = useMemo<IntroModalValue>(
    () => ({
      opened: !introSeen || forceOpen,
      dismissIntro,
      openIntro,
    }),
    [dismissIntro, forceOpen, introSeen, openIntro],
  );

  return <IntroModalContext.Provider value={value}>{children}</IntroModalContext.Provider>;
}

export function useIntroModal(): IntroModalValue {
  const context = useContext(IntroModalContext);
  if (!context) {
    throw new Error('useIntroModal must be used within IntroModalProvider');
  }
  return context;
}
