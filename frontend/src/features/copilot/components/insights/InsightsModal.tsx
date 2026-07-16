import { lazy, Suspense } from 'react';

import { useInsights } from '../../session/useInsights';

const InsightsModalView = lazy(() =>
  import('./InsightsModalView').then((module) => ({ default: module.InsightsModalView })),
);

interface InsightsModalProps {
  opened: boolean;
  onClose: () => void;
}

export function InsightsModal({ opened, onClose }: InsightsModalProps) {
  const insights = useInsights();

  return (
    <Suspense fallback={null}>
      <InsightsModalView
        opened={opened}
        onClose={onClose}
        analysis={insights.analysis}
        selectedProduct={insights.selectedProduct}
        classifiedById={insights.classifiedById}
        onSelectScatterProduct={insights.selectScatterProduct}
        onSelectMatchedProduct={insights.selectScatterProduct}
        setSelectedProduct={insights.setSelectedProduct}
      />
    </Suspense>
  );
}
