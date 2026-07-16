import { useCallback, useEffect, useLayoutEffect, useState } from 'react';

import { PA_CHART_COLORS } from '../../../../design/chart-theme';
import { useFadePresence } from './useFadePresence';

export const SCATTER_HOVER_FADE_MS = 200;

interface ScatterCrosshairGeom {
  x: number;
  y: number;
  top: number;
  left: number;
  width: number;
  height: number;
}

function readGeom(props: Partial<ScatterCrosshairGeom>): ScatterCrosshairGeom | null {
  const { x, y, top, left, width, height } = props;
  if (
    typeof x !== 'number' ||
    typeof y !== 'number' ||
    typeof top !== 'number' ||
    typeof left !== 'number' ||
    typeof width !== 'number' ||
    typeof height !== 'number' ||
    !Number.isFinite(x) ||
    !Number.isFinite(y) ||
    !Number.isFinite(top) ||
    !Number.isFinite(left) ||
    !Number.isFinite(width) ||
    !Number.isFinite(height)
  ) {
    return null;
  }
  return { x, y, top, left, width, height };
}

export function useScatterCrosshairFade() {
  const [activeGeom, setActiveGeom] = useState<ScatterCrosshairGeom | null>(null);
  const { value: geom, visible } = useFadePresence(activeGeom, SCATTER_HOVER_FADE_MS);

  const show = useCallback((next: ScatterCrosshairGeom) => {
    setActiveGeom(next);
  }, []);

  const hide = useCallback(() => {
    setActiveGeom(null);
  }, []);

  return { geom, visible, show, hide };
}

export function ScatterCursorProbe(
  props: Partial<ScatterCrosshairGeom> & {
    onShow: (geom: ScatterCrosshairGeom) => void;
    onHide: () => void;
  },
) {
  const { x, y, top, left, width, height, onShow, onHide } = props;

  useLayoutEffect(() => {
    const geom = readGeom({ x, y, top, left, width, height });
    if (geom) {
      onShow(geom);
    }
  }, [x, y, top, left, width, height, onShow]);

  useEffect(() => () => onHide(), [onHide]);

  return null;
}

export function ScatterCrosshairOverlay({
  geom,
  visible,
}: {
  geom: ScatterCrosshairGeom | null;
  visible: boolean;
}) {
  if (!geom) {
    return null;
  }

  return (
    <path
      d={`M${geom.x},${geom.top}v${geom.height}M${geom.left},${geom.y}h${geom.width}`}
      fill="none"
      stroke={PA_CHART_COLORS.axis}
      strokeDasharray="3 3"
      pointerEvents="none"
      className="copilot-scatter-crosshair"
      style={{
        opacity: visible ? 1 : 0,
        transition: `opacity ${SCATTER_HOVER_FADE_MS}ms ease`,
      }}
    />
  );
}
