import { Box, Button, Group, Stack } from '@mantine/core';

import { STARTER_QUERY_CHIPS } from '../../lib/chat/copilotConstants';
import { BrandMark } from '../ui/BrandMark';

interface CopilotChatEmptyStateProps {
  onSelectChip: (query: string) => void;
  disabled?: boolean;
}

export function CopilotChatEmptyState({
  onSelectChip,
  disabled = false,
}: CopilotChatEmptyStateProps) {
  return (
    <Stack align="center" justify="center" gap="sm" w="100%">
      <BrandMark size={40} radius={10} />
      <Box component="span" fw={600} fz="lg" ta="center" style={{ display: 'block' }}>
        Profit Action
      </Box>
      <Box
        component="span"
        fz="sm"
        c="dimmed"
        ta="center"
        maw={420}
        mx="auto"
        style={{ display: 'block', lineHeight: 1.5 }}
      >
        Zapytaj o dane produktowe. Dostaniesz wyjaśnialne rekomendacje, które sprawdzisz na wykresie
        i w katalogu.
      </Box>
      <Group gap="sm" mt="xs" justify="center" role="group" aria-label="Przykładowe pytania">
        {STARTER_QUERY_CHIPS.map((chip) => (
          <Button
            key={chip}
            size="compact-sm"
            variant="light"
            color="gray"
            disabled={disabled}
            onClick={() => onSelectChip(chip)}
          >
            {chip}
          </Button>
        ))}
      </Group>
    </Stack>
  );
}
