import { Box, Button, Group, Modal, Paper, Stack, Text, ThemeIcon } from '@mantine/core';
import { Bot, LineChart, Package, type LucideIcon } from 'lucide-react';

import { paSurfaceStyle } from '../../../../design/surface';
import { STARTER_QUERY_CHIPS } from '../../lib/chat/copilotConstants';
import { BrandMark } from '../ui/BrandMark';

const INTRO_TITLE_ID = 'pa-intro-title';
const INTRO_DESC_ID = 'pa-intro-desc';

const INTRO_FACTS: ReadonlyArray<{
  icon: LucideIcon;
  label: string;
  description: string;
}> = [
  {
    icon: Bot,
    label: 'Copilot produktowy',
    description: 'Pytania tekstem lub głosem. Rekomendacje stop / ratunek / skala.',
  },
  {
    icon: Package,
    label: '100 produktów demo',
    description: 'Syntetyczny katalog na serwerze. Bez podpiętych API reklam.',
  },
  {
    icon: LineChart,
    label: 'Jak to działa',
    description: 'Pytanie → analiza (Live AI lub demo) → liczby → wykres i katalog.',
  },
];

interface IntroModalViewProps {
  opened: boolean;
  onClose: () => void;
}

export function IntroModalView({ opened, onClose }: IntroModalViewProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={null}
      withCloseButton
      size={520}
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
      aria-labelledby={INTRO_TITLE_ID}
      aria-describedby={INTRO_DESC_ID}
      styles={{
        content: {
          background: 'rgb(var(--pa-bg-surface))',
        },
        header: {
          alignItems: 'center',
          justifyContent: 'flex-end',
          minHeight: 52,
          paddingTop: 'var(--mantine-spacing-md)',
          paddingBottom: 'var(--mantine-spacing-md)',
        },
        close: {
          marginInlineStart: 0,
        },
        body: {
          paddingTop: 'var(--mantine-spacing-md)',
        },
      }}
    >
      <Stack gap="lg" className="copilot-soft-reveal" pb="xs">
        <Stack align="center" gap="sm">
          <BrandMark size={48} radius={12} />
          <Box
            id={INTRO_TITLE_ID}
            component="h2"
            fw={600}
            fz="lg"
            ta="center"
            m={0}
            style={{ letterSpacing: '0.01em', color: 'rgb(var(--pa-text-primary))' }}
          >
            Profit{' '}
            <Box component="span" style={{ color: 'rgb(var(--pa-green-bright))' }}>
              Action
            </Box>
          </Box>
          <Text
            id={INTRO_DESC_ID}
            size="sm"
            c="dimmed"
            ta="center"
            maw={400}
            lh={1.55}
          >
            Zapytaj o dane produktowe. Dostaniesz krótką odpowiedź z liczbami, które sprawdzisz na
            wykresie i w katalogu.
          </Text>
        </Stack>

        <Stack gap="md">
          {INTRO_FACTS.map(({ icon: Icon, label, description }) => (
            <Group key={label} align="flex-start" gap="sm" wrap="nowrap">
              <ThemeIcon variant="light" color="paGreen" size="md" radius="md">
                <Icon size={16} strokeWidth={1.75} />
              </ThemeIcon>
              <Stack gap={2} style={{ minWidth: 0 }}>
                <Text fw={600} size="sm">
                  {label}
                </Text>
                <Text size="sm" c="dimmed" lh={1.45}>
                  {description}
                </Text>
              </Stack>
            </Group>
          ))}
        </Stack>

        <Stack gap="sm">
          <Text size="xs" c="paGreen" tt="uppercase" fw={700} lts={0.6}>
            Przykładowe pytania
          </Text>
          <Paper p="md" radius="md" style={paSurfaceStyle()}>
            <Group gap="sm" wrap="wrap" role="group" aria-label="Przykładowe pytania">
              {STARTER_QUERY_CHIPS.map((chip) => (
                <Button
                  key={chip}
                  component="span"
                  size="compact-sm"
                  variant="light"
                  color="gray"
                  style={{ cursor: 'default', pointerEvents: 'none' }}
                >
                  {chip}
                </Button>
              ))}
            </Group>
          </Paper>
        </Stack>

        <Group justify="end">
          <Button size="sm" variant="light" color="paGreen" onClick={onClose}>
            Zaczynam
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
