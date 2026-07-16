import { Paper, SimpleGrid, Stack, Text } from '@mantine/core';

import type { ClassifiedProduct } from '../../types/api';
import { formatPln } from '../../lib/format';
import { SegmentBadge } from '../ui/SegmentBadge';
import { DataFreshnessBadges } from './DataFreshnessBadges';

interface ProductEvidencePanelProps {
  product: ClassifiedProduct | null;
}

export function ProductEvidencePanel({ product }: ProductEvidencePanelProps) {
  if (!product) {
    return (
      <Text size="sm" c="dimmed">
        Wybierz produkt, aby zobaczyć uzasadnienie rekomendacji.
      </Text>
    );
  }

  const metrics = [
    { label: 'Wydatki', value: formatPln(product.googleAdsSpend) },
    { label: 'Przychód', value: formatPln(product.netRevenue) },
    { label: 'Zysk', value: formatPln(product.profit) },
    { label: 'Stan magazynowy', value: String(product.stock) },
  ];

  return (
    <Stack gap="md">
      <Stack gap={4}>
        <Text fw={600} size="md">
          {product.name}
        </Text>
        <SegmentBadge segment={product.segment} w="fit-content" />
      </Stack>
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
        {metrics.map((metric) => (
          <Paper key={metric.label} p="sm" radius="md" withBorder>
            <Text size="xs" c="dimmed">
              {metric.label}
            </Text>
            <Text size="sm" fw={600}>
              {metric.value}
            </Text>
          </Paper>
        ))}
      </SimpleGrid>
      <Stack gap="xs">
        <Text size="sm" fw={600}>
          Rekomendacja
        </Text>
        <Text size="sm">{product.recommendation}</Text>
        <DataFreshnessBadges items={product.freshness} />
      </Stack>
    </Stack>
  );
}
