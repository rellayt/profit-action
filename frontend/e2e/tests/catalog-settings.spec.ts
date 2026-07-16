import { expect, test } from '@playwright/test';

import { resetClientState, sidebarNav } from './helpers';

const VOICE_CONTROL_LABEL = 'Wejście głosowe';

test.describe('catalog and settings', () => {
  test.beforeEach(async ({ page }) => {
    await resetClientState(page);
  });

  test('products search opens evidence drawer for a row', async ({ page }) => {
    await sidebarNav(page, 'Produkty').click();
    await expect(page.getByRole('heading', { name: 'Produkty' })).toBeVisible();
    await expect(page.locator('table tbody tr').first()).toBeVisible({ timeout: 15_000 });

    const search = page.getByPlaceholder('Szukaj po nazwie, SKU lub ID');
    await search.fill('SKU-8841');
    await expect(page.getByText('Słuchawki bezprzewodowe Pro X')).toBeVisible();

    await page.locator('table tbody tr').first().click();
    await expect(page.getByText('Dowody produktu')).toBeVisible();
  });

  test('settings shows API readiness and toggles voice preference', async ({ page }) => {
    await sidebarNav(page, 'Ustawienia').click();
    await expect(page.getByRole('heading', { name: 'Ustawienia' })).toBeVisible();
    await expect(page.getByText('API gotowe')).toBeVisible({ timeout: 15_000 });

    const voiceSwitch = page.getByRole('switch', { name: VOICE_CONTROL_LABEL });
    await expect(voiceSwitch).toBeAttached();
    const wasChecked = await voiceSwitch.isChecked();
    await page.locator('.mantine-Switch-track').click();
    await expect(voiceSwitch).toBeChecked({ checked: !wasChecked });

    await sidebarNav(page, 'Copilot').click();
    await sidebarNav(page, 'Ustawienia').click();
    await expect(voiceSwitch).toBeChecked({ checked: !wasChecked });
  });
});
