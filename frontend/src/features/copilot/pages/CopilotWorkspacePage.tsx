import { Box, Stack, Text, Title } from '@mantine/core';

import { useHealthQuery } from '../api/health';
import { StatusPill } from '../components/ui/StatusPill';
import { CopilotChatPanel } from '../components/workspace/CopilotChatPanel';

export function CopilotWorkspacePage() {
  const healthQuery = useHealthQuery();
  const liveAiAvailable = healthQuery.data?.liveAiAvailable ?? false;

  return (
    <Box maw={935} mx="auto" w="100%" className="copilot-fade-in">
      <Stack gap="xl">
        <Stack gap={6}>
          <Text size="xs" c="paGreen" tt="uppercase" fw={700} lts={0.6}>
            Copilot
          </Text>
          <Title order={2}>Zapytaj o dane produktów</Title>
          <Text size="sm" c="dimmed">
            Zamieniaj wyniki produktowe w zrozumiałe, wyjaśnialne rekomendacje.
          </Text>
          <StatusPill
            variant={liveAiAvailable ? 'live' : 'demo'}
            label={liveAiAvailable ? 'Live AI' : 'Tryb demo'}
          />
        </Stack>

        <CopilotChatPanel />
      </Stack>
    </Box>
  );
}
