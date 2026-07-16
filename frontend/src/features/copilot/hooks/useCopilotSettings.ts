import { useLocalStorage } from '@mantine/hooks';
import { useCallback } from 'react';

import { PA_STORAGE_KEYS } from '../lib/storage/localStorageKeys';

interface CopilotSettings {
  voiceQueryEnabled: boolean;
}

const DEFAULT_SETTINGS: CopilotSettings = {
  voiceQueryEnabled: true,
};

export function useCopilotSettings() {
  const [settings, setSettings] = useLocalStorage<CopilotSettings>({
    key: PA_STORAGE_KEYS.settings,
    defaultValue: DEFAULT_SETTINGS,
  });

  const setVoiceQueryEnabled = useCallback(
    (voiceQueryEnabled: boolean) => {
      setSettings((current) => ({ ...current, voiceQueryEnabled }));
    },
    [setSettings],
  );

  return {
    settings,
    setVoiceQueryEnabled,
  };
}
