import { expect, test } from '@playwright/test';

import {
  askViaChip,
  askViaComposer,
  resetClientState,
  sidebarNav,
  STARTER_LOW_MARGIN,
  STARTER_NEGATIVE_PROFIT,
  waitForAnalysisCta,
} from './helpers';

test.describe('conversation edge flows', () => {
  test.beforeEach(async ({ page }) => {
    await resetClientState(page);
  });

  test('second starter chip also yields a single analysis CTA', async ({ page }) => {
    await askViaChip(page, STARTER_LOW_MARGIN);
    await expect(page.getByRole('button', { name: /Zobacz analizę/ })).toHaveCount(1);
    await expect(page.getByRole('button', { name: /Przeglądaj/ })).toHaveCount(0);
  });

  test('typed composer question matching a starter chip works', async ({ page }) => {
    await askViaComposer(page, STARTER_NEGATIVE_PROFIT);
    await expect(page).toHaveURL(/\/copilot\/c\/c_/);
  });

  test('history roundtrip keeps the analysis CTA after leaving and returning', async ({ page }) => {
    await askViaChip(page, STARTER_NEGATIVE_PROFIT);
    await expect(page).toHaveURL(/\/copilot\/c\/c_/);
    const conversationPath = new URL(page.url()).pathname;

    await expect(page.getByText('Historia')).toBeVisible();
    // Prefer a single history entry for this question when possible.
    await expect(page.locator('.copilot-history-section .mantine-NavLink-root').first()).toBeVisible();

    await sidebarNav(page, 'Produkty').click();
    await expect(page.getByRole('heading', { name: 'Produkty' })).toBeVisible();

    await page.locator('.copilot-history-section .mantine-NavLink-root').first().click();
    await expect(page).toHaveURL(new RegExp(`${conversationPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`));
    await waitForAnalysisCta(page);
  });

  test('Copilot nav starts a fresh draft after a conversation', async ({ page }) => {
    await askViaChip(page, STARTER_NEGATIVE_PROFIT);
    await expect(page).toHaveURL(/\/copilot\/c\/c_/);

    await sidebarNav(page, 'Copilot').click();
    await expect(page).toHaveURL(/\/copilot$/);
    await expect(page.getByRole('button', { name: STARTER_NEGATIVE_PROFIT })).toBeVisible();
    await expect(page.getByRole('button', { name: /Zobacz analizę/ })).toHaveCount(0);
  });

  test('deleting the active conversation from Historia returns to draft', async ({ page }) => {
    await askViaChip(page, STARTER_LOW_MARGIN);
    await expect(page.getByText('Historia')).toBeVisible();
    await expect(page.locator('.copilot-history-section .mantine-NavLink-root')).toHaveCount(1);

    await page.locator('.copilot-history-section .mantine-NavLink-root').click({ button: 'right' });
    await page.getByRole('menuitem', { name: 'Usuń' }).click();

    await expect(page).toHaveURL(/\/copilot$/);
    await expect(page.getByText('Historia')).toHaveCount(0);
    await expect(page.getByRole('button', { name: STARTER_LOW_MARGIN })).toBeVisible();
  });

  test('chat network failure shows Ponów and recovers after retry', async ({ page }) => {
    let failOnce = true;
    await page.route('**/api/chat', async (route) => {
      if (failOnce) {
        failOnce = false;
        await route.abort('failed');
        return;
      }
      await route.continue();
    });

    await page.getByRole('button', { name: STARTER_NEGATIVE_PROFIT }).click();
    await expect(page.getByText('Analiza niedostępna')).toBeVisible({ timeout: 15_000 });
    await page.getByRole('button', { name: 'Ponów' }).click();
    await waitForAnalysisCta(page);
  });
});
