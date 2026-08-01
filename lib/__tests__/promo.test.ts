import { describe, expect, it } from "vitest";
import { validatePromo } from "@/lib/promo";

describe("промокоди", () => {
  it("відсоткова знижка, регістр не важливий", () => {
    const p = validatePromo("anke10", 100000);
    expect(p).not.toBeNull();
    expect(p!.discount).toBe(10000);
    expect(p!.code).toBe("ANKE10");
  });

  it("мінімальна сума для WELCOME15", () => {
    expect(validatePromo("WELCOME15", 100000)).toBeNull(); // < 1500 грн
    expect(validatePromo("WELCOME15", 200000)!.discount).toBe(30000);
  });

  it("сертифікат не перевищує суму кошика", () => {
    const p = validatePromo("GIFT-1000", 50000); // кошик 500 грн, сертифікат 1000
    expect(p!.discount).toBe(50000);
  });

  it("безкоштовна доставка без знижки", () => {
    const p = validatePromo("FREESHIP", 100000);
    expect(p!.discount).toBe(0);
    expect(p!.freeShipping).toBe(true);
  });

  it("невідомий код", () => {
    expect(validatePromo("NOPE", 100000)).toBeNull();
  });
});
