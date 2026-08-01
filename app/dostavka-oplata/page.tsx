import { LegalPage, legalMetadata } from "@/content/legal";

export const metadata = legalMetadata("dostavka-oplata");

export default function Page() {
  return <LegalPage slug="dostavka-oplata" />;
}
