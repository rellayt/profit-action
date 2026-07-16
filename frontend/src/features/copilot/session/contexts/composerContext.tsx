import { createContext, useContext } from 'react';

import type { ComposerValue } from '../types';

export const ComposerContext = createContext<ComposerValue | null>(null);

export function useComposer(): ComposerValue {
  const context = useContext(ComposerContext);
  if (!context) {
    throw new Error('useComposer must be used within CopilotWorkspaceProvider');
  }
  return context;
}
