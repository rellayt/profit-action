import { Paper, Text, ThemeIcon } from '@mantine/core';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { paSurfaceStyle } from '../../../../design/surface';

interface MetricTileProps {
  icon?: LucideIcon;
  label: string;
  value: ReactNode;
  accent?: boolean;
}

export function MetricTile({ icon: Icon, label, value, accent = false }: MetricTileProps) {
  return (
    <Paper p="lg" radius="lg" style={{ ...paSurfaceStyle({ accent }), minHeight: 132 }}>
      {Icon ? (
        <ThemeIcon variant="light" color="paGreen" size="sm" radius="md" mb="xs">
          <Icon size={16} />
        </ThemeIcon>
      ) : null}
      <Text size="xs" c="dimmed" tt="uppercase" fw={600} lts={0.4}>
        {label}
      </Text>
      <Text size="xl" fw={700} mt={6} lh={1.2}>
        {value}
      </Text>
    </Paper>
  );
}
