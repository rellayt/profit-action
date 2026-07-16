import {
  AppShell,
  Box,
  Divider,
  Group,
  NavLink,
  ScrollArea,
  Stack,
  UnstyledButton,
} from '@mantine/core';
import { Bot, Package, Settings } from 'lucide-react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import { IntroModal } from '../components/intro/IntroModal';
import { BrandMark } from '../components/ui/BrandMark';
import { ConversationNavProvider } from '../session/ConversationNavProvider';
import { IntroModalProvider } from '../session/IntroModalProvider';
import { useConversationNav } from '../session/useConversationNav';
import { SidebarHistory } from './SidebarHistory';

const APP_NAV = [
  { to: '/copilot', label: 'Copilot', icon: Bot },
  { to: '/products', label: 'Produkty', icon: Package },
  { to: '/settings', label: 'Ustawienia', icon: Settings },
] as const;

function AppShellLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const nav = useConversationNav();
  const showHistory = nav.conversations.length > 0;
  const isConversationRoute = location.pathname.startsWith('/copilot/c/');

  return (
    <AppShell
      navbar={{
        width: 248,
        breakpoint: 'md',
      }}
      padding="xl"
      styles={{
        main: {
          background: 'transparent',
          minHeight: '100vh',
        },
        navbar: {
          background: 'rgb(var(--pa-bg-surface))',
          borderRight: '1px solid rgb(var(--pa-border-neutral) / 0.35)',
        },
      }}
    >
      <AppShell.Navbar p="lg">
        <Stack gap="lg" h="100%">
          <UnstyledButton onClick={() => nav.startNewConversation()} aria-label="Profit Action">
            <Group gap="sm" wrap="nowrap" align="center">
              <BrandMark size={32} radius={8} />
              <Box
                component="span"
                fw={600}
                fz={14}
                style={{ letterSpacing: '0.01em', color: 'rgb(var(--pa-text-primary))' }}
              >
                Profit{' '}
                <Box component="span" style={{ color: 'rgb(var(--pa-green-bright))' }}>
                  Action
                </Box>
              </Box>
            </Group>
          </UnstyledButton>

          <ScrollArea flex={1} offsetScrollbars>
            <Stack gap={0}>
              <Stack gap={4}>
                {APP_NAV.map(({ to, label, icon: Icon }) => {
                  const isCopilot = to === '/copilot';
                  const active = isCopilot
                    ? nav.isDraftRoute
                    : location.pathname === to || location.pathname.startsWith(`${to}/`);
                  return (
                    <NavLink
                      key={to}
                      label={label}
                      leftSection={<Icon size={18} strokeWidth={1.75} />}
                      active={active}
                      onClick={() => {
                        if (isCopilot) {
                          nav.startNewConversation();
                          return;
                        }
                        if (active) {
                          return;
                        }
                        navigate(to);
                      }}
                      color="paGreen"
                      variant="light"
                      styles={{
                        root: {
                          borderRadius: 'var(--pa-radius-md)',
                          fontWeight: 500,
                          pointerEvents: !isCopilot && active ? 'none' : undefined,
                          cursor: !isCopilot && active ? 'default' : 'pointer',
                        },
                      }}
                    />
                  );
                })}
              </Stack>

              {showHistory ? (
                <>
                  <Divider my="xl" color="rgb(var(--pa-border-neutral) / 0.4)" />
                  <SidebarHistory
                    conversations={nav.conversations}
                    activeConversationId={isConversationRoute ? nav.activeConversationId : null}
                    onSelect={nav.openConversation}
                    onDelete={(id) => void nav.deleteConversation(id)}
                  />
                </>
              ) : null}
            </Stack>
          </ScrollArea>
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main>
        <Box maw={1440} mx="auto" w="100%">
          <Outlet />
        </Box>
      </AppShell.Main>

      <IntroModal />
    </AppShell>
  );
}

export function AppLayout() {
  return (
    <ConversationNavProvider>
      <IntroModalProvider>
        <AppShellLayout />
      </IntroModalProvider>
    </ConversationNavProvider>
  );
}
