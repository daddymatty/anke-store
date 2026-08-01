import { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import { createShippingOptionsWorkflow } from "@medusajs/medusa/core-flows";

/**
 * Опції доставки для регіону Україна (Нова Пошта) —
 * потрібні, щоб дзеркальні замовлення сторфронта завершувались у Medusa.
 * Запуск: npx medusa exec ./src/scripts/seed-anke-shipping.ts
 */
export default async function seedAnkeShipping({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const link = container.resolve(ContainerRegistrationKeys.LINK);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const fulfillmentModule = container.resolve(Modules.FULFILLMENT);

  const existing = await fulfillmentModule.listFulfillmentSets({ name: "Доставка Нова Пошта" });
  if (existing.length) {
    logger.info("Опції доставки UA вже існують — виходимо.");
    return;
  }

  const { data: locations } = await query.graph({
    entity: "stock_location",
    fields: ["id", "name"],
  });
  const kyiv = locations.find((l) => l.name === "Шоурум Київ") ?? locations[0];
  if (!kyiv) throw new Error("Немає stock location — спершу запусти seed-anke.ts");

  await link.create({
    [Modules.STOCK_LOCATION]: { stock_location_id: kyiv.id },
    [Modules.FULFILLMENT]: { fulfillment_provider_id: "manual_manual" },
  });

  const fulfillmentSet = await fulfillmentModule.createFulfillmentSets({
    name: "Доставка Нова Пошта",
    type: "shipping",
    service_zones: [
      {
        name: "Україна",
        geo_zones: [{ country_code: "ua", type: "country" }],
      },
    ],
  });

  await link.create({
    [Modules.STOCK_LOCATION]: { stock_location_id: kyiv.id },
    [Modules.FULFILLMENT]: { fulfillment_set_id: fulfillmentSet.id },
  });

  const { data: profiles } = await query.graph({ entity: "shipping_profile", fields: ["id"] });

  await createShippingOptionsWorkflow(container).run({
    input: [
      {
        name: "Нова Пошта — відділення/поштомат",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: fulfillmentSet.service_zones[0].id,
        shipping_profile_id: profiles[0].id,
        type: { label: "Нова Пошта", description: "1–3 дні по Україні", code: "np-warehouse" },
        prices: [{ currency_code: "uah", amount: 0 }],
        rules: [],
      },
      {
        name: "Нова Пошта — адресна доставка",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: fulfillmentSet.service_zones[0].id,
        shipping_profile_id: profiles[0].id,
        type: { label: "Нова Пошта кур'єр", description: "Кур'єр на адресу", code: "np-address" },
        prices: [{ currency_code: "uah", amount: 0 }],
        rules: [],
      },
    ],
  });

  logger.info("Опції доставки «Нова Пошта» для України створено.");
}
