import { test } from '@playwright/test';

test('Запись HAR для булки', async ({ page }) => {
  await page.routeFromHAR('./tests/hars/bun.har', { update: true, updateContent: 'embed' });
  
  await page.goto('http://localhost:4000');
  await page.waitForSelector('button:has-text("Добавить")');
  await page.locator('button:has-text("Добавить")').first().click();
});
