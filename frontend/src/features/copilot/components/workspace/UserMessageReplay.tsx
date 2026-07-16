import { Button, Group, Text } from '@mantine/core';
import { RotateCcw } from 'lucide-react';

interface UserMessageReplayProps {
  onReplay: () => void;
  disabled?: boolean;
}

export function UserMessageReplay({ onReplay, disabled }: UserMessageReplayProps) {
  return (
    <Group justify="flex-end" gap="sm" mt={6} wrap="nowrap">
      <Text size="xs" c="dimmed">
        Analiza niedostępna
      </Text>
      <Button
        size="compact-sm"
        variant="light"
        color="gray"
        leftSection={<RotateCcw size={14} />}
        onClick={onReplay}
        disabled={disabled}
      >
        Ponów
      </Button>
    </Group>
  );
}
