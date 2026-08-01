import { describe, expect, it } from "vitest";
import { slugify, transliterate } from "@/lib/translit";

describe("транслітерація (Постанова КМУ №55)", () => {
  it("базові літери", () => {
    expect(transliterate("сукня")).toBe("suknia");
    expect(transliterate("шовк")).toBe("shovk");
    expect(transliterate("щастя")).toBe("shchastia");
  });

  it("є/ї/й/ю/я на початку слова передаються інакше", () => {
    expect(transliterate("Єва")).toBe("yeva");
    expect(transliterate("Їжак")).toBe("yizhak");
    expect(transliterate("Юлія")).toBe("yuliia");
    expect(transliterate("яблуко")).toBe("yabluko");
    // не на початку
    expect(transliterate("подія")).toBe("podiia");
  });

  it("зг/ґ/х/ц", () => {
    expect(transliterate("ґудзик")).toBe("gudzyk");
    expect(transliterate("хустка")).toBe("khustka");
    expect(transliterate("цукор")).toBe("tsukor");
  });

  it("апострофи і м'який знак зникають", () => {
    expect(slugify("п'ять суконь")).toBe("piat-sukon");
  });

  it("slugify: дефіси без повторів, латиниця і цифри лишаються", () => {
    expect(slugify("Сукня міді лляна «Соломія»")).toBe("suknia-midi-lliana-solomiia");
    expect(slugify("Розмір 42 (S)")).toBe("rozmir-42-s");
    expect(slugify("  --багато   пробілів--  ")).toBe("bahato-probiliv");
  });
});
