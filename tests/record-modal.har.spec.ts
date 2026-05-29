import { test } from '@playwright/test';

test('Запись HAR для страницы ингредиента', async ({ page }) => {
  await page.routeFromHAR('./tests/hars/modal.har', { update: true, updateContent: 'embed' });
  
  await page.goto('http://localhost:4000');
  await page.waitForSelector('button:has-text("Добавить")');
  await page.locator('img').first().click();
  await page.waitForTimeout(1000);
  await page.goBack();
});
