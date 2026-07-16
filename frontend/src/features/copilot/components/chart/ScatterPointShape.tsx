import { PA_CHART_COLORS, SEGMENT_CHART_COLOR } from '../../../../design/chart-theme';
import type { ProductSegment } from '../../types/api';

interface ScatterPointPayload {
  id: string;
  segment?: ProductSegment;
  matched?: boolean;
}

interface ScatterPointShapeProps {
  cx?: number;
  cy?: number;
  payload?: ScatterPointPayload;
  selectedId?: string | null;
}

export function ScatterPointShape({ cx = 0, cy = 0, payload, selectedId }: ScatterPointShapeProps) {
  if (!payload) {
    return null;
  }

  const selected = payload.id === selectedId;
  const fill =
    payload.segment != null ? SEGMENT_CHART_COLOR[payload.segment] : PA_CHART_COLORS.neutral;
  const dimmed = payload.matched === false;

  return (
    <circle
      cx={cx}
      cy={cy}
      r={selected ? 7 : 5}
      fill={selected ? PA_CHART_COLORS.bright : fill}
      opacity={dimmed ? 0.28 : 1}
      stroke={selected ? PA_CHART_COLORS.selectedStroke : 'transparent'}
      strokeWidth={selected ? 2 : 0}
    />
  );
}
