import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Артефакт снапшота для GitHub Pages (tools/snapshot.mjs) — не вихідний код
    "_site/**",
    // Підпроєкт Medusa має власний ESLint (turbo lint усередині medusa/)
    "medusa/**",
  ]),
]);

export default eslintConfig;
