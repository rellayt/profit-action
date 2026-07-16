import { Drawer, Modal, Stack, Text, Title } from '@mantine/core';
import { useEffect, useState } from 'react';

import { analysisListCount } from '../../lib/analysis/analysisListCount';
import type { AnalysisResult, ClassifiedProduct } from '../../types/api';
import { AnalysisResultSections } from './AnalysisResultSections';
import { InsightSummaryCards } from './InsightSummaryCards';
import { ProductEvidencePanel } from './ProductEvidencePanel';

interface InsightsModalViewProps {
  opened: boolean;
  onClose: () => void;
  analysis: AnalysisResult | null | undefined;
  selectedProduct: ClassifiedProduct | null;
  classifiedById: Map<string, ClassifiedProduct>;
  onSelectScatterProduct: (productId: string) => void;
  onSelectMatchedProduct: (productId: string) => void;
  setSelectedProduct: (product: ClassifiedProduct | null) => void;
}

export function InsightsModalView({
  opened,
  onClose,
  analysis,
  selectedProduct,
  classifiedById,
  onSelectScatterProduct,
  onSelectMatchedProduct,
  setSelectedProduct,
}: InsightsModalViewProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (selectedProduct) {
      setDrawerOpen(true);
    }
  }, [selectedProduct]);

  useEffect(() => {
    if (!opened) {
      setDrawerOpen(false);
    }
  }, [opened]);

  return (
    <>
      <Modal
        opened={opened}
        onClose={onClose}
        title="Przegląd analizy"
        size={720}
        centered
        padding="lg"
        radius="lg"
        overlayProps={{
          backgroundOpacity: 0.55,
          blur: 10,
        }}
        transitionProps={{
          transition: 'pop',
          duration: 220,
          timingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
        }}
        classNames={{
          content: 'copilot-insights-modal',
          body: 'copilot-insights-modal-body',
        }}
        styles={{
          content: {
            background: 'rgb(var(--pa-bg-surface))',
            maxHeight: 'min(85vh, 820px)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          },
          header: {
            flexShrink: 0,
          },
          body: {
            paddingTop: 8,
            flex: '1 1 auto',
            minHeight: 0,
            maxHeight: 'calc(min(85vh, 820px) - 72px)',
            overflowX: 'hidden',
            overflowY: 'auto',
          },
        }}
      >
        {!analysis ? (
          <Text size="sm" c="dimmed">
            Nie udało się wczytać tej analizy. Spróbuj uruchomić pytanie ponownie.
          </Text>
        ) : (
          <Stack gap="lg" pb="sm">
            <Stack gap={4}>
              <Text size="xs" c="paGreen" tt="uppercase" fw={700} lts={0.6}>
                Analiza
              </Text>
              <Title order={4}>{analysis.criteriaSummary}</Title>
              {analysis.interpretationNote ? (
                <Text size="sm" c="dimmed">
                  {analysis.interpretationNote}
                </Text>
              ) : null}
              <Text size="sm" c="dimmed">
                Okres: {analysis.periodDays} dni · w wyniku {analysisListCount(analysis)} z{' '}
                {analysis.summary?.productsAnalyzed ?? 0} produktów w zakresie
              </Text>
            </Stack>

            {analysis.kpis.length > 0 ? <InsightSummaryCards analysis={analysis} /> : null}

            <AnalysisResultSections
              analysis={analysis}
              selectedProductId={selectedProduct?.id ?? null}
              classifiedById={classifiedById}
              onSelectScatterProduct={onSelectScatterProduct}
              onSelectMatchedProduct={onSelectMatchedProduct}
            />
          </Stack>
        )}
      </Modal>

      <Drawer
        opened={drawerOpen && Boolean(selectedProduct)}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedProduct(null);
        }}
        title="Dowody produktu"
        position="right"
        size="md"
        padding="lg"
        overlayProps={{
          backgroundOpacity: 0.35,
          blur: 6,
        }}
        transitionProps={{
          transition: 'slide-left',
          duration: 200,
        }}
        styles={{
          content: {
            background: 'rgb(var(--pa-bg-surface))',
          },
          body: {
            paddingTop: 'var(--mantine-spacing-md)',
          },
        }}
      >
        <ProductEvidencePanel product={selectedProduct} />
      </Drawer>
    </>
  );
}
