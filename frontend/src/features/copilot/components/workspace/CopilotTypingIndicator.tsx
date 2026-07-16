import { Group } from '@mantine/core';

export function CopilotTypingIndicator() {
  return (
    <Group gap={8} role="status" aria-live="polite" aria-label="Copilot pisze" className="copilot-typing-indicator">
      <span className="copilot-typing-dot" />
      <span className="copilot-typing-dot" />
      <span className="copilot-typing-dot" />
    </Group>
  );
}
