import { Group, Text } from '@mantine/core';

import { SEGMENT_CHART_COLOR } from '../../../../design/chart-theme';
import type { ProductSegment } from '../../types/api';
import { SEGMENT_LABEL } from '../../lib/segmentMeta';

const LEGEND_SEGMENTS: ProductSegment[] = ['stop_spending', 'rescue', 'scale', 'neutral'];

export function ScatterSegmentLegend() {
  return (
    <Group gap="md">
      {LEGEND_SEGMENTS.map((segment) => (
        <Group key={segment} gap={6}>
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: SEGMENT_CHART_COLOR[segment],
              display: 'inline-block',
            }}
          />
          <Text size="sm" c="dimmed">
            {SEGMENT_LABEL[segment]}
          </Text>
        </Group>
      ))}
    </Group>
  );
}
