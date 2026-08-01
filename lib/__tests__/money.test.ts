import { describe, expect, it } from "vitest";
import { discountPercent, formatPrice, priceDecimal, uah } from "@/lib/money";

describe("гроші (копійки)", () => {
  it("uah → копійки", () => {
    expect(uah(2890)).toBe(289000);
    expect(uah(0.5)).toBe(50);
  });

  it("formatPrice: розрядність і символ гривні", () => {
    expect(formatPrice(289000)).toContain("₴");
    expect(formatPrice(289000).replace(/ | /g, " ")).toBe("2 890 ₴");
    expect(formatPrice(99900).replace(/ | /g, " ")).toBe("999 ₴");
  });

  it("округлення копійок до гривень", () => {
    expect(formatPrice(289050).replace(/ | /g, " ")).toBe("2 891 ₴");
  });

  it("discountPercent", () => {
    expect(discountPercent(319000, 269000)).toBe(16);
    expect(discountPercent(0, 100)).toBe(0);
    expect(discountPercent(100, 100)).toBe(0);
    expect(discountPercent(100, 200)).toBe(0); // ціна вища за стару — знижки нема
  });

  it("priceDecimal для фідів/Schema.org", () => {
    expect(priceDecimal(289000)).toBe("2890.00");
    expect(priceDecimal(289050)).toBe("2890.50");
  });
});
