import localFont from "next/font/local";

/**
 * Self-hosted шрифти, субсети latin + cyrillic (повна українська абетка + ₴).
 * Максимум 2 сім'ї — бюджет перформансу (docs/brand.md §3).
 */
export const cormorant = localFont({
  src: [
    { path: "../app/fonts/cormorant-latin-cyr-300.woff2", weight: "300", style: "normal" },
    { path: "../app/fonts/cormorant-latin-cyr-500.woff2", weight: "500", style: "normal" },
  ],
  variable: "--font-cormorant",
  display: "swap",
  fallback: ["Georgia", "serif"],
});

export const montserrat = localFont({
  src: [
    { path: "../app/fonts/montserrat-latin-cyr-300.woff2", weight: "300", style: "normal" },
    { path: "../app/fonts/montserrat-latin-cyr-400.woff2", weight: "400", style: "normal" },
    { path: "../app/fonts/montserrat-latin-cyr-500.woff2", weight: "500", style: "normal" },
  ],
  variable: "--font-montserrat",
  display: "swap",
  fallback: ["system-ui", "Arial", "sans-serif"],
});
