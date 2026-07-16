import { Paper, Stack, Text } from '@mantine/core';

import { paSurfaceStyle } from '../../../../design/surface';
import type { ProductSegment } from '../../types/api';
import { formatPln } from '../../lib/format';
import { SegmentBadge } from '../ui/SegmentBadge';
import { SCATTER_HOVER_FADE_MS } from './ScatterCrosshair';
import { useFadePresence } from './useFadePresence';

interface ScatterPointPayload {
  id: string;
  name: string;
  spend: number;
  revenue?: number;
  profit: number;
  stock: number;
  segment?: ProductSegment;
}

interface ScatterTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: ScatterPointPayload }>;
}

function metricRows(point: ScatterPointPayload): Array<{ label: string; value: string }> {
  return [
    { label: 'Wydatki', value: formatPln(point.spend) },
    { label: 'Przychód', value: formatPln(point.revenue ?? 0) },
    { label: 'Zysk', value: formatPln(point.profit) },
    { label: 'Stan', value: String(point.stock) },
  ];
}

export function ScatterTooltip({ active, payload }: ScatterTooltipProps) {
  const point = active ? (payload?.[0]?.payload ?? null) : null;
  const { value: displayPoint, visible } = useFadePresence(point, SCATTER_HOVER_FADE_MS);

  if (!displayPoint) {
    return null;
  }

  return (
    <Paper
      p="sm"
      radius="md"
      shadow="md"
      className={`copilot-scatter-tooltip${visible ? ' is-visible' : ''}`}
      style={{
        ...paSurfaceStyle({ accent: true }),
        minWidth: 200,
        pointerEvents: 'none',
      }}
    >
      <Stack gap={6}>
        <Text size="sm" fw={600}>
          {displayPoint.name}
        </Text>
        {metricRows(displayPoint).map((row) => (
          <Text key={row.label} size="sm" c="dimmed">
            {row.label}: {row.value}
          </Text>
        ))}
        {displayPoint.segment ? <SegmentBadge segment={displayPoint.segment} size="sm" /> : null}
      </Stack>
    </Paper>
  );
}
