import { defineConfig, devices } from "@playwright/test";

/**
 * E2E: повний сценарій «каталог → картка → кошик → checkout → дякуємо».
 * Локально/CI: збірка вже має існувати (npm run build) — webServer стартує production-сервер.
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: "http://127.0.0.1:3799",
    trace: "retain-on-failure",
    // Пін на передвстановлений Chromium (див. README): без завантаження браузерів
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_PATH
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH }
      : undefined,
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: "npm run start -- -p 3799",
    url: "http://127.0.0.1:3799",
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
