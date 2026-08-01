import { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { deleteProductsWorkflow } from "@medusajs/medusa/core-flows";

/** Видаляє дефолтні демо-товари Medusa (T-Shirt тощо), що не належать каталогу ANKE. */
export default async function cleanupDefaults({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const { data: withMeta } = await query.graph({
    entity: "product",
    fields: ["id", "handle", "metadata"],
  });
  const toDelete = withMeta.filter((p) => !p.metadata || !p.metadata.colorGroupId).map((p) => p.id);
  if (!toDelete.length) {
    logger.info("Нема чого видаляти.");
    return;
  }
  await deleteProductsWorkflow(container).run({ input: { ids: toDelete } });
  logger.info(`Видалено дефолтних товарів: ${toDelete.length}`);
}
