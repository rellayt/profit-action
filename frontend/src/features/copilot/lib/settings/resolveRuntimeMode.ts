import type { HealthResponse } from '../../api/health';

type RuntimeModeVariant = 'live' | 'demo' | 'neutral' | 'warning';

interface RuntimeMode {
  label: string;
  variant: RuntimeModeVariant;
  detail: string;
}

type HealthFlags = Pick<HealthResponse, 'demoMode' | 'openaiConfigured' | 'liveAiAvailable'>;

export function resolveRuntimeMode(health: HealthFlags | undefined): RuntimeMode {
  if (!health) {
    return {
      label: 'Sprawdzanie…',
      variant: 'neutral',
      detail: 'Oczekiwanie na health check backendu.',
    };
  }

  if (health.liveAiAvailable) {
    return {
      label: 'Live AI',
      variant: 'live',
      detail:
        'OPENAI_API_KEY jest załadowany i DEMO_MODE nie wymusza lokalnej ścieżki. Model planuje analizę przez tool calling.',
    };
  }

  if (!health.demoMode && !health.openaiConfigured) {
    return {
      label: 'Niekompletna konfiguracja',
      variant: 'warning',
      detail: 'Brak OPENAI_API_KEY w backend/.env. Dodaj klucz albo ustaw DEMO_MODE=true.',
    };
  }

  return {
    label: 'Tryb demo',
    variant: 'demo',
    detail: health.demoMode
      ? 'DEMO_MODE=true wymusza lokalne heurystyki nawet przy kluczu OpenAI.'
      : 'Brak klucza OpenAI — lokalny parser demo.',
  };
}
