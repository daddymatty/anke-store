import { LegalPage, legalMetadata } from "@/content/legal";

export const metadata = legalMetadata("cookie");

export default function Page() {
  return <LegalPage slug="cookie" />;
}
