import { Drawer, Stack, Text, Title } from '@mantine/core';
import { useState } from 'react';

import { useProductsQuery } from '../api/products';
import { ProductCatalogTable } from '../components/catalog/ProductCatalogTable';
import { ProductEvidencePanel } from '../components/insights/ProductEvidencePanel';
import { PageSection } from '../components/ui/PageSection';
import type { ClassifiedProduct } from '../types/api';

export function ProductsPage() {
  const productsQuery = useProductsQuery();
  const [selectedProduct, setSelectedProduct] = useState<ClassifiedProduct | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const products = productsQuery.data?.items ?? [];

  return (
    <Stack gap="lg" className="copilot-fade-in">
      <Stack gap={4}>
        <Text size="xs" c="paGreen" tt="uppercase" fw={700} lts={0.6}>
          Katalog
        </Text>
        <Title order={2}>Produkty</Title>
        <Text size="sm" c="dimmed">
          Pełny katalog produktów — niezależny podgląd danych z metadanymi segmentów.
        </Text>
      </Stack>

      <PageSection
        title="Katalog produktów"
        subtitle="Sortuj, wyszukuj i sprawdzaj uzasadnienie rekomendacji."
      >
        <ProductCatalogTable
          products={products}
          selectedId={selectedProduct?.id ?? null}
          onSelectProduct={(product) => {
            setSelectedProduct(product);
            setDrawerOpen(true);
          }}
        />
      </PageSection>

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
    </Stack>
  );
}
