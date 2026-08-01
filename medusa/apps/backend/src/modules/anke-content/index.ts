import { Module } from "@medusajs/framework/utils";
import AnkeContentService from "./service";

export const ANKE_CONTENT_MODULE = "ankeContent";

export default Module(ANKE_CONTENT_MODULE, {
  service: AnkeContentService,
});
