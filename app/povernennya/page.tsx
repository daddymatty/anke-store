import { LegalPage, legalMetadata } from "@/content/legal";

export const metadata = legalMetadata("povernennya");

export default function Page() {
  return <LegalPage slug="povernennya" />;
}
