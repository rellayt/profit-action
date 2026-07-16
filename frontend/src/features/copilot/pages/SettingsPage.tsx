import { Button, Group, Paper, Stack, Switch, Text, Title } from '@mantine/core';

import { paSurfaceStyle } from '../../../design/surface';
import { useHealthQuery } from '../api/health';
import { PageSection } from '../components/ui/PageSection';
import { StatusPill } from '../components/ui/StatusPill';
import { useCopilotSettings } from '../hooks/useCopilotSettings';
import { resolveRuntimeMode } from '../lib/settings/resolveRuntimeMode';
import { VOICE_CONTROL_LABEL } from '../lib/voice/voiceCopy';
import { useIntroModal } from '../session/useIntroModal';

export function SettingsPage() {
  const { settings, setVoiceQueryEnabled } = useCopilotSettings();
  const { openIntro } = useIntroModal();
  const healthQuery = useHealthQuery();
  const health = healthQuery.data;
  const liveAiAvailable = health?.liveAiAvailable ?? false;
  const apiConnected = healthQuery.isSuccess;
  const runtime = resolveRuntimeMode(health);

  return (
    <Stack gap="lg" className="copilot-fade-in">
      <Stack gap={4}>
        <Text size="xs" c="paGreen" tt="uppercase" fw={700} lts={0.6}>
          Preferencje
        </Text>
        <Title order={2}>Ustawienia</Title>
        <Text size="sm" c="dimmed">
          Preferencje workspace i status runtime z health checków backendu.
        </Text>
      </Stack>

      <PageSection title="Tryb runtime">
        <Paper p="md" radius="md" style={paSurfaceStyle()}>
          <Group gap="sm" mb="sm">
            <StatusPill variant={runtime.variant} label={runtime.label} />
            <StatusPill
              variant={apiConnected ? 'neutral' : 'warning'}
              label={apiConnected ? 'API gotowe' : 'Sprawdzanie API…'}
            />
          </Group>
          <Text size="sm" c="dimmed" mb="md">
            {runtime.detail}
          </Text>
          <Stack gap={6}>
            <ReadinessRow
              label="Backend API"
              ready={apiConnected}
              readyText="Gotowe"
              blockedText="Niedostępne"
            />
            <ReadinessRow
              label="DEMO_MODE"
              ready={!health?.demoMode}
              readyText="Wyłączony (ścieżka Live)"
              blockedText="Włączony (ścieżka Demo)"
              unknown={!health}
            />
            <ReadinessRow
              label="OPENAI_API_KEY"
              ready={Boolean(health?.openaiConfigured)}
              readyText="Załadowany z backend/.env"
              blockedText="Brak lub pusty"
              unknown={!health}
            />
            <ReadinessRow
              label="Live AI gotowe"
              ready={liveAiAvailable}
              readyText="Tak — tool calling + model"
              blockedText="Nie — lokalny parser demo"
              unknown={!health}
            />
          </Stack>
        </Paper>
      </PageSection>

      <PageSection title="Interfejs">
        <Stack gap="lg">
          <Group justify="space-between" align="center">
            <Stack gap={2} maw={420}>
              <Text fw={600} size="sm">
                {VOICE_CONTROL_LABEL}
              </Text>
              <Text size="sm" c="dimmed">
                Rozpoznawanie mowy w przeglądarce tworzy lokalnie transcript, a potem analiza idzie tą
                samą ścieżką co pytanie wpisane ręcznie.
              </Text>
            </Stack>
            <Switch
              checked={settings.voiceQueryEnabled}
              onChange={(event) => setVoiceQueryEnabled(event.currentTarget.checked)}
              color="paGreen"
              size="md"
              aria-label={VOICE_CONTROL_LABEL}
            />
          </Group>

          <Group justify="space-between" align="center">
            <Stack gap={2} maw={420}>
              <Text fw={600} size="sm">
                Wprowadzenie
              </Text>
              <Text size="sm" c="dimmed">
                Krótki przegląd możliwości workspace.
              </Text>
            </Stack>
            <Button size="sm" variant="light" color="gray" onClick={openIntro}>
              Pokaż wprowadzenie
            </Button>
          </Group>
        </Stack>
      </PageSection>
    </Stack>
  );
}

function ReadinessRow({
  label,
  ready,
  readyText,
  blockedText,
  unknown,
}: {
  label: string;
  ready: boolean;
  readyText: string;
  blockedText: string;
  unknown?: boolean;
}) {
  return (
    <Group justify="space-between" gap="md">
      <Text size="sm">{label}</Text>
      <Text size="sm" c={unknown ? 'dimmed' : ready ? 'paGreen' : 'dimmed'}>
        {unknown ? '—' : ready ? readyText : blockedText}
      </Text>
    </Group>
  );
}
