import { Group, Paper, Text } from '@mantine/core';
import type { Message } from '@ai-sdk/react';
import type { ReactNode } from 'react';

import { MessageRole } from '../../lib/chat/messageRole';
import { AssistantMessageShell } from './AssistantMessageShell';
import { CopilotMarkdown } from './CopilotMarkdown';

const USER_MESSAGE_CARD_STYLE = {
  background: 'rgb(var(--pa-green-primary) / 0.14)',
  border: '1px solid rgb(var(--pa-green-primary) / 0.28)',
  boxShadow: 'none',
} as const;

const MUTED_USER_MESSAGE_CARD_STYLE = {
  background: 'rgb(var(--pa-bg-elevated) / 0.72)',
  border: '1px solid rgb(var(--pa-border-neutral) / 0.4)',
  boxShadow: 'none',
} as const;

interface CopilotMessageBubbleProps {
  message: Message;
  isStreaming?: boolean;
  showStreamCursor?: boolean;
  muted?: boolean;
  footer?: ReactNode;
  children?: ReactNode;
}

export function CopilotMessageBubble({
  message,
  isStreaming,
  showStreamCursor = true,
  muted = false,
  footer,
  children,
}: CopilotMessageBubbleProps) {
  const isUser = message.role === MessageRole.User;
  const content =
    typeof message.content === 'string' ? message.content : JSON.stringify(message.content);

  if (!isUser) {
    return (
      <AssistantMessageShell maxWidth="85%">
        <div
          style={{
            overflowWrap: 'anywhere',
            wordBreak: 'break-word',
          }}
        >
          {isStreaming ? (
            <Text
              size="sm"
              style={{
                whiteSpace: 'pre-wrap',
                lineHeight: 1.55,
              }}
            >
              {content}
            </Text>
          ) : (
            <CopilotMarkdown content={content} />
          )}
          {isStreaming && showStreamCursor ? (
            <Text span c="paGreen" inherit className="copilot-stream-cursor">
              {' '}
              ▍
            </Text>
          ) : null}
        </div>
        {children}
      </AssistantMessageShell>
    );
  }

  return (
    <Group
      justify="flex-end"
      align="flex-start"
      wrap="nowrap"
      gap="sm"
      className="copilot-user-enter"
    >
      <div style={{ maxWidth: '85%', opacity: muted ? 0.62 : 1 }}>
        <Paper
          p="md"
          radius="lg"
          style={muted ? MUTED_USER_MESSAGE_CARD_STYLE : USER_MESSAGE_CARD_STYLE}
        >
          <Text
            size="sm"
            c={muted ? 'dimmed' : undefined}
            style={{
              whiteSpace: 'pre-wrap',
              lineHeight: 1.55,
              overflowWrap: 'anywhere',
              wordBreak: 'break-word',
            }}
          >
            {content}
          </Text>
        </Paper>
        {footer}
      </div>
    </Group>
  );
}
