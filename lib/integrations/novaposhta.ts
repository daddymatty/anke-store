import "server-only";

/**
 * Нова Пошта API v2.0 (JSON).
 * Без NOVA_POSHTA_API_KEY працює dev-фолбек зі статичними містами/відділеннями —
 * контракт відповіді ідентичний, підключення ключа нічого не змінює в UI.
 */

const API_URL = "https://api.novaposhta.ua/v2.0/json/";

export type NpCity = { ref: string; name: string; area: string };
export type NpWarehouse = { ref: string; description: string; number: string };
export type NpWarehouseType = "warehouse" | "postomat";

const DEV_CITIES: NpCity[] = [
  { ref: "dev-kyiv", name: "Київ", area: "Київська обл." },
  { ref: "dev-lviv", name: "Львів", area: "Львівська обл." },
  { ref: "dev-odesa", name: "Одеса", area: "Одеська обл." },
  { ref: "dev-dnipro", name: "Дніпро", area: "Дніпропетровська обл." },
  { ref: "dev-kharkiv", name: "Харків", area: "Харківська обл." },
  { ref: "dev-vinnytsia", name: "Вінниця", area: "Вінницька обл." },
  { ref: "dev-poltava", name: "Полтава", area: "Полтавська обл." },
  { ref: "dev-ivanofrankivsk", name: "Івано-Франківськ", area: "Івано-Франківська обл." },
];

function devWarehouses(type: NpWarehouseType): NpWarehouse[] {
  return Array.from({ length: type === "postomat" ? 5 : 8 }, (_, i) => ({
    ref: `dev-wh-${type}-${i + 1}`,
    number: String(i + 1),
    description:
      type === "postomat"
        ? `Поштомат №${i + 1} (тестовий): вул. Прикладна, ${i + 2}`
        : `Відділення №${i + 1} (тестове): вул. Прикладна, ${i + 2}`,
  }));
}

async function npCall<T>(model: string, method: string, props: Record<string, unknown>): Promise<T[]> {
  const key = process.env.NOVA_POSHTA_API_KEY;
  if (!key) throw new Error("no-key");
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ apiKey: key, modelName: model, calledMethod: method, methodProperties: props }),
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`NP ${res.status}`);
  const data = (await res.json()) as { success: boolean; data: T[] };
  if (!data.success) throw new Error("NP request failed");
  return data.data;
}

export async function searchCities(query: string): Promise<NpCity[]> {
  const q = query.trim();
  if (q.length < 2) return [];
  if (!process.env.NOVA_POSHTA_API_KEY) {
    return DEV_CITIES.filter((c) => c.name.toLowerCase().includes(q.toLowerCase()));
  }
  type Raw = { Addresses: { Ref: string; MainDescription: string; Area: string }[] };
  const data = await npCall<Raw>("Address", "searchSettlements", { CityName: q, Limit: "10" });
  return (data[0]?.Addresses ?? []).map((a) => ({
    ref: a.Ref,
    name: a.MainDescription,
    area: `${a.Area} обл.`,
  }));
}

export async function getWarehouses(cityName: string, type: NpWarehouseType): Promise<NpWarehouse[]> {
  if (!process.env.NOVA_POSHTA_API_KEY) return devWarehouses(type);
  type Raw = { Ref: string; Description: string; Number: string; CategoryOfWarehouse: string };
  const data = await npCall<Raw>("AddressGeneral", "getWarehouses", {
    CityName: cityName,
    Limit: "200",
    Language: "UA",
  });
  return data
    .filter((w) => (type === "postomat" ? w.CategoryOfWarehouse === "Postomat" : w.CategoryOfWarehouse !== "Postomat"))
    .map((w) => ({ ref: w.Ref, description: w.Description, number: w.Number }));
}

/** Трекінг ТТН (для кабінета, Етап 7) */
export async function trackWaybill(ttn: string): Promise<{ status: string } | null> {
  if (!process.env.NOVA_POSHTA_API_KEY) {
    return { status: "Тестовий режим: посилка прямує до відділення" };
  }
  type Raw = { Status: string };
  const data = await npCall<Raw>("TrackingDocument", "getStatusDocuments", {
    Documents: [{ DocumentNumber: ttn }],
  });
  return data[0] ? { status: data[0].Status } : null;
}
