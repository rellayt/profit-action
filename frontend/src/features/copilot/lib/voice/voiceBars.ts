export const SILENCE_THRESHOLD = 0.015;
export const DEFAULT_BAR_COUNT = 120;
export const IDLE_LEVEL = 0.12;

export function createIdleBars(count: number): number[] {
  return Array.from({ length: count }, () => IDLE_LEVEL);
}

export function amplitudeFromRms(rms: number): number {
  if (rms < SILENCE_THRESHOLD) {
    return IDLE_LEVEL;
  }
  const raised = (rms - SILENCE_THRESHOLD) / 0.12;
  return Math.min(1, 0.18 + raised * 0.72);
}

export function resizeBars(previous: number[], nextCount: number): number[] {
  if (nextCount === previous.length) {
    return previous;
  }
  if (nextCount > previous.length) {
    return [...Array.from({ length: nextCount - previous.length }, () => IDLE_LEVEL), ...previous];
  }
  return previous.slice(previous.length - nextCount);
}
