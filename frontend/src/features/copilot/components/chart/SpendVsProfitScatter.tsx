import { Stack, Text } from '@mantine/core';
import {
  CartesianGrid,
  Customized,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from 'recharts';

import { PA_CHART_COLORS } from '../../../../design/chart-theme';
import type { ChartPoint } from '../../types/api';
import {
  ScatterCrosshairOverlay,
  ScatterCursorProbe,
  useScatterCrosshairFade,
} from './ScatterCrosshair';
import { ScatterPointShape } from './ScatterPointShape';
import { ScatterSegmentLegend } from './ScatterSegmentLegend';
import { ScatterTooltip } from './ScatterTooltip';

interface SpendVsProfitScatterProps {
  chartPoints: ChartPoint[];
  matchedProductIds?: string[];
  caption?: string;
  selectedId?: string | null;
  onSelect?: (productId: string) => void;
}

const SCATTER_HEIGHT_PX = 320;

export function SpendVsProfitScatter({
  chartPoints,
  matchedProductIds,
  caption,
  selectedId,
  onSelect,
}: SpendVsProfitScatterProps) {
  const matched = new Set(matchedProductIds ?? []);
  const scatterRows = chartPoints.map((point) => ({
    id: point.productId,
    name: point.name,
    spend: point.spend,
    revenue: point.revenue,
    profit: point.profit,
    stock: point.stock,
    segment: point.segment,
    matched: matched.size === 0 || matched.has(point.productId),
  }));
  const crosshair = useScatterCrosshairFade();

  return (
    <Stack gap="md">
      <Stack gap={4}>
        <Text fw={600} size="md">
          Wydatki vs zysk
        </Text>
        <Text size="sm" c="dimmed">
          {caption ?? 'Każda kropka to dopasowany produkt. Kliknij, aby zobaczyć dowody.'}
        </Text>
        <ScatterSegmentLegend />
      </Stack>
      <div style={{ height: SCATTER_HEIGHT_PX }}>
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
            <CartesianGrid stroke={PA_CHART_COLORS.grid} strokeDasharray="3 3" />
            <XAxis
              type="number"
              dataKey="spend"
              name="Wydatki"
              tick={{ fontSize: 12, fill: PA_CHART_COLORS.axis }}
              label={{
                value: 'Wydatki (PLN)',
                position: 'insideBottom',
                offset: -4,
                fill: PA_CHART_COLORS.axis,
              }}
            />
            <YAxis
              type="number"
              dataKey="profit"
              name="Zysk"
              tick={{ fontSize: 12, fill: PA_CHART_COLORS.axis }}
              label={{
                value: 'Zysk (PLN)',
                angle: -90,
                position: 'insideLeft',
                fill: PA_CHART_COLORS.axis,
              }}
            />
            <ZAxis type="number" dataKey="stock" range={[40, 400]} />
            <Tooltip
              content={<ScatterTooltip />}
              cursor={<ScatterCursorProbe onShow={crosshair.show} onHide={crosshair.hide} />}
              isAnimationActive={false}
            />
            <Customized
              component={
                <ScatterCrosshairOverlay geom={crosshair.geom} visible={crosshair.visible} />
              }
            />
            <Scatter
              name="Produkty"
              data={scatterRows}
              onClick={(point) => {
                if (point?.payload?.id && onSelect) {
                  onSelect(String(point.payload.id));
                }
              }}
              shape={(props) => (
                <ScatterPointShape
                  cx={props.cx}
                  cy={props.cy}
                  payload={
                    props.payload as {
                      id: string;
                      segment?: ChartPoint['segment'];
                      matched?: boolean;
                    }
                  }
                  selectedId={selectedId}
                />
              )}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </Stack>
  );
}
