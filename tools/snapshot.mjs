/**
 * Знімок сайту для GitHub Pages.
 *
 * Чому краулер, а не `next export`: сторфронт використовує Server Actions
 * (кошик, checkout, вішліст, відгуки), які статичний експорт не підтримує.
 * Тому ми піднімаємо справжній сервер і зберігаємо готовий HTML — вітрина
 * (головна, категорії, картки, блог, контент) виглядає і клікається як у продакшні.
 *
 * ВАЖЛИВО про структуру: GitHub Pages сам обслуговує артефакт за адресою
 * https://<user>.github.io/<repo>/ — тобто корінь артефакту вже дорівнює basePath.
 * Тому файли кладемо ПЛОСКО в OUT (без теки basePath), інакше вийде /repo/repo/.
 *
 * Запуск (сервер має бути піднятий з тим самим NEXT_PUBLIC_BASE_PATH):
 *   node tools/snapshot.mjs
 * Env: SNAPSHOT_ORIGIN (default http://127.0.0.1:3000), NEXT_PUBLIC_BASE_PATH, OUT_DIR
 */
import { cp, mkdir, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const ORIGIN = process.env.SNAPSHOT_ORIGIN ?? "http://127.0.0.1:3000";
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const OUT = process.env.OUT_DIR ?? "_site";

// checkout і «Дякуємо» вимагають сервера (Server Actions, замовлення);
// вішліст і кабінет у знімок потрапляють у порожньому стані — для демо цього досить
const SKIP = [/^\/checkout/, /^\/dyakuyemo/, /^\/poshuk/, /^\/api\//];

const strip = (p) => (BASE_PATH && p.startsWith(BASE_PATH) ? p.slice(BASE_PATH.length) || "/" : p);

async function get(routePath) {
  const res = await fetch(`${ORIGIN}${BASE_PATH}${routePath === "/" ? "/" : routePath}`);
  return { status: res.status, body: res.ok ? await res.text() : "" };
}

/**
 * Теки в public/ — усе, на що можуть посилатися картинки (`/demo/…`, `/founder/…`).
 * Читаємо з диска, щоб нова тека не «загубилась» на Pages мовчки.
 */
const publicDirs = (await readdir("public", { withFileTypes: true }))
  .filter((e) => e.isDirectory())
  .map((e) => e.name);

/**
 * next/image у режимі unoptimized віддає src як є (`/demo/...`) — без basePath.
 * На Pages такий шлях веде на корінь домену, де нічого немає. Тому дописуємо basePath
 * до кожного посилання на теку з public/ — у src, srcset, url() і preload-хедерах.
 */
function fixAssetPaths(html) {
  if (!BASE_PATH) return html;
  let out = html;
  for (const dir of publicDirs) {
    out = out
      .replaceAll(`"/${dir}/`, `"${BASE_PATH}/${dir}/`)
      .replaceAll(`(/${dir}/`, `(${BASE_PATH}/${dir}/`)
      .replaceAll(` /${dir}/`, ` ${BASE_PATH}/${dir}/`);
  }
  return out;
}

/** Стартовий набір: sitemap-и + службові сторінки без sitemap */
async function seedUrls() {
  const urls = new Set(["/"]);
  for (const i of [0, 1, 2, 3]) {
    const { body } = await get(`/sitemap/${i}.xml`);
    for (const m of body.matchAll(/<loc>([^<]+)<\/loc>/g)) {
      urls.add(strip(new URL(m[1]).pathname));
    }
  }
  for (const extra of ["/rozmirna-sitka", "/oferta", "/konfidentsiynist", "/cookie"]) {
    urls.add(extra);
  }
  return urls;
}

const queue = [...(await seedUrls())];
const seen = new Set(queue);
const saved = [];

while (queue.length) {
  const routePath = queue.shift();
  if (SKIP.some((re) => re.test(routePath))) continue;

  const { status, body } = await get(routePath);
  if (status !== 200) {
    console.warn(`  ! ${routePath} → HTTP ${status}`);
    continue;
  }

  const dir = path.join(OUT, routePath.replace(/^\//, ""));
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, "index.html"), fixAssetPaths(body));
  saved.push(routePath);

  // Обхід внутрішніх посилань (щоб не проґавити сторінки поза sitemap)
  for (const m of body.matchAll(/href="([^"]+)"/g)) {
    const href = m[1];
    if (!href.startsWith("/") || href.startsWith("//")) continue;
    const clean = strip(href.split("#")[0].split("?")[0]);
    if (!clean || clean.startsWith("/_next") || seen.has(clean)) continue;
    // Тільки маршрути сторінок: файли (preload картинок, шрифти, xml) не краулимо
    if (/\.[a-z0-9]{2,5}$/i.test(clean)) continue;
    if (SKIP.some((re) => re.test(clean))) continue;
    seen.add(clean);
    queue.push(clean);
  }
}

// Статика: JS/CSS-чанки і public/ — у корінь артефакту
await cp(".next/static", path.join(OUT, "_next/static"), { recursive: true });
await cp("public", OUT, { recursive: true, force: true });

// Іконки з app/ (icon.png, apple-icon.png) — генеруються Next, не лежать у public
for (const asset of ["/icon.png", "/apple-icon.png"]) {
  const res = await fetch(`${ORIGIN}${BASE_PATH}${asset}`);
  if (res.ok) {
    await writeFile(path.join(OUT, asset.slice(1)), Buffer.from(await res.arrayBuffer()));
  }
}

// Sitemap-и знімка
for (const i of [0, 1, 2, 3]) {
  const { body } = await get(`/sitemap/${i}.xml`);
  await writeFile(path.join(OUT, `sitemap-${i}.xml`), body);
}
// Демо-вітрина не має індексуватись, щоб не конкурувати з майбутнім доменом
await writeFile(path.join(OUT, "robots.txt"), "User-agent: *\nDisallow: /\n");
// Вимикає обробку Jekyll на GitHub Pages (інакше теки _next ігноруються)
await writeFile(path.join(OUT, ".nojekyll"), "");

// 404 для GitHub Pages
const { body: notFound } = await get("/nemaje-takoji-storinky-404");
if (notFound) await writeFile(path.join(OUT, "404.html"), fixAssetPaths(notFound));

console.log(`✓ Знімок готовий: ${saved.length} сторінок → ${OUT}/ (обслуговується як ${BASE_PATH || "/"})`);
