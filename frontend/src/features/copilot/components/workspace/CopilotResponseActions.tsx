import { Button } from '@mantine/core';

import type { AnalysisResult } from '../../types/api';
import { analysisListCount } from '../../lib/analysis/analysisListCount';
import { formatProductCount } from '../../lib/format';

interface CopilotResponseActionsProps {
  analysis: AnalysisResult;
  onOpenInsights: () => void;
}

export function CopilotResponseActions({ analysis, onOpenInsights }: CopilotResponseActionsProps) {
  const listCount = analysisListCount(analysis);
  const hasResult =
    analysis.showCta ||
    listCount > 0 ||
    analysis.aggregations.length > 0 ||
    analysis.groupRows.length > 0;
  if (!hasResult) {
    return null;
  }

  const label =
    analysis.operation === 'list' && listCount > 0
      ? `Zobacz analizę · ${formatProductCount(listCount)}`
      : 'Zobacz analizę · wynik';

  return (
    <Button size="sm" variant="light" color="paGreen" mt="sm" onClick={onOpenInsights}>
      {label}
    </Button>
  );
}
