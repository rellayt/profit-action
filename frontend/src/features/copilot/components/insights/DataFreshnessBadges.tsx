import { Badge, Group } from '@mantine/core';

import type { DataFreshness } from '../../types/api';
import { formatRelativeFreshness } from '../../lib/format';

interface DataFreshnessBadgesProps {
  items: DataFreshness[];
}

export function DataFreshnessBadges({ items }: DataFreshnessBadgesProps) {
  return (
    <Group gap={6}>
      {items.map((item) => (
        <Badge
          key={item.source}
          variant="light"
          color="paGreen"
          size="sm"
          styles={{
            root: {
              textTransform: 'none',
              fontWeight: 500,
            },
          }}
        >
          {item.label} · {formatRelativeFreshness(item.updatedAt)}
        </Badge>
      ))}
    </Group>
  );
}
