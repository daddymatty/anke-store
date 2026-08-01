import { expect, test } from "@playwright/test";

/** Наскрізний сценарій: каталог → картка → кошик → checkout → «Дякуємо». */
test("повний шлях покупки (накладений платіж + промокод)", async ({ page, isMobile }) => {
  // Каталог
  await page.goto("/odyah/sukni");
  await expect(page.getByRole("heading", { level: 1, name: "Сукні" })).toBeVisible();

  // Картка товару
  await page.goto("/product/suknia-midi-lliana-solomiia-molochnyi");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Соломія");

  // Розмір S (точний матч, бо XS теж містить "S") → в кошик
  await page.getByRole("radio", { name: "S", exact: true }).click();
  await page.getByRole("button", { name: "Додати в кошик" }).first().click();

  // Drawer кошика відкрився
  await expect(page.getByRole("dialog", { name: "Кошик" })).toBeVisible();
  await page.getByRole("link", { name: "Оформити замовлення" }).click();
  await page.waitForURL("**/checkout");

  // Checkout
  await page.fill("#co-name", "Тест Плейрайт Іванівна");
  await page.fill("#co-phone", "0671112233");
  await page.fill("#co-email", "e2e@example.com");
  await page.fill("#co-city", "Киї");
  await page.getByRole("button", { name: /Київ/ }).first().click();
  await page.selectOption("#co-wh", { index: 1 });
  await page.getByText("Накладений платіж").click();

  // Промокод
  await page.getByLabel("Промокод").fill("ANKE10");
  await page.getByRole("button", { name: "OK", exact: true }).click();
  await expect(page.getByText("Знижка 10%")).toBeVisible();

  // Сабміт → «Дякуємо»
  await page.getByRole("button", { name: "Підтвердити замовлення" }).click();
  await page.waitForURL("**/dyakuyemo/**", { timeout: 20_000 });
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Дякуємо");
  await expect(page.getByText(/ANKE-[A-Z0-9]+/).first()).toBeVisible();
  test.skip(isMobile, "мобільний варіант перевіряє ті самі кроки");
});

test("вішліст: сердечко зберігає товар для гостя", async ({ page, isMobile }) => {
  test.skip(isMobile, "сердечко на hover — desktop-сценарій");
  await page.goto("/odyah/sukni");
  await page.getByRole("button", { name: "Додати у вішліст" }).first().click();
  await page.goto("/vishlist");
  await expect(page.getByRole("heading", { level: 1, name: "Вішліст" })).toBeVisible();
  await expect(page.locator("ul li a[href^='/product/']").first()).toBeVisible();
});

test("пошук: підказки і сторінка результатів", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Пошук" }).click();
  await page.getByLabel("Пошук по каталогу").fill("льон");
  await page.keyboard.press("Enter");
  await page.waitForURL("**/poshuk**");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("льон");
});
