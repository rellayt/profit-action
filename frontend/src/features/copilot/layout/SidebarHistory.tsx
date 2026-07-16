import { Menu, NavLink, Stack, Text } from '@mantine/core';
import { MessageSquare, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { sortConversationsByUpdatedAt } from '../lib/conversation/conversationSort';
import type { ConversationSummary } from '../types/conversation';

interface SidebarHistoryProps {
  conversations: ConversationSummary[];
  activeConversationId: string | null;
  onSelect: (conversationId: string) => void;
  onDelete: (conversationId: string) => void;
}

interface ContextMenuState {
  id: string;
  x: number;
  y: number;
}

export function SidebarHistory({
  conversations,
  activeConversationId,
  onSelect,
  onDelete,
}: SidebarHistoryProps) {
  const [menu, setMenu] = useState<ContextMenuState | null>(null);

  if (conversations.length === 0) {
    return null;
  }

  const items = sortConversationsByUpdatedAt(conversations).slice(0, 12);

  return (
    <>
      <Stack gap={4} className="copilot-history-section">
        <Text
          size="xs"
          tt="uppercase"
          fw={600}
          lts={0.7}
          px={12}
          mb={2}
          style={{ color: 'rgb(var(--pa-text-secondary) / 0.75)' }}
        >
          Historia
        </Text>
        {items.map((item) => {
          const active = item.id === activeConversationId;
          return (
            <NavLink
              key={item.id}
              label={
                <Text size="sm" truncate="end" style={{ lineHeight: 1.35, whiteSpace: 'nowrap' }}>
                  {item.title}
                </Text>
              }
              leftSection={<MessageSquare size={15} strokeWidth={1.75} />}
              active={active}
              onClick={() => {
                if (!active) {
                  onSelect(item.id);
                }
              }}
              onContextMenu={(event) => {
                event.preventDefault();
                setMenu({ id: item.id, x: event.clientX, y: event.clientY });
              }}
              color="paGreen"
              variant="light"
              styles={{
                root: {
                  borderRadius: 'var(--pa-radius-md)',
                  fontWeight: 500,
                  cursor: active ? 'default' : 'pointer',
                },
                body: {
                  overflow: 'hidden',
                },
                label: {
                  overflow: 'hidden',
                },
              }}
            />
          );
        })}
      </Stack>

      <Menu
        opened={Boolean(menu)}
        onChange={(opened) => {
          if (!opened) {
            setMenu(null);
          }
        }}
        withinPortal
        position="bottom-start"
        offset={4}
        shadow="md"
        radius="md"
      >
        <Menu.Target>
          <div
            style={{
              position: 'fixed',
              left: menu?.x ?? 0,
              top: menu?.y ?? 0,
              width: 1,
              height: 1,
              pointerEvents: 'none',
            }}
          />
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Item
            color="red"
            leftSection={<Trash2 size={14} strokeWidth={1.75} />}
            onClick={() => {
              if (menu) {
                onDelete(menu.id);
              }
              setMenu(null);
            }}
          >
            Usuń
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </>
  );
}
