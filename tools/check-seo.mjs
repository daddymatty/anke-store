/**
 * SEO-аудит збірки (розділ 4 ТЗ, Definition of Done):
 * кожна сторінка має title/description/canonical/JSON-LD/один h1; битих посилань немає.
 * Запуск: сервер на BASE (default http://localhost:3777) → node tools/check-seo.mjs
 */

const BASE = process.env.CHECK_BASE ?? "http://localhost:3777";

async function fetchText(path) {
  const res = await fetch(`${BASE}${path}`, { redirect: "manual" });
  return { status: res.status, html: res.ok ? await res.text() : "" };
}

// Збираємо URL: статичні + категорії/товари/блог із sitemap-ів
async function collectUrls() {
  const urls = new Set(["/"]);
  for (const i of [0, 1, 2, 3]) {
    const { html } = await fetchText(`/sitemap/${i}.xml`);
    for (const m of html.matchAll(/<loc>([^<]+)<\/loc>/g)) {
      const u = new URL(m[1]);
      urls.add(u.pathname);
    }
  }
  return [...urls];
}

const problems = [];
const linkPool = new Set();

function check(path, html) {
  const has = (re) => re.test(html);
  if (!has(/<title>[^<]{5,}<\/title>/)) problems.push(`${path}: немає/порожній <title>`);
  if (!has(/<meta name="description" content="[^"]{20,}"/)) problems.push(`${path}: немає description`);
  if (!has(/<link rel="canonical"/)) problems.push(`${path}: немає canonical`);
  if (!has(/application\/ld\+json/)) problems.push(`${path}: немає JSON-LD`);
  const h1Count = (html.match(/<h1[\s>]/g) ?? []).length;
  if (h1Count !== 1) problems.push(`${path}: h1 = ${h1Count} (має бути 1)`);
  // теги <img> без alt (next/image завжди ставить, але перевіримо)
  for (const img of html.matchAll(/<img (?![^>]*alt=)[^>]*>/g)) {
    problems.push(`${path}: <img> без alt: ${img[0].slice(0, 80)}`);
  }
  // внутрішні посилання в пул перевірки
  for (const m of html.matchAll(/href="(\/[^"#?]*)"/g)) {
    const href = m[1];
    if (!href.startsWith("/_next") && !href.startsWith("/api")) linkPool.add(href);
  }
}

const urls = await collectUrls();
console.log(`Сторінок для перевірки: ${urls.length}`);

for (const path of urls) {
  const { status, html } = await fetchText(path);
  if (status !== 200) {
    problems.push(`${path}: HTTP ${status}`);
    continue;
  }
  check(path, html);
}

// Перевірка внутрішніх посилань, що не в sitemap (юридичні, кабінет тощо)
const extra = [...linkPool].filter((l) => !urls.includes(l));
console.log(`Додаткових внутрішніх посилань: ${extra.length}`);
for (const path of extra) {
  const res = await fetch(`${BASE}${path}`, { method: "HEAD", redirect: "manual" });
  if (res.status >= 400) problems.push(`бите посилання: ${path} → HTTP ${res.status}`);
}

if (problems.length) {
  console.error(`\n✗ Проблем: ${problems.length}`);
  for (const p of problems) console.error("  -", p);
  process.exit(1);
}
console.log("\n✓ SEO-аудит пройдено: title/description/canonical/JSON-LD/h1 на місці, битих посилань немає.");
