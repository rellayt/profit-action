import { SimpleGrid } from '@mantine/core';
import { Activity, BarChart3, Package } from 'lucide-react';

import type { AnalysisKpi, AnalysisResult } from '../../types/api';
import { formatPln } from '../../lib/format';
import { MetricTile } from '../ui/MetricTile';

interface InsightSummaryCardsProps {
  analysis: AnalysisResult;
}

function formatKpiValue(kpi: AnalysisKpi): string {
  if (kpi.format === 'currency' && typeof kpi.value === 'number') {
    return formatPln(kpi.value);
  }
  return String(kpi.value);
}

const KPI_ICONS = [Package, Activity, BarChart3] as const;

export function InsightSummaryCards({ analysis }: InsightSummaryCardsProps) {
  const kpis = analysis.kpis.slice(0, 3);
  return (
    <SimpleGrid cols={{ base: 1, sm: Math.min(3, kpis.length) || 1 }} spacing="md">
      {kpis.map((kpi, index) => {
        const Icon = KPI_ICONS[index] ?? Package;
        return (
          <MetricTile
            key={kpi.key}
            icon={Icon}
            label={kpi.label}
            value={formatKpiValue(kpi)}
            accent={index === 0}
          />
        );
      })}
    </SimpleGrid>
  );
}
