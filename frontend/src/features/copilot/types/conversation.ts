import type { Message } from '@ai-sdk/react';

import type { ConversationSummary } from '../../../contracts/generated/schemas';
import type { AnalysisResult } from './api';

export type { ConversationSummary };

export interface ConversationDetail {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
  analysesById: Record<string, AnalysisResult>;
  messageAnalysisIds: Record<string, string>;
}
