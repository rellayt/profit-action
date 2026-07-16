import type { Message } from '@ai-sdk/react';
import type { Dispatch, SetStateAction, RefObject } from 'react';
import { useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { MessageRole } from '../../lib/chat/messageRole';
import { createConversationId, titleFromQuestion } from '../../lib/conversation/conversationIds';
import { discardUnavailableBackendError } from '../../lib/conversation/discardUnavailableBackendError';
import type { ClassifiedProduct } from '../../types/api';
import type { ConversationDetail } from '../../types/conversation';
import type { CopilotLocationState } from './useConversationRouting';

interface UseWorkspaceSubmitOptions {
  isAnalyzing: boolean;
  messages: Message[];
  question: string;
  activeConversationIdRef: RefObject<string | null>;
  touchUpdatedAtRef: RefObject<boolean>;
  setActiveConversationId: (conversationId: string | null) => void;
  setQuestion: (value: string) => void;
  setVoiceError: (value: string | null) => void;
  setSelectedProduct: Dispatch<SetStateAction<ClassifiedProduct | null>>;
  beginAnalysisTurn: () => void;
  setMessages: (messages: Message[]) => void;
  reload: () => Promise<unknown>;
  commitLocalDetail: (detail: ConversationDetail) => void;
  upsertConversation: (detail: ConversationDetail) => Promise<unknown>;
}

export function useWorkspaceSubmit({
  isAnalyzing,
  messages,
  question,
  activeConversationIdRef,
  touchUpdatedAtRef,
  setActiveConversationId,
  setQuestion,
  setVoiceError,
  setSelectedProduct,
  beginAnalysisTurn,
  setMessages,
  reload,
  commitLocalDetail,
  upsertConversation,
}: UseWorkspaceSubmitOptions) {
  const navigate = useNavigate();
  const submitLockRef = useRef(false);
  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  const submitQuestion = useCallback(
    async (raw: string, baseMessages: Message[] | undefined = undefined) => {
      const trimmed = raw.trim();
      if (!trimmed || isAnalyzing || submitLockRef.current) {
        return;
      }

      submitLockRef.current = true;
      try {
        setSelectedProduct(null);
        setVoiceError(null);
        beginAnalysisTurn();
        setQuestion('');
        touchUpdatedAtRef.current = true;

        const prior = baseMessages ?? messagesRef.current;
        const nextMessages: Message[] = [
          ...prior,
          { id: crypto.randomUUID(), role: MessageRole.User, content: trimmed },
        ];

        let conversationId = activeConversationIdRef.current;
        if (!conversationId) {
          conversationId = createConversationId();
          const now = Date.now();
          const detail: ConversationDetail = {
            id: conversationId,
            title: titleFromQuestion(trimmed),
            createdAt: now,
            updatedAt: now,
            messages: nextMessages,
            analysesById: {},
            messageAnalysisIds: {},
          };

          commitLocalDetail(detail);
          setActiveConversationId(conversationId);
          const state: CopilotLocationState = { skipHydrateFor: conversationId };
          navigate(`/copilot/c/${conversationId}`, { replace: true, state });
          void upsertConversation(detail).catch(discardUnavailableBackendError);
        }

        setMessages(nextMessages);
        await reload();
      } finally {
        submitLockRef.current = false;
      }
    },
    [
      activeConversationIdRef,
      beginAnalysisTurn,
      commitLocalDetail,
      isAnalyzing,
      navigate,
      reload,
      setActiveConversationId,
      setMessages,
      setQuestion,
      setSelectedProduct,
      setVoiceError,
      touchUpdatedAtRef,
      upsertConversation,
    ],
  );

  const runAnalysis = useCallback(async () => {
    await submitQuestion(question);
  }, [question, submitQuestion]);

  const replayUserMessage = useCallback(
    async (messageId: string) => {
      if (isAnalyzing || submitLockRef.current) {
        return;
      }
      const current = messagesRef.current;
      const index = current.findIndex((item) => item.id === messageId);
      const message = index >= 0 ? current[index] : undefined;
      if (!message || message.role !== MessageRole.User) {
        return;
      }
      const content = String(message.content).trim();
      if (!content) {
        return;
      }
      await submitQuestion(content, current.slice(0, index));
    },
    [isAnalyzing, submitQuestion],
  );

  return { submitQuestion, runAnalysis, replayUserMessage };
}
