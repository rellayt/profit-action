import type { Message } from '@ai-sdk/react';
import type { Dispatch, SetStateAction } from 'react';

import type { ChatStatus } from '../lib/chat/chatStatus';
import type { StreamUiState } from '../lib/chat/streamEventParser';
import type { AnalysisResult, ClassifiedProduct } from '../types/api';
import type { ConversationDetail, ConversationSummary } from '../types/conversation';

export interface ConversationNavValue {
  conversations: ConversationSummary[];
  isDraftRoute: boolean;
  activeConversationId: string | null;
  startNewConversation: () => void;
  openConversation: (conversationId: string) => void;
  deleteConversation: (conversationId: string) => Promise<void>;
}

export interface ConversationStoreApi {
  commitLocalDetail: (detail: ConversationDetail) => void;
  getStoredDetail: (conversationId: string) => ConversationDetail | undefined;
  draftResetNonce: number;
}

export interface ChatMessagesValue {
  messages: Message[];
  status: ChatStatus;
  isAnalyzing: boolean;
  streamState: StreamUiState;
  submitQuestion: (raw: string, baseMessages?: Message[]) => Promise<void>;
  replayUserMessage: (messageId: string) => Promise<void>;
  backendUnavailable: boolean;
}

export interface ComposerValue {
  question: string;
  setQuestion: Dispatch<SetStateAction<string>>;
  voiceError: string | null;
  setVoiceError: Dispatch<SetStateAction<string | null>>;
  runAnalysis: () => Promise<void>;
  isAnalyzing: boolean;
  submitQuestion: (raw: string, baseMessages?: Message[]) => Promise<void>;
}

export interface InsightsValue {
  insightsOpen: boolean;
  setInsightsOpen: Dispatch<SetStateAction<boolean>>;
  analysis: AnalysisResult | null;
  openAnalysis: (analysisId: string, snapshot?: AnalysisResult | null) => void;
  getAnalysisForMessage: (messageId: string) => AnalysisResult | null;
  analysisByMessageId: Map<string, AnalysisResult>;
  selectedProduct: ClassifiedProduct | null;
  setSelectedProduct: Dispatch<SetStateAction<ClassifiedProduct | null>>;
  selectScatterProduct: (productId: string) => void;
  classifiedById: Map<string, ClassifiedProduct>;
}
