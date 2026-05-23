import { test } from '@playwright/test';

test('Диагностика логина', async ({ page }) => {
  // НЕ используем моки — работаем с реальным сервером
  console.log('1. Переходим на страницу логина');
  await page.goto('http://localhost:4000/login');
  
  console.log('2. Заполняем форму');
  await page.fill('input[name="email"]', 'tanyazhuk.2002@mail.ru');
  await page.fill('input[name="password"]', 'Tanya21072002');
  
  // Слушаем все запросы
  page.on('request', request => {
    if (request.url().includes('/api/')) {
      console.log(`📤 Запрос: ${request.method()} ${request.url()}`);
    }
  });
  
  page.on('response', response => {
    if (response.url().includes('/api/')) {
      console.log(`📥 Ответ: ${response.status()} ${response.url()}`);
    }
  });
  
  console.log('3. Нажимаем "Войти"');
  await page.click('button:has-text("Войти")');
  
  // Ждём возможной ошибки
  await page.waitForTimeout(3000);
  
  // Проверяем, есть ли сообщение об ошибке
  const errorMessage = page.locator('text=неверный email или пароль, текст ошибки, alert');
  const hasError = await errorMessage.count();
  
  if (hasError > 0) {
    console.log('❌ На сайте появилось сообщение об ошибке:', await errorMessage.textContent());
  } else {
    console.log('✅ Сообщений об ошибке нет, вход вероятно успешен');
  }
  
  // Делаем скриншот
  await page.screenshot({ path: 'tests/login-result.png', fullPage: true });
  console.log('4. Скриншот сохранён в tests/login-result.png');
  
  // Проверяем URL
  console.log('Текущий URL:', page.url());
});
