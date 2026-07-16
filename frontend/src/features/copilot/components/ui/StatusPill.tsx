import { Badge } from '@mantine/core';

type StatusPillVariant = 'live' | 'demo' | 'segment' | 'neutral' | 'warning';

interface StatusPillProps {
  variant?: StatusPillVariant;
  label: string;
  color?: string;
}

const VARIANT_COLOR: Record<StatusPillVariant, string> = {
  live: 'paGreen',
  demo: 'gray',
  segment: 'paGreen',
  neutral: 'gray',
  warning: 'yellow',
};

export function StatusPill({ variant = 'neutral', label, color }: StatusPillProps) {
  return (
    <Badge color={color ?? VARIANT_COLOR[variant]} variant="light" radius="sm" size="sm">
      {label}
    </Badge>
  );
}
