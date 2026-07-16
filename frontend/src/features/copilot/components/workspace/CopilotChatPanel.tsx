import { Box, Paper, ScrollArea, Stack, Text, VisuallyHidden } from '@mantine/core';
import { useCallback, useEffect, useMemo, useRef } from 'react';

import { useChatPanelHeight } from '../../hooks/useChatPanelHeight';
import { useCopilotSettings } from '../../hooks/useCopilotSettings';
import {
  findLastUserIndex,
  shouldShowTypingIndicator,
} from '../../lib/chat/chatMessageHelpers';
import { ChatStatus } from '../../lib/chat/chatStatus';
import { CHAT_PANEL_MAX_HEIGHT, CHAT_PANEL_MAX_VH_RATIO } from '../../lib/chat/copilotConstants';
import { MessageRole } from '../../lib/chat/messageRole';
import { VOICE_DISABLED_IN_SETTINGS } from '../../lib/voice/voiceCopy';
import { useChatRuntime } from '../../session/useChatRuntime';
import { useComposer } from '../../session/useComposer';
import { useInsights } from '../../session/useInsights';
import type { AnalysisResult } from '../../types/api';
import { InsightsModal } from '../insights/InsightsModal';
import { CopilotChatEmptyState } from './CopilotChatEmptyState';
import { CopilotChatMessageTurn } from './CopilotChatMessageTurn';
import { CopilotComposer } from './CopilotComposer';
import { CopilotPageAlerts } from './CopilotPageAlerts';
import { CopilotTypingIndicator } from './CopilotTypingIndicator';

const SCROLL_PIN_THRESHOLD_PX = 80;

