import { Group, Paper, Stack, Text, ThemeIcon } from '@mantine/core';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { paSurfaceStyle } from '../../../../design/surface';

interface PageSectionProps {
  icon?: LucideIcon;
  title: ReactNode;
  subtitle?: ReactNode;
  toolbar?: ReactNode;
  children: ReactNode;
  accent?: boolean;
}

export function PageSection({
  icon: Icon,
  title,
  subtitle,
  toolbar,
  children,
  accent = false,
}: PageSectionProps) {
  return (
    <Paper p="lg" radius="lg" style={paSurfaceStyle({ accent })}>
      <Group justify="space-between" align="flex-start" mb="md">
        <Group align="flex-start" gap="sm">
          {Icon ? (
            <ThemeIcon variant="light" color="paGreen" size="md" radius="md">
              <Icon size={16} />
            </ThemeIcon>
          ) : null}
          <Stack gap={2}>
            <Text fw={600} size="md">
              {title}
            </Text>
            {subtitle ? (
              <Text size="sm" c="dimmed">
                {subtitle}
              </Text>
            ) : null}
          </Stack>
        </Group>
        {toolbar}
      </Group>
      {children}
    </Paper>
  );
}
