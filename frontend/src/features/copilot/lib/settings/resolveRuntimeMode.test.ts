import { describe, expect, it } from 'vitest';

import { resolveRuntimeMode } from './resolveRuntimeMode';

describe('resolveRuntimeMode', () => {
  it('returns loading state when health is missing', () => {
    const mode = resolveRuntimeMode(undefined);
    expect(mode.variant).toBe('neutral');
    expect(mode.label).toBe('Sprawdzanie…');
  });

  it('returns live when liveAiAvailable', () => {
    const mode = resolveRuntimeMode({
      demoMode: false,
      openaiConfigured: true,
      liveAiAvailable: true,
    });
    expect(mode.variant).toBe('live');
    expect(mode.label).toBe('Live AI');
  });

  it('returns incomplete when no key and demoMode false', () => {
    const mode = resolveRuntimeMode({
      demoMode: false,
      openaiConfigured: false,
      liveAiAvailable: false,
    });
    expect(mode.variant).toBe('warning');
    expect(mode.label).toBe('Niekompletna konfiguracja');
  });

  it('returns demo when demoMode true', () => {
    const mode = resolveRuntimeMode({
      demoMode: true,
      openaiConfigured: false,
      liveAiAvailable: false,
    });
    expect(mode.variant).toBe('demo');
    expect(mode.detail).toContain('DEMO_MODE=true');
  });
});
