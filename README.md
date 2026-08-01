# ANKE — інтернет-магазин жіночого одягу

Продакшн-готовий e-commerce для українського ринку: **Next.js 16** (App Router, RSC, Server Actions) + **Medusa v2** (PostgreSQL) як адмінка і джерело правди каталогу.

Пріоритети, вшиті в архітектуру: **SEO** (SSR/ISR, повний Schema.org, sitemap-індекс, правила фасетів), **PPC** (GA4 e-commerce, Consent Mode v2, Meta CAPI, фіди Merchant/PMax/Facebook), **Performance** (Lighthouse mobile: Perf 93 / SEO 100 / A11y 100, JS першого рендера 173 KB gzip, CLS 0).

## Швидкий старт (без інфраструктури)

```bash
npm install
npm run dev            # http://localhost:3000
```

Без змінних Medusa сторфронт працює на демо-каталозі (41 товар, `lib/catalog/seed.ts`) — весь функціонал доступний, включно з checkout у sandbox-режимі.

## Повний стенд (Medusa + PostgreSQL)

```bash
# 1. База
docker compose up -d postgres

# 2. Бекенд (перший запуск)
cd medusa && npm install --legacy-peer-deps && cd apps/backend
cp .env.template .env            # + DATABASE_URL=postgres://medusa@localhost:5432/anke_medusa
npx medusa db:migrate
npx medusa exec ./src/scripts/seed-anke.ts          # каталог ANKE
npx medusa exec ./src/scripts/seed-anke-shipping.ts # доставка UA
npx medusa user -e admin@example.com -p <пароль>
npx medusa develop               # адмінка: http://localhost:9000/app

# 3. Сторфронт на Medusa
# .env.local: MEDUSA_BACKEND_URL=http://localhost:9000
#             MEDUSA_PUBLISHABLE_KEY=pk_... (Settings → Publishable API Keys)
npm run dev
```

## Змінні оточення

Повний перелік з коментарями — `.env.example`. Ключове:

| Змінна | Навіщо |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Фінальний домен. Поки містить `example` — **весь сайт noindex** (запобіжник) |
| `MEDUSA_BACKEND_URL` + `MEDUSA_PUBLISHABLE_KEY` | Перемикає каталог з демо-сіда на Medusa |
| `NOVA_POSHTA_API_KEY` | Реальні міста/відділення/трекінг (без ключа — dev-фолбек) |
| `MONO_ACQUIRING_TOKEN` | Реальний еквайринг (без токена — sandbox-оплата) |
| `CHECKBOX_LICENSE_KEY`/`PIN` | Фіскалізація чеків |
| `NEXT_PUBLIC_GTM_ID` | Вмикає GTM (події dataLayer шлються завжди) |

## Як додати товар

Адмінка Medusa → Products → Create. Handle = slug URL (транслітерація за КМУ №55 — `lib/translit.ts`). Кожен колір — окремий товар (окремий URL для індексації), зв'язок моделей — metadata `colorGroupId`. Обов'язкові metadata: `colorName`, `colorHex`, `material`, `materialFull`, `care` (масив), `isNew`; опційно `compareAtPrice` (копійки, вмикає SALE). SEO-поля і модерація відгуків — див. **docs/admin.md**.

## Як підключити маркетинг

1. **GTM**: постав `NEXT_PUBLIC_GTM_ID`. dataLayer вже шле всі GA4 e-commerce події (`view_item_list`, `add_to_cart`, `purchase` з `transaction_id` тощо) + мікроконверсії (`micro_conversion`). Consent Mode v2 з дефолтом denied вже ініціалізується до GTM.
2. **Merchant Center**: фід `https://<домен>/feeds/google-merchant.xml` (оновлення щогодини). Для Performance Max — `/feeds/performance-max.xml` (custom labels: маржа/сезон/sale).
3. **Meta**: каталог — `/feeds/facebook-catalog.xml`; Pixel через GTM; server-side Purchase вже шлеться через CAPI (`META_PIXEL_ID` + `META_CAPI_ACCESS_TOKEN`), дедуплікація по `event_id` = номер замовлення.
4. **Enhanced Conversions**: хешовані email/телефон пушаться в dataLayer на сторінці «Дякуємо» (`purchase_meta.user_data`).
5. UTM/gclid/fbclid/ttclid зберігаються в cookie 90 днів і потрапляють у кожне замовлення (`attribution`).

## Тести й аудити

```bash
npm test          # Vitest: транслітерація, гроші, промокоди (15 тестів)
npm run test:e2e  # Playwright: каталог → картка → кошик → checkout → «Дякуємо»
                  # (локально: PLAYWRIGHT_CHROMIUM_PATH=<шлях до chrome> якщо браузери не завантажені)
npm run check:seo # кожна сторінка: title/description/canonical/JSON-LD/один h1 + биті посилання
npm run build && npm run lint && npm run typecheck
```

## Деплой

**Vercel (фронт) + VPS (Medusa)** — рекомендовано:
- Vercel: імпорт репозиторію, змінні з `.env.example`, домен → `NEXT_PUBLIC_SITE_URL`.
- VPS: `docker compose up -d postgres medusa` (див. `docker-compose.yml`), домен бекенда → `MEDUSA_BACKEND_URL`.

**Все на VPS**: `docker compose up -d` (postgres + medusa + storefront, `Dockerfile.storefront`).

Після зміни контенту в адмінці ISR оновиться сам (5–10 хв) або миттєво: `POST /api/revalidate?secret=<REVALIDATE_SECRET>&tag=products`.

## Структура

```
app/            маршрути (каталог, картка, checkout, кабінет, блог, юридичні)
components/     ui/ (власні компоненти), shop/, layout/, motion/, analytics/, seo/
lib/            catalog/ (провайдери Local+Medusa), orders/, integrations/ (НП, Mono,
                Checkbox, email, Telegram, Meta CAPI), seo/, motion.ts, analytics.ts
content/        блог, юридичні тексти
medusa/         бекенд Medusa v2 + модуль anke-content (відгуки/банери) + сідери
brand/          логотипи (SVG-контури), фавікони, OG; правила — docs/brand.md
docs/           brand.md, admin.md
e2e/, lib/__tests__/, tools/ (gen-logo, export-seed, check-seo)
```

## Перед запуском у продакшн

- [ ] Реальний домен у `NEXT_PUBLIC_SITE_URL` (знімає noindex) + Search Console
- [ ] Реквізити ФОП/ТОВ і контакти в `lib/site.ts`, фінальні юртексти (`content/legal.tsx`)
- [ ] Ключі: НП, Mono (+вебхук `/api/webhooks/mono`), Checkbox, SMTP, Telegram
- [ ] `SESSION_SECRET`, `REVALIDATE_SECRET`, паролі адмінки/БД
- [ ] Реальні фото товарів замість `/public/demo/*.jpg`
- [ ] GTM-контейнер: GA4, Ads Conversion + Remarketing, Meta Pixel (TikTok/Pinterest — опційно)
