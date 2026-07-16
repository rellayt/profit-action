import { Badge } from '@mantine/core';

import type { ProductSegment } from '../../types/api';
import { SEGMENT_COLOR, SEGMENT_LABEL } from '../../lib/segmentMeta';

interface SegmentBadgeProps {
  segment: ProductSegment;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  w?: string | number;
}

export function SegmentBadge({ segment, size = 'sm', w }: SegmentBadgeProps) {
  return (
    <Badge color={SEGMENT_COLOR[segment]} variant="light" size={size} w={w}>
      {SEGMENT_LABEL[segment]}
    </Badge>
  );
}