export function CopilotChatPanel() {
  const {
    messages,
    status,
    streamState,
    isAnalyzing,
    backendUnavailable,
    submitQuestion,
    replayUserMessage,
  } = useChatRuntime();
  const composer = useComposer();
  const { openAnalysis, analysisByMessageId, insightsOpen, setInsightsOpen } = useInsights();
  const { settings } = useCopilotSettings();

  const viewportRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLDivElement>(null);
  const pinnedToBottomRef = useRef(true);
  const didInitialScrollRef = useRef(false);

  const voiceEnabled = settings.voiceQueryEnabled;
  const voiceDisabledReason = !settings.voiceQueryEnabled ? VOICE_DISABLED_IN_SETTINGS : null;
  const isBusy = isAnalyzing;
  const showTyping = shouldShowTypingIndicator(messages, isAnalyzing);
  const isEmpty = messages.length === 0;

  const lastMessage = messages[messages.length - 1];
  const panelContentRevision = useMemo(() => {
    const contentLength =
      typeof lastMessage?.content === 'string'
        ? lastMessage.content.length
        : String(lastMessage?.content ?? '').length;
    return [
      lastMessage?.id ?? '',
      contentLength,
      status,
      streamState.statusMessage ?? '',
      String(showTyping),
    ].join('|');
  }, [lastMessage, status, streamState.statusMessage, showTyping]);

  const {
    height: panelHeight,
    atMaxCapacity,
    animateHeight,
  } = useChatPanelHeight(isEmpty, contentRef, composerRef, panelContentRevision, isBusy);

  const lastUserIndex = useMemo(() => findLastUserIndex(messages), [messages]);

  const liveAnnouncement = useMemo(() => {
    if (composer.voiceError) {
      return composer.voiceError;
    }
    if (streamState.statusMessage) {
      return streamState.statusMessage;
    }
    if (showTyping) {
      return 'Copilot pisze';
    }
    return '';
  }, [composer.voiceError, streamState.statusMessage, showTyping]);

  const onReplay = useCallback(
    (messageId: string) => {
      void replayUserMessage(messageId);
    },
    [replayUserMessage],
  );

  const onOpenInsights = useCallback(
    (analysis: AnalysisResult) => {
      openAnalysis(analysis.analysisId, analysis);
    },
    [openAnalysis],
  );

  const onDemoChip = useCallback(
    (query: string) => {
      void submitQuestion(query);
    },
    [submitQuestion],
  );

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) {
      return;
    }
    const onScroll = () => {
      const distanceFromBottom = viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight;
      pinnedToBottomRef.current = distanceFromBottom <= SCROLL_PIN_THRESHOLD_PX;
    };
    viewport.addEventListener('scroll', onScroll, { passive: true });
    return () => viewport.removeEventListener('scroll', onScroll);
  }, [isEmpty]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || typeof viewport.scrollTo !== 'function') {
      return;
    }
    if (!pinnedToBottomRef.current && didInitialScrollRef.current) {
      return;
    }
    viewport.scrollTo({
      top: viewport.scrollHeight,
      behavior: didInitialScrollRef.current ? 'smooth' : 'auto',
    });
    didInitialScrollRef.current = true;
    pinnedToBottomRef.current = true;
  }, [messages, status, streamState.statusMessage, showTyping]);

  useEffect(() => {
    if (isBusy) {
      pinnedToBottomRef.current = true;
    }
  }, [isBusy]);

  return (
    <>
      <VisuallyHidden>
        <Text component="div" role="status" aria-live="polite" aria-atomic="true">
          {liveAnnouncement}
        </Text>
      </VisuallyHidden>

      <Stack gap="lg" h="100%">
        <CopilotPageAlerts
          backendUnavailable={backendUnavailable}
          voiceError={composer.voiceError}
          onDismissVoiceError={() => composer.setVoiceError(null)}
        />

        <Paper
          className={
            animateHeight && !isBusy ? 'copilot-chat-panel' : 'copilot-chat-panel is-sizing'
          }
          radius="xl"
          p="lg"
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: panelHeight,
            maxHeight: `min(${CHAT_PANEL_MAX_VH_RATIO * 100}vh, ${CHAT_PANEL_MAX_HEIGHT}px)`,
            overflow: 'hidden',
            background: 'rgb(var(--pa-bg-surface) / 0.6)',
            border: '1px solid rgb(var(--pa-border-neutral) / 0.35)',
            boxShadow: 'var(--pa-shadow-card)',
            width: '100%',
          }}
        >
          {isEmpty ? (
            <Box
              flex={1}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 0,
              }}
            >
              <CopilotChatEmptyState
                disabled={isBusy}
                onSelectChip={(query) => void submitQuestion(query)}
              />
            </Box>
          ) : (
            <ScrollArea
              flex={1}
              type={atMaxCapacity ? 'auto' : 'never'}
              offsetScrollbars={atMaxCapacity}
              viewportRef={viewportRef}
              style={{ minHeight: 0 }}
            >
              <Stack gap="lg" py="xs" pr="xs" ref={contentRef}>
                {messages.map((message, index) => {
                  const isTurnAssistant =
                    message.role === MessageRole.Assistant && index > lastUserIndex;
                  const isFailedUserTurn =
                    status === ChatStatus.Error &&
                    index === lastUserIndex &&
                    message.role === MessageRole.User;
                  const isStreaming = isTurnAssistant && status === ChatStatus.Streaming;
                  const statusMessage =
                    isTurnAssistant && isBusy ? streamState.statusMessage : null;
                  const analysis = analysisByMessageId.get(message.id) ?? null;

                  return (
                    <CopilotChatMessageTurn
                      key={message.id}
                      message={message}
                      messageId={message.id}
                      isTurnAssistant={isTurnAssistant}
                      isFailedUserTurn={isFailedUserTurn}
                      isStreaming={isStreaming}
                      statusMessage={statusMessage}
                      analysis={analysis}
                      showUnsupportedChips={Boolean(
                        isTurnAssistant && streamState.unsupported && !isBusy,
                      )}
                      showStreamCursor={!showTyping}
                      isBusy={isBusy}
                      onReplay={onReplay}
                      onOpenInsights={onOpenInsights}
                      onDemoChip={onDemoChip}
                    />
                  );
                })}

                {showTyping ? <CopilotTypingIndicator /> : null}
              </Stack>
            </ScrollArea>
          )}

          <Box ref={composerRef} mt="md" style={{ flexShrink: 0 }}>
            <CopilotComposer
              value={composer.question}
              onChange={composer.setQuestion}
              onSend={() => void composer.runAnalysis()}
              isSending={composer.isAnalyzing}
              voiceEnabled={voiceEnabled}
              voiceDisabledReason={voiceDisabledReason}
              onVoiceError={composer.setVoiceError}
            />
          </Box>
        </Paper>
      </Stack>

      <InsightsModal opened={insightsOpen} onClose={() => setInsightsOpen(false)} />
    </>
  );
}
