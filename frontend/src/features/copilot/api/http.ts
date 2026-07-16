import type { z } from 'zod';

import { API_REQUEST_FAILED } from './errorCopy';

export async function fetchJson<S extends z.ZodTypeAny>(
  url: string,
  schema: S,
  init?: RequestInit,
): Promise<z.output<S>> {
  const response = await fetch(url, init);
  if (!response.ok) {
    throw new Error(API_REQUEST_FAILED);
  }
  const raw: unknown = await response.json();
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    console.warn('[api] Zod parse failed', url, parsed.error.flatten());
    throw new Error(API_REQUEST_FAILED);
  }
  return parsed.data;
}
