import { useChat } from '@ai-sdk/react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { CHAT_API_PATH } from '../lib/chat/copilotConstants';
import { isChatBusy, type ChatStatus } from '../lib/chat/chatStatus';
import {
  applyDataPart,
  initialStreamState,
  type StreamUiState,
} from '../lib/chat/streamEventParser';

export function useCopilotChat(chatSessionId: string) {
  const [streamState, setStreamState] = useState<StreamUiState>(initialStreamState);
  const processedDataCountRef = useRef(0);

  const applyPart = useCallback((raw: unknown) => {
    setStreamState((current) => applyDataPart(current, raw));
  }, []);

  const resetStreamState = useCallback(() => {
    setStreamState(initialStreamState);
  }, []);

  const chat = useChat({
    id: chatSessionId,
    api: CHAT_API_PATH,
    streamProtocol: 'data',
  });

  const { data, setData, stop, reload, setMessages, messages, status } = chat;

  useEffect(() => {
    const streamParts = data;
    if (!streamParts || streamParts.length <= processedDataCountRef.current) {
      return;
    }

    const newParts = streamParts.slice(processedDataCountRef.current);
    processedDataCountRef.current = streamParts.length;
    newParts.forEach((part) => applyPart(part));
  }, [data, applyPart]);

  const beginAnalysisTurn = useCallback(() => {
    processedDataCountRef.current = 0;
    resetStreamState();
    setData([]);
  }, [resetStreamState, setData]);

  const abortActiveStream = useCallback(() => {
    stop();
    beginAnalysisTurn();
  }, [stop, beginAnalysisTurn]);

  const chatStatus = status as ChatStatus;

  return {
    messages,
    status: chatStatus,
    setMessages,
    reload,
    streamState,
    beginAnalysisTurn,
    abortActiveStream,
    isAnalyzing: isChatBusy(chatStatus),
  };
}
