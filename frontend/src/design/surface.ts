import type { CSSProperties } from 'react';

interface PaSurfaceStyleOptions {
  accent?: boolean;
}

export function paSurfaceStyle(options: PaSurfaceStyleOptions = {}): CSSProperties {
  const accent = options.accent ?? false;
  return {
    background: 'rgb(var(--pa-bg-card))',
    border: accent
      ? '1px solid rgb(var(--pa-green-primary) / 0.22)'
      : '1px solid rgb(var(--pa-border-neutral) / 0.35)',
    boxShadow: accent ? 'var(--pa-shadow-glow)' : 'var(--pa-shadow-card)',
  };
}
