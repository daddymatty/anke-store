// Генерує components/ui/Logo.tsx з brand/final/*.svg (контури — джерело правди).
// Запуск: node tools/gen-logo.mjs
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const read = (f) => readFileSync(new URL(`../brand/final/${f}`, import.meta.url), "utf8");
const parse = (svg) => ({
  viewBox: svg.match(/viewBox="([^"]+)"/)[1],
  inner: svg.replace(/^<svg[^>]*>/, "").replace(/<\/svg>$/, ""),
});

const full = parse(read("logo.svg"));
const solo = parse(read("logo-solo.svg"));
const mark = parse(read("logo-mark.svg"));

const out = `// АВТОГЕНЕРОВАНО з brand/final/*.svg — не редагувати вручну (node tools/gen-logo.mjs)
// Інлайновий SVG (не <img>): нуль запитів, колір через currentColor, не впливає на LCP.

type LogoProps = {
  className?: string;
  /** full — ANKE + SHOWROOM (десктоп-хедер); solo — тільки ANKE (мобільний хедер) */
  variant?: "full" | "solo";
};

export function Logo({ className, variant = "full" }: LogoProps) {
  const vb = variant === "full" ? "${full.viewBox}" : "${solo.viewBox}";
  const html = variant === "full" ? FULL : SOLO;
  return (
    <svg
      viewBox={vb}
      className={className}
      role="img"
      aria-label="ANKE"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

/** Монограма «A» — фавікон-стиль, аватари, плейсхолдери */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="${mark.viewBox}"
      className={className}
      role="img"
      aria-label="ANKE"
      dangerouslySetInnerHTML={{ __html: MARK }}
    />
  );
}

const FULL = ${JSON.stringify(full.inner)};
const SOLO = ${JSON.stringify(solo.inner)};
const MARK = ${JSON.stringify(mark.inner)};
`;

mkdirSync(new URL("../components/ui", import.meta.url), { recursive: true });
writeFileSync(new URL("../components/ui/Logo.tsx", import.meta.url), out);
console.log("✓ components/ui/Logo.tsx");
