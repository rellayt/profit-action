import type { Message } from '@ai-sdk/react';
import { Button, Group, Text } from '@mantine/core';
import { memo } from 'react';

import { STARTER_QUERY_CHIPS } from '../../lib/chat/copilotConstants';
import type { AnalysisResult } from '../../types/api';
import { CopilotMessageBubble } from './CopilotMessageBubble';
import { CopilotResponseActions } from './CopilotResponseActions';
import { UserMessageReplay } from './UserMessageReplay';

interface CopilotChatMessageTurnProps {
  message: Message;
  messageId: string;
  isTurnAssistant: boolean;
  isFailedUserTurn: boolean;
  isStreaming: boolean;
  statusMessage: string | null;
  analysis: AnalysisResult | null;
  showUnsupportedChips: boolean;
  showStreamCursor: boolean;
  isBusy: boolean;
  onReplay: (messageId: string) => void;
  onOpenInsights: (analysis: AnalysisResult) => void;
  onDemoChip: (query: string) => void;
}

export const CopilotChatMessageTurn = memo(function CopilotChatMessageTurn({
  message,
  messageId,
  isTurnAssistant,
  isFailedUserTurn,
  isStreaming,
  statusMessage,
  analysis,
  showUnsupportedChips,
  showStreamCursor,
  isBusy,
  onReplay,
  onOpenInsights,
  onDemoChip,
}: CopilotChatMessageTurnProps) {
  return (
    <CopilotMessageBubble
      message={message}
      isStreaming={isStreaming}
      showStreamCursor={showStreamCursor}
      muted={isFailedUserTurn}
      footer={
        isFailedUserTurn ? (
          <UserMessageReplay disabled={isBusy} onReplay={() => onReplay(messageId)} />
        ) : null
      }
    >
      {statusMessage ? (
        <Text size="sm" c="dimmed" mt="xs">
          {statusMessage}
        </Text>
      ) : null}
      {isTurnAssistant && analysis && !isBusy ? (
        <CopilotResponseActions
          analysis={analysis}
          onOpenInsights={() => onOpenInsights(analysis)}
        />
      ) : null}
      {showUnsupportedChips ? (
        <Group gap="sm" mt="sm" role="group" aria-label="Przykładowe pytania">
          {STARTER_QUERY_CHIPS.map((chip) => (
            <Button
              key={chip}
              size="compact-sm"
              variant="light"
              color="gray"
              onClick={() => onDemoChip(chip)}
            >
              {chip}
            </Button>
          ))}
        </Group>
      ) : null}
    </CopilotMessageBubble>
  );
});
