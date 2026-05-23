import { test } from '@playwright/test';

test('Исследование DOM', async ({ page }) => {
  // Открываем страницу
  await page.goto('http://localhost:4000');
  await page.waitForTimeout(5000);
  
  // Ищем все возможные элементы ингредиентов
  const allDivs = await page.locator('div').all();
  console.log('Всего div на странице:', allDivs.length);
  
  // Ищем элементы с классом, содержащим "ingredient"
  const ingredientDivs = await page.locator('[class*="ingredient"]').all();
  console.log('Элементы с классом содержащим "ingredient":', ingredientDivs.length);
  
  for (let i = 0; i < Math.min(ingredientDivs.length, 3); i++) {
    const className = await ingredientDivs[i].getAttribute('class');
    const text = await ingredientDivs[i].locator('h3').textContent();
    console.log(`Ингредиент ${i + 1}: class="${className}", текст="${text}"`);
  }
  
  // Ищем конструктор
  const constructorDivs = await page.locator('[class*="constructor"]').all();
  console.log('\nЭлементы с классом содержащим "constructor":', constructorDivs.length);
  for (let i = 0; i < Math.min(constructorDivs.length, 3); i++) {
    const className = await constructorDivs[i].getAttribute('class');
    console.log(`Конструктор ${i + 1}: class="${className}"`);
  }
  
  // Ищем модальное окно
  const modalDivs = await page.locator('[class*="Modal"]').all();
  console.log('\nЭлементы с классом содержащим "Modal":', modalDivs.length);
  for (let i = 0; i < Math.min(modalDivs.length, 3); i++) {
    const className = await modalDivs[i].getAttribute('class');
    console.log(`Модалка ${i + 1}: class="${className}"`);
  }
});
