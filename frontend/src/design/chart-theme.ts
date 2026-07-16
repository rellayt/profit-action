/**
 * Recharts-facing colors. Keep in sync with `tokens.css`:
 * --pa-green-bright/primary/deep, --pa-stop, --pa-rescue, --pa-scale, --pa-neutral,
 * --pa-text-secondary (axis/grid), --pa-text-primary (selectedStroke).
 */
export const PA_CHART_COLORS = {
  primary: '#14d977',
  bright: '#21f18b',
  deep: '#0ea85c',
  stop: '#f87171',
  rescue: '#fbbf24',
  scale: '#21f18b',
  grid: 'rgb(148 163 184 / 0.15)',
  axis: 'rgb(148 163 184 / 0.55)',
  neutral: '#94a3b8',
  selectedStroke: '#ecfdf5',
} as const;

type ChartSegment = 'stop_spending' | 'rescue' | 'scale' | 'neutral';

export const SEGMENT_CHART_COLOR: Record<ChartSegment, string> = {
  stop_spending: PA_CHART_COLORS.stop,
  rescue: PA_CHART_COLORS.rescue,
  scale: PA_CHART_COLORS.scale,
  neutral: PA_CHART_COLORS.neutral,
};
