import { Box } from '@mantine/core';

interface BrandMarkProps {
  size?: number;
  radius?: number;
}

export function BrandMark({ size = 32, radius = 8 }: BrandMarkProps) {
  const glyph = Math.round(size * 0.72);

  return (
    <Box
      w={size}
      h={size}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        overflow: 'hidden',
        borderRadius: radius,
        background: 'rgb(var(--pa-bg-card))',
        border: '1px solid rgb(var(--pa-border-neutral) / 0.35)',
      }}
    >
      <img
        src="/assets/pa-mark.png"
        alt=""
        width={glyph}
        height={glyph}
        decoding="async"
        draggable={false}
        style={{
          display: 'block',
          width: glyph,
          height: glyph,
          objectFit: 'contain',
        }}
      />
    </Box>
  );
}
