import { createContext, useContext } from 'react';

import type { InsightsValue } from '../types';

export const InsightsContext = createContext<InsightsValue | null>(null);

export function useInsights(): InsightsValue {
  const context = useContext(InsightsContext);
  if (!context) {
    throw new Error('useInsights must be used within CopilotWorkspaceProvider');
  }
  return context;
}
