import { Group, Pagination, Select, Table, Text, TextInput, UnstyledButton } from '@mantine/core';
import { Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import type { ClassifiedProduct } from '../../types/api';
import { formatPercent, formatPln } from '../../lib/format';
import { SegmentBadge } from '../ui/SegmentBadge';
import {
  filterAndSortCatalogProducts,
  type CatalogSortDir,
  type CatalogSortKey,
} from './catalogProductFilters';
import { getProductRowStyle } from './productTableStyles';

const PAGE_SIZE_OPTIONS = ['10', '25', '50', '100'] as const;
const DEFAULT_PAGE_SIZE = 25;

interface ProductCatalogTableProps {
  products: ClassifiedProduct[];
  onSelectProduct?: (product: ClassifiedProduct) => void;
  selectedId?: string | null;
  paginated?: boolean;
}

export function ProductCatalogTable({
  products,
  onSelectProduct,
  selectedId,
  paginated = true,
}: ProductCatalogTableProps) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<CatalogSortKey>('spend');
  const [sortDir, setSortDir] = useState<CatalogSortDir>('desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const filtered = useMemo(
    () => filterAndSortCatalogProducts(products, search, sortKey, sortDir),
    [products, search, sortDir, sortKey],
  );

  useEffect(() => {
    setPage(1);
  }, [search, sortKey, sortDir, products.length, pageSize]);

  const totalPages = paginated ? Math.max(1, Math.ceil(filtered.length / pageSize)) : 1;
  const safePage = Math.min(page, totalPages);
  const pageRows = paginated
    ? filtered.slice((safePage - 1) * pageSize, safePage * pageSize)
    : filtered;
  const rangeStart = filtered.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const rangeEnd = paginated ? Math.min(safePage * pageSize, filtered.length) : filtered.length;

  const toggleSort = (key: CatalogSortKey) => {
    if (sortKey === key) {
      setSortDir((dir) => (dir === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSortKey(key);
    setSortDir('desc');
  };

  const sortLabel = (key: CatalogSortKey, label: string) => {
    const active = sortKey === key;
    const direction = active ? (sortDir === 'asc' ? 'rosnąco' : 'malejąco') : '';
    return (
      <UnstyledButton
        onClick={() => toggleSort(key)}
        aria-label={active ? `${label}, ${direction}` : `Sortuj: ${label}`}
      >
        <Text size="sm" fw={active ? 600 : 500} c={active ? 'paGreen' : 'dimmed'}>
          {label}
          {active ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''}
        </Text>
      </UnstyledButton>
    );
  };

  return (
    <>
      <Group mb="md">
        <TextInput
          placeholder="Szukaj po nazwie, SKU lub ID"
          aria-label="Szukaj produktów"
          leftSection={<Search size={16} />}
          value={search}
          onChange={(event) => setSearch(event.currentTarget.value)}
          maw={300}
          w="100%"
        />
      </Group>
      <Table highlightOnHover verticalSpacing="sm" stickyHeader stickyHeaderOffset={0}>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>{sortLabel('name', 'Produkt')}</Table.Th>
            <Table.Th>{sortLabel('spend', 'Wydatki')}</Table.Th>
            <Table.Th>{sortLabel('revenue', 'Przychód')}</Table.Th>
            <Table.Th>{sortLabel('profit', 'Zysk')}</Table.Th>
            <Table.Th>{sortLabel('margin', 'Marża')}</Table.Th>
            <Table.Th>{sortLabel('stock', 'Stan')}</Table.Th>
            <Table.Th>Segment</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {pageRows.map((product) => {
            const selected = selectedId === product.id;
            const clickable = Boolean(onSelectProduct);
            return (
            <Table.Tr
              key={product.id}
              onClick={() => onSelectProduct?.(product)}
              onKeyDown={(event) => {
                if (!clickable) {
                  return;
                }
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onSelectProduct?.(product);
                }
              }}
              tabIndex={clickable ? 0 : undefined}
              aria-selected={clickable ? selected : undefined}
              style={getProductRowStyle(selectedId, product.id, {
                clickable,
              })}
            >
              <Table.Td>
                <Text size="sm" fw={500}>
                  {product.name}
                </Text>
                <Text size="xs" c="dimmed">
                  {product.sku}
                </Text>
              </Table.Td>
              <Table.Td>
                <Text size="sm">{formatPln(product.googleAdsSpend)}</Text>
              </Table.Td>
              <Table.Td>
                <Text size="sm">{formatPln(product.netRevenue)}</Text>
              </Table.Td>
              <Table.Td>
                <Text size="sm">{formatPln(product.profit)}</Text>
              </Table.Td>
              <Table.Td>
                <Text size="sm">{formatPercent(product.marginPercent)}</Text>
              </Table.Td>
              <Table.Td>
                <Text size="sm">{product.stock}</Text>
              </Table.Td>
              <Table.Td>
                <SegmentBadge segment={product.segment} />
              </Table.Td>
            </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>
      {paginated && filtered.length > 0 ? (
        <Group justify="space-between" mt="md" align="center" wrap="wrap" gap="md">
          <Text size="sm" c="dimmed">
            Widoczne {rangeStart}–{rangeEnd} z {filtered.length}
          </Text>
          <Group gap="md" align="center" wrap="nowrap">
            <Group gap={8} align="center" wrap="nowrap">
              <Text size="sm" c="dimmed" component="label" htmlFor="product-page-size">
                Page size
              </Text>
              <Select
                id="product-page-size"
                aria-label="Page size"
                data={[...PAGE_SIZE_OPTIONS]}
                value={String(pageSize)}
                onChange={(value) => {
                  if (!value) {
                    return;
                  }
                  setPageSize(Number(value));
                }}
                allowDeselect={false}
                w={88}
                size="xs"
              />
            </Group>
            {totalPages > 1 ? (
              <Pagination
                total={totalPages}
                value={safePage}
                onChange={setPage}
                size="sm"
                color="paGreen"
              />
            ) : null}
          </Group>
        </Group>
      ) : null}
    </>
  );
}
