import { ActionIcon, Box, Group, Textarea, Tooltip } from '@mantine/core';
import { Check, Mic, SendHorizontal, Square } from 'lucide-react';
import { useCallback, useEffect, useState, type KeyboardEvent, type MouseEvent } from 'react';

import { useVoiceCapture } from '../../hooks/useVoiceCapture';
import { VOICE_CONTROL_LABEL, VOICE_DISABLED_FALLBACK } from '../../lib/voice/voiceCopy';
import { VoiceListeningSurface } from './VoiceListeningSurface';

const VOICE_FADE_MS = 220;

interface CopilotComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  isSending: boolean;
  voiceEnabled: boolean;
  voiceDisabledReason?: string | null;
  onVoiceError?: (message: string | null) => void;
}

export function CopilotComposer({
  value,
  onChange,
  onSend,
  isSending,
  voiceEnabled,
  voiceDisabledReason,
  onVoiceError,
}: CopilotComposerProps) {
  const handleTranscript = useCallback(
    (transcript: string) => {
      onChange(transcript);
    },
    [onChange],
  );

  const { listening, bars, setBarCapacity, startListening, cancelListening, confirmListening } =
    useVoiceCapture({
      disabled: !voiceEnabled || isSending,
      onTranscript: handleTranscript,
      onError: onVoiceError,
    });

  const [voiceMounted, setVoiceMounted] = useState(false);
  const [voiceVisible, setVoiceVisible] = useState(false);

  useEffect(() => {
    if (listening) {
      setVoiceMounted(true);
      const showFrame = requestAnimationFrame(() => {
        setVoiceVisible(true);
      });
      return () => cancelAnimationFrame(showFrame);
    }

    setVoiceVisible(false);
    const hideTimer = window.setTimeout(() => {
      setVoiceMounted(false);
    }, VOICE_FADE_MS);
    return () => window.clearTimeout(hideTimer);
  }, [listening]);

  const paddingRight = 88;

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (value.trim() && !isSending) {
        onSend();
      }
    }
  };

  const handleMicClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    void startListening();
  };

  const handleCancelClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    cancelListening();
  };

  const handleConfirmClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    confirmListening();
  };

  const fieldShellStyle = {
    background: 'rgb(var(--pa-bg-elevated))',
    border: '1px solid rgb(var(--pa-border-neutral) / 0.3)',
    borderRadius: 16,
  } as const;

  return (
    <Box pos="relative">
      <Textarea
        value={value}
        onChange={(event) => onChange(event.currentTarget.value)}
        onKeyDown={handleKeyDown}
        aria-label="Wiadomość do Copilota"
        placeholder="Zapytaj o przepalony budżet reklamowy, ratunek konwersji albo skalowanie…"
        autosize
        minRows={1}
        maxRows={6}
        styles={{
          root: {
            transition: `opacity ${VOICE_FADE_MS}ms ease`,
            opacity: voiceVisible ? 0 : 1,
            pointerEvents: listening ? 'none' : undefined,
          },
          input: {
            ...fieldShellStyle,
            fontSize: 14,
            paddingTop: 12,
            paddingBottom: 12,
            paddingRight,
            overflowWrap: 'anywhere',
            wordBreak: 'break-word',
            lineHeight: 1.45,
            overflowY: value.trim() ? 'auto' : 'hidden',
          },
        }}
      />

      {voiceMounted ? (
        <Box
          className={`copilot-composer-voice-shell${voiceVisible ? ' is-visible' : ''}`}
          style={fieldShellStyle}
        >
          <VoiceListeningSurface bars={bars} onCapacityChange={setBarCapacity} />
        </Box>
      ) : null}

      <Group
        gap={6}
        wrap="nowrap"
        pos="absolute"
        right={10}
        bottom={6}
        style={{ pointerEvents: 'auto' }}
      >
        {listening ? (
          <Tooltip label="Anuluj" withArrow>
            <ActionIcon
              type="button"
              variant="light"
              color="red"
              size="lg"
              radius="xl"
              onClick={handleCancelClick}
              aria-label="Anuluj nagranie"
            >
              <Square size={16} />
            </ActionIcon>
          </Tooltip>
        ) : (
          <Tooltip
            label={
              voiceEnabled ? VOICE_CONTROL_LABEL : (voiceDisabledReason ?? VOICE_DISABLED_FALLBACK)
            }
            withArrow
          >
            <ActionIcon
              type="button"
              variant="subtle"
              color="paGreen"
              size="lg"
              radius="xl"
              disabled={!voiceEnabled || isSending}
              onClick={handleMicClick}
              aria-label={VOICE_CONTROL_LABEL}
              aria-pressed={listening}
            >
              <Mic size={18} />
            </ActionIcon>
          </Tooltip>
        )}
        {listening ? (
          <Tooltip label="Użyj transcriptu" withArrow>
            <ActionIcon
              type="button"
              variant="filled"
              color="paGreen"
              size="lg"
              radius="xl"
              onClick={handleConfirmClick}
              aria-label="Potwierdź transcript"
            >
              <Check size={18} />
            </ActionIcon>
          </Tooltip>
        ) : (
          <ActionIcon
            type="button"
            variant="subtle"
            color="paGreen"
            size="lg"
            radius="xl"
            loading={isSending}
            disabled={!value.trim() || isSending}
            onClick={onSend}
            aria-label="Wyślij wiadomość"
          >
            <SendHorizontal size={18} />
          </ActionIcon>
        )}
      </Group>
    </Box>
  );
}
