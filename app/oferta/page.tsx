import { LegalPage, legalMetadata } from "@/content/legal";

export const metadata = legalMetadata("oferta");

export default function Page() {
  return <LegalPage slug="oferta" />;
}
