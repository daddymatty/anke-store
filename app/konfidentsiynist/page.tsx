import { LegalPage, legalMetadata } from "@/content/legal";

export const metadata = legalMetadata("konfidentsiynist");

export default function Page() {
  return <LegalPage slug="konfidentsiynist" />;
}
