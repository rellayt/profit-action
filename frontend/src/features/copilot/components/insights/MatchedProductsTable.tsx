import { Group, Pagination, Paper, Table, Text } from '@mantine/core';
import { useEffect, useMemo, useState } from 'react';

import { paSurfaceStyle } from '../../../../design/surface';
import { formatPln } from '../../lib/format';
import { SEGMENT_LABEL } from '../../lib/segmentMeta';
import type { MatchedProductRow } from '../../types/api';

const PAGE_SIZE = 6;

interface MatchedProductsTableProps {
  products: MatchedProductRow[];
  onSelect: (productId: string) => void;
}

export function MatchedProductsTable({ products, onSelect }: MatchedProductsTableProps) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(products.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  const productKey = `${products.length}:${products[0]?.id ?? ''}:${products[products.length - 1]?.id ?? ''}`;

  useEffect(() => {
    setPage(1);
  }, [productKey]);

  const pageRows = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return products.slice(start, start + PAGE_SIZE);
  }, [products, safePage]);

  return (
    <Paper p="md" radius="lg" style={paSurfaceStyle()}>
      <Group justify="space-between" align="center" mb="sm" wrap="nowrap">
        <Text fw={600} size="sm">
          Dopasowane produkty
        </Text>
        <Text size="xs" c="dimmed">
          {products.length} łącznie
        </Text>
      </Group>
      {pageRows.length === 0 ? (
        <Text size="sm" c="dimmed">
          Brak wierszy do wyświetlenia dla tej analizy.
        </Text>
      ) : (
        <Table highlightOnHover verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Produkt</Table.Th>
              <Table.Th>Wydatki</Table.Th>
              <Table.Th>Zysk</Table.Th>
              <Table.Th>Marża</Table.Th>
              <Table.Th>Powód</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {pageRows.map((row) => (
              <Table.Tr
                key={row.id}
                style={{ cursor: 'pointer' }}
                tabIndex={0}
                aria-label={`Produkt ${row.name}`}
                onClick={() => onSelect(row.id)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onSelect(row.id);
                  }
                }}
              >
                <Table.Td>
                  <Text size="sm" fw={500} lineClamp={1}>
                    {row.name}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {SEGMENT_LABEL[row.segment] ?? row.segment}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{formatPln(row.spend)}</Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{formatPln(row.profit)}</Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{row.margin}%</Text>
                </Table.Td>
                <Table.Td>
                  <Text size="xs" c="dimmed" lineClamp={2}>
                    {row.matchReason}
                  </Text>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}
      {totalPages > 1 ? (
        <Group justify="center" mt="md">
          <Pagination
            value={safePage}
            onChange={setPage}
            total={totalPages}
            size="sm"
            color="paGreen"
            radius="md"
          />
        </Group>
      ) : null}
    </Paper>
  );
}
