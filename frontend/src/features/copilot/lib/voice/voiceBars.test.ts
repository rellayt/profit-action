import { describe, expect, it } from 'vitest';

import {
  IDLE_LEVEL,
  SILENCE_THRESHOLD,
  amplitudeFromRms,
  createIdleBars,
  resizeBars,
} from './voiceBars';

describe('voiceBars', () => {
  it('creates idle bars of requested length', () => {
    expect(createIdleBars(3)).toEqual([IDLE_LEVEL, IDLE_LEVEL, IDLE_LEVEL]);
  });

  it('maps silence to idle level', () => {
    expect(amplitudeFromRms(SILENCE_THRESHOLD - 0.001)).toBe(IDLE_LEVEL);
  });

  it('raises amplitude above silence threshold', () => {
    expect(amplitudeFromRms(0.08)).toBeGreaterThan(IDLE_LEVEL);
    expect(amplitudeFromRms(0.08)).toBeLessThanOrEqual(1);
  });

  it('resizes bars without losing trailing samples when shrinking', () => {
    expect(resizeBars([0.2, 0.4, 0.6, 0.8], 2)).toEqual([0.6, 0.8]);
  });

  it('pads leading idle samples when growing', () => {
    expect(resizeBars([0.5], 3)).toEqual([IDLE_LEVEL, IDLE_LEVEL, 0.5]);
  });
});
