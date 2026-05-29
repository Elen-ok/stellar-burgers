import { test } from '@playwright/test';

test('Запись HAR для начинки', async ({ page }) => {
  await page.routeFromHAR('./tests/hars/ingredient.har', { update: true, updateContent: 'embed' });
  
  await page.goto('http://localhost:4000');
  await page.waitForSelector('button:has-text("Добавить")');
  await page.locator('li').filter({ hasText: '424' }).first()
    .locator('button:has-text("Добавить")').click();
});
