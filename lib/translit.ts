/**
 * Транслітерація української за Постановою КМУ №55 (27.01.2010) → ЧПУ-слаги.
 * "Сукня міді лляна" → "suknya-midi-llyana"
 */

const MAP: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "h", ґ: "g", д: "d", е: "e", є: "ie", ж: "zh",
  з: "z", и: "y", і: "i", ї: "i", й: "i", к: "k", л: "l", м: "m", н: "n",
  о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "kh", ц: "ts",
  ч: "ch", ш: "sh", щ: "shch", ь: "", ю: "iu", я: "ia", "'": "", "’": "",
};

/** На початку слова є/ї/й/ю/я передаються інакше */
const MAP_WORD_START: Record<string, string> = {
  є: "ye", ї: "yi", й: "y", ю: "yu", я: "ya",
};

export function transliterate(text: string): string {
  const lower = text.toLowerCase();
  let out = "";
  let wordStart = true;
  for (const ch of lower) {
    if (/[a-z0-9]/.test(ch)) {
      out += ch;
      wordStart = false;
    } else if (ch in MAP) {
      out += wordStart && ch in MAP_WORD_START ? MAP_WORD_START[ch] : MAP[ch];
      wordStart = false;
    } else {
      // роздільник (пробіл, дефіс, розділовий знак)
      out += " ";
      wordStart = true;
    }
  }
  return out.trim();
}

/** Слаг для URL: латиниця, дефіси, без повторів */
export function slugify(text: string): string {
  return transliterate(text)
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
