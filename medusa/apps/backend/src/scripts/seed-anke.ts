import { ExecArgs } from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils";
import {
  createInventoryLevelsWorkflow,
  createProductCategoriesWorkflow,
  createProductsWorkflow,
  createRegionsWorkflow,
  createStockLocationsWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  updateStoresWorkflow,
} from "@medusajs/medusa/core-flows";
import seedData from "./anke-seed-data.json";

type SeedCategory = {
  id: string;
  slug: string;
  path: string[];
  title: string;
  description?: string;
  children: SeedCategory[];
};

type SeedProduct = {
  slug: string;
  title: string;
  sku: string;
  price: number; // копійки
  compareAtPrice?: number;
  images: { url: string; alt: string }[];
  color: { name: string; hex: string };
  colorGroupId: string;
  sizes: { size: string; inStock: boolean }[];
  isNew: boolean;
  categoryPath: string[];
  material: string;
  materialFull: string;
  description: string;
  care: string[];
  madeIn: string;
  modelParams?: string;
  outfitWith: string[];
};

/**
 * Сідер каталогу ANKE: регіон Україна (UAH), склад «Шоурум Київ»,
 * дерево категорій і всі демо-товари (колір = окремий продукт).
 * Запуск: npx medusa exec ./src/scripts/seed-anke.ts
 * Ідемпотентність: якщо категорія «Одяг» вже існує — сідер виходить.
 */
export default async function seedAnke({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const salesChannelModule = container.resolve(Modules.SALES_CHANNEL);
  const storeModule = container.resolve(Modules.STORE);

  const { data: existing } = await query.graph({
    entity: "product_category",
    fields: ["id"],
    filters: { handle: "odyah" },
  });
  if (existing.length) {
    logger.info("ANKE вже засіяно — виходимо.");
    return;
  }

  const [store] = await storeModule.listStores();
  const [salesChannel] = await salesChannelModule.listSalesChannels({
    name: "Default Sales Channel",
  });

  logger.info("Валюта UAH + регіон Україна…");
  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: {
        supported_currencies: [
          { currency_code: "uah", is_default: true },
          { currency_code: "eur" },
        ],
      },
    },
  });

  await createRegionsWorkflow(container).run({
    input: {
      regions: [
        {
          name: "Україна",
          currency_code: "uah",
          countries: ["ua"],
          payment_providers: ["pp_system_default"],
        },
      ],
    },
  });
  await createTaxRegionsWorkflow(container).run({
    input: [{ country_code: "ua", provider_id: "tp_system" }],
  });

  logger.info("Склад «Шоурум Київ»…");
  const {
    result: [stockLocation],
  } = await createStockLocationsWorkflow(container).run({
    input: {
      locations: [
        {
          name: "Шоурум Київ",
          address: { city: "Київ", country_code: "UA", address_1: "" },
        },
      ],
    },
  });
  await linkSalesChannelsToStockLocationWorkflow(container).run({
    input: { id: stockLocation.id, add: [salesChannel.id] },
  });

  logger.info("Категорії…");
  const categories = seedData.categories as SeedCategory[];
  const flat: { cat: SeedCategory; parentPathKey: string | null }[] = [];
  const walk = (nodes: SeedCategory[], parent: string | null) => {
    for (const n of nodes) {
      flat.push({ cat: n, parentPathKey: parent });
      walk(n.children, n.path.join("/"));
    }
  };
  walk(categories, null);

  const idByPath = new Map<string, string>();
  for (const { cat, parentPathKey } of flat) {
    const {
      result: [created],
    } = await createProductCategoriesWorkflow(container).run({
      input: {
        product_categories: [
          {
            name: cat.title,
            handle: cat.slug === cat.path[cat.path.length - 1] ? cat.path.join("-") : cat.slug,
            description: cat.description ?? "",
            is_active: true,
            parent_category_id: parentPathKey ? idByPath.get(parentPathKey) ?? null : null,
          },
        ],
      },
    });
    idByPath.set(cat.path.join("/"), created.id);
  }

  logger.info("Товари…");
  const products = seedData.products as SeedProduct[];
  const { data: shippingProfiles } = await query.graph({
    entity: "shipping_profile",
    fields: ["id"],
  });
  const shippingProfileId = shippingProfiles[0]?.id;

  for (const p of products) {
    await createProductsWorkflow(container).run({
      input: {
        products: [
          {
            title: p.title,
            handle: p.slug,
            description: p.description,
            status: ProductStatus.PUBLISHED,
            category_ids: [idByPath.get(p.categoryPath.join("/"))!].filter(Boolean),
            shipping_profile_id: shippingProfileId,
            images: p.images.map((i) => ({ url: i.url })),
            options: [{ title: "Розмір", values: p.sizes.map((s) => s.size) }],
            variants: p.sizes.map((s) => ({
              title: s.size,
              sku: `${p.sku}-${s.size.replace(/\s/g, "")}`,
              options: { Розмір: s.size },
              manage_inventory: true,
              prices: [{ amount: p.price, currency_code: "uah" }],
            })),
            sales_channels: [{ id: salesChannel.id }],
            metadata: {
              colorGroupId: p.colorGroupId,
              colorName: p.color.name,
              colorHex: p.color.hex,
              material: p.material,
              materialFull: p.materialFull,
              care: p.care,
              madeIn: p.madeIn,
              modelParams: p.modelParams ?? "",
              outfitWith: p.outfitWith,
              isNew: p.isNew,
              compareAtPrice: p.compareAtPrice ?? null,
              imageAlts: p.images.map((i) => i.alt),
            },
          },
        ],
      },
    });
  }

  logger.info("Залишки…");
  const { data: inventoryItems } = await query.graph({
    entity: "inventory_item",
    fields: ["id", "sku"],
  });
  const stockBySku = new Map<string, number>();
  for (const p of products) {
    for (const s of p.sizes) {
      stockBySku.set(`${p.sku}-${s.size.replace(/\s/g, "")}`, s.inStock ? 12 : 0);
    }
  }
  await createInventoryLevelsWorkflow(container).run({
    input: {
      inventory_levels: inventoryItems.map((item) => ({
        inventory_item_id: item.id,
        location_id: stockLocation.id,
        stocked_quantity: stockBySku.get(item.sku ?? "") ?? 10,
      })),
    },
  });

  logger.info(`Готово: ${products.length} товарів, ${flat.length} категорій.`);
}
