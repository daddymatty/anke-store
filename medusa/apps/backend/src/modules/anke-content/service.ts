import { MedusaService } from "@medusajs/framework/utils";
import { ContentEntry } from "./models/content-entry";

class AnkeContentService extends MedusaService({ ContentEntry }) {}

export default AnkeContentService;
