import { expect, type Page } from '@playwright/test';

import { STARTER_QUERY_CHIPS } from '../../src/features/copilot/lib/chat/copilotConstants';
import { PA_STORAGE_KEYS } from '../../src/features/copilot/lib/storage/localStorageKeys';

export const STARTER_NEGATIVE_PROFIT = STARTER_QUERY_CHIPS[0];
export const STARTER_LOW_MARGIN = STARTER_QUERY_CHIPS[1];

/**
 * Wipe client cache and in-memory backend conversations so Historia cannot
 * repopulate from GET /api/conversations after a bare localStorage.clear().
 * Re-marks intro as seen so the welcome modal does not block clicks.
 */
export async function resetClientState(page: Page) {
  await page.goto('/copilot');
  await page.evaluate(async (introSeenKey) => {
    try {
      const list = (await fetch('/api/conversations').then((response) => response.json())) as Array<{
        id: string;
      }>;
      await Promise.all(
        list.map((item) => fetch(`/api/conversations/${item.id}`, { method: 'DELETE' })),
      );
    } catch {
      // Backend may be briefly unavailable during webServer boot.
    }
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem(introSeenKey, 'true');
  }, PA_STORAGE_KEYS.introSeen);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Zapytaj o dane produktów' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Zaczynam' })).toHaveCount(0);
  await expect(page.getByText('Historia')).toHaveCount(0);
}

export async function waitForAnalysisCta(page: Page) {
  await expect(page.getByRole('button', { name: /Zobacz analizę/ })).toBeVisible({
    timeout: 30_000,
  });
}

async function waitForAssistantUpsert(page: Page) {
  await page.waitForResponse(async (response) => {
    if (
      !response.url().includes('/api/conversations/') ||
      response.request().method() !== 'PUT' ||
      !response.ok()
    ) {
      return false;
    }
    try {
      const body = response.request().postDataJSON() as {
        messages?: Array<{ role: string }>;
        analysesById?: Record<string, unknown>;
      };
      const hasAssistant = Boolean(body.messages?.some((message) => message.role === 'assistant'));
      const hasAnalysis = Boolean(body.analysesById && Object.keys(body.analysesById).length > 0);
      return hasAssistant && hasAnalysis;
    } catch {
      return false;
    }
  });
}

export async function askViaChip(page: Page, chipLabel: string) {
  const upsert = waitForAssistantUpsert(page);
  await page.getByRole('button', { name: chipLabel }).click();
  await waitForAnalysisCta(page);
  await upsert;
}

export async function askViaComposer(page: Page, question: string) {
  const upsert = waitForAssistantUpsert(page);
  await page.getByPlaceholder(/Zapytaj o przepalony budżet/i).fill(question);
  await page.getByRole('button', { name: 'Wyślij wiadomość' }).click();
  await waitForAnalysisCta(page);
  await upsert;
}

export function sidebarNav(page: Page, label: string) {
  return page.getByRole('navigation').getByText(label, { exact: true });
}
