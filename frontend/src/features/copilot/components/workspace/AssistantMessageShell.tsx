import { Box, Group, Paper, Text } from '@mantine/core';
import type { ReactNode } from 'react';

import { paSurfaceStyle } from '../../../../design/surface';
import { BrandMark } from '../ui/BrandMark';

interface AssistantMessageShellProps {
  children: ReactNode;
  maxWidth?: string | number;
}

export function AssistantMessageShell({ children, maxWidth }: AssistantMessageShellProps) {
  return (
    <Group justify="flex-start" align="flex-start" wrap="nowrap" gap="sm">
      <Box mt={4} style={{ flexShrink: 0 }}>
        <BrandMark size={28} radius={8} />
      </Box>
      <Paper p="md" radius="lg" maw={maxWidth} style={paSurfaceStyle()}>
        <Text size="xs" c="dimmed" mb={6} fw={600} tt="uppercase" lts={0.4}>
          Copilot
        </Text>
        {children}
      </Paper>
    </Group>
  );
}
