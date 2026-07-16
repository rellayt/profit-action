import { Paper, Stack, Table, Text } from '@mantine/core';
import { useMemo } from 'react';

import { paSurfaceStyle } from '../../../../design/surface';
import { matchedProductsFromCatalog } from '../../lib/analysis/matchedProductsFromCatalog';
import { formatPln } from '../../lib/format';
import type { AnalysisResult, ClassifiedProduct } from '../../types/api';
import { SpendVsProfitScatter } from '../chart/SpendVsProfitScatter';
import { MatchedProductsTable } from './MatchedProductsTable';

interface AnalysisResultSectionsProps {
  analysis: AnalysisResult;
  selectedProductId: string | null;
  classifiedById: Map<string, ClassifiedProduct>;
  onSelectScatterProduct: (productId: string) => void;
  onSelectMatchedProduct: (productId: string) => void;
}

export function AnalysisResultSections({
  analysis,
  selectedProductId,
  classifiedById,
  onSelectScatterProduct,
  onSelectMatchedProduct,
}: AnalysisResultSectionsProps) {
  const aggregations = analysis.aggregations;
  const groupRows = analysis.groupRows;
  const chartPoints = analysis.chartPoints;
  const matchedProductIds = useMemo(
    () => analysis.matchedProductIds,
    [analysis.matchedProductIds],
  );
  const matchedProducts = useMemo(
    () => matchedProductsFromCatalog(matchedProductIds, classifiedById, analysis.matchedProducts),
    [analysis.matchedProducts, classifiedById, matchedProductIds],
  );

  return (
    <>
      {analysis.operation === 'aggregate' && aggregations.length > 0 ? (
        <Paper p="md" radius="lg" style={paSurfaceStyle()}>
          <Stack gap="xs">
            {aggregations.map((row) => (
              <MetricLine
                key={`${row.fn}-${row.field}-${row.label}`}
                label={row.label}
                value={
                  row.field === 'spend' || row.field === 'revenue' || row.field === 'profit'
                    ? formatPln(Number(row.value))
                    : String(row.value)
                }
              />
            ))}
          </Stack>
        </Paper>
      ) : null}

      {analysis.operation === 'group' && groupRows.length > 0 ? (
        <Paper p="md" radius="lg" style={paSurfaceStyle()}>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Grupa</Table.Th>
                <Table.Th>Liczba</Table.Th>
                <Table.Th>Wydatki</Table.Th>
                <Table.Th>Zysk</Table.Th>
                <Table.Th>Śr. marża</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {groupRows.map((row) => (
                <Table.Tr key={row.key}>
                  <Table.Td>{row.key}</Table.Td>
                  <Table.Td>{row.count}</Table.Td>
                  <Table.Td>{formatPln(row.spend)}</Table.Td>
                  <Table.Td>{formatPln(row.profit)}</Table.Td>
                  <Table.Td>{row.avgMargin}%</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Paper>
      ) : null}

      {analysis.showChart && chartPoints.length > 0 ? (
        <Paper p="lg" radius="lg" style={paSurfaceStyle()}>
          <SpendVsProfitScatter
            chartPoints={chartPoints}
            matchedProductIds={matchedProductIds}
            caption={analysis.chartCaption}
            selectedId={selectedProductId}
            onSelect={onSelectScatterProduct}
          />
        </Paper>
      ) : null}

      {analysis.operation === 'list' &&
      (matchedProducts.length > 0 ||
        (analysis.summary?.matchedProducts ?? 0) > 0 ||
        matchedProductIds.length > 0) ? (
        <MatchedProductsTable products={matchedProducts} onSelect={onSelectMatchedProduct} />
      ) : null}
    </>
  );
}

function MetricLine({ label, value }: { label: string; value: string }) {
  return (
    <Text size="sm">
      <Text span fw={600}>
        {label}:
      </Text>{' '}
      {value}
    </Text>
  );
}
