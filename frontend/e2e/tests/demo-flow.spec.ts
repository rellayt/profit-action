import { expect, test } from '@playwright/test';

import { resetClientState, sidebarNav } from './helpers';

test.beforeEach(async ({ page }) => {
  await resetClientState(page);
});

test('demo flow opens analysis modal from single CTA', async ({ page }) => {
  await page.getByRole('button', { name: 'Które produkty mają ujemny zysk?' }).click();

  await expect(page.getByRole('button', { name: /Zobacz analizę/ })).toBeVisible({
    timeout: 30_000,
  });
  await expect(page.getByRole('button', { name: /Przeglądaj/ })).toHaveCount(0);

  await page.getByRole('button', { name: /Zobacz analizę/ }).click();
  await expect(page.getByRole('heading', { name: 'Przegląd analizy' })).toBeVisible();
  await page.keyboard.press('Escape');
});

test('products page has no segment tabs', async ({ page }) => {
  await sidebarNav(page, 'Produkty').click();
  await expect(page.getByRole('heading', { name: 'Produkty' })).toBeVisible();
  // Segment labels appear as row badges; assert there are no filter tabs.
  await expect(page.getByRole('tab')).toHaveCount(0);
});
