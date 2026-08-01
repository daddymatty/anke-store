# Адмінка ANKE — інструкція

Адмінка працює на Medusa: **http://localhost:9000/app** (у продакшні — домен бекенда).
Dev-доступ: `admin@anke-store.example` / `anke-dev-2026` (змінити перед запуском!).

## Що де робиться

| Задача | Де в адмінці |
|---|---|
| Товари, фото, описи | Products → Create/Edit. Handle товару = slug URL. Колір — окремий товар; спільна модель зв'язується через metadata `colorGroupId` |
| Залишки по розмірах | Products → варіант → Inventory (склад «Шоурум Київ») |
| Ціни / знижки | Products → варіант → Prices (UAH). Стара ціна для SALE — metadata `compareAtPrice` (копійки) |
| Замовлення | Orders — сюди дзеркаляться замовлення сторфронта (метадані: номер ANKE, доставка, оплата) |
| Промокоди | Promotions (модуль Medusa). Демо-коди сторфронта живуть у `lib/promo.ts` — ANKE10, WELCOME15, FREESHIP, GIFT-500/1000/2000 |
| **Модерація відгуків** | Бічне меню → **«Контент ANKE»** → Схвалити / Відхилити / Видалити |
| **Банери головної** | Там само, секція «Банери» (створення — POST /admin/anke/entries, type `banner`) |
| Категорії + SEO-текст | Products → Categories; SEO-текст лістинга — metadata `seoText` |
| Ролі / користувачі | Settings → Users → Invite user |

## SEO-поля будь-якого товару/категорії

У розділі **Metadata** товару або категорії додай ключі — сторфронт підхопить їх
замість шаблонних значень (ISR оновиться до 5–10 хв або миттєво через revalidate):

| Ключ | Що робить |
|---|---|
| `seoTitle` | Заміна title (до 60 симв.) |
| `seoDescription` | Заміна description (до 155 симв.) |
| `ogImage` | URL кастомної OG-картинки |
| `canonical` | Кастомний canonical URL |
| `noindex` | `true` → сторінка noindex,follow |
| `seoText` | (категорії) SEO-текст під лістингом |

## Відгуки — як це працює

1. Покупець залишає відгук на картці товару → він створюється зі статусом `pending`
   (POST `/store/anke/reviews`).
2. В адмінці «Контент ANKE» відгук схвалюється → з'являється на сайті
   і в розмітці AggregateRating (до 5 хв ISR).

## Оновлення сайту після змін

Сторінки оновлюються самі (ISR: товари 5 хв, категорії 10 хв). Миттєво:

```
curl -X POST "https://<домен-сайту>/api/revalidate?secret=<REVALIDATE_SECRET>&tag=products"
```

Теги: `products`, `categories`, `regions`.

## Технічне

- Модуль контенту: `medusa/apps/backend/src/modules/anke-content` (модель `anke_content_entry`).
- API: `GET/POST /store/anke/reviews`, `GET /store/anke/content?type=banner`,
  `GET/POST /admin/anke/entries`, `POST/DELETE /admin/anke/entries/:id`.
- Адмін-сторінка: `src/admin/routes/anke-content/page.tsx`.
- Міграції: `npx medusa db:migrate` (запускається і в Docker-образі).
