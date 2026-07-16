import { Alert, Button, Group } from '@mantine/core';

import { VOICE_CONTROL_LABEL } from '../../lib/voice/voiceCopy';

interface CopilotPageAlertsProps {
  backendUnavailable: boolean;
  voiceError: string | null;
  onDismissVoiceError?: () => void;
}

export function CopilotPageAlerts({
  backendUnavailable,
  voiceError,
  onDismissVoiceError,
}: CopilotPageAlertsProps) {
  return (
    <>
      {backendUnavailable ? (
        <Alert color="red" title="Usługa niedostępna">
          Nie można połączyć się z API. Uruchom backend i odśwież stronę.
        </Alert>
      ) : null}

      {voiceError ? (
        <Alert
          color="yellow"
          title={VOICE_CONTROL_LABEL}
          withCloseButton={Boolean(onDismissVoiceError)}
          onClose={onDismissVoiceError}
        >
          <Group justify="space-between" align="center" wrap="nowrap">
            <span>{voiceError}</span>
            {onDismissVoiceError ? (
              <Button size="compact-xs" variant="light" color="gray" onClick={onDismissVoiceError}>
                Spróbuj ponownie
              </Button>
            ) : null}
          </Group>
        </Alert>
      ) : null}
    </>
  );
}
