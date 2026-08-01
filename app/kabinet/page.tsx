import type { Metadata } from "next";
import { currentUserEmail } from "@/app/actions/auth";
import { AccountDashboard } from "@/components/account/AccountDashboard";
import { LoginForm } from "@/components/account/LoginForm";
import { Container } from "@/components/ui/Container";
import { listOrdersByEmail } from "@/lib/orders/store";
import { getProfile } from "@/lib/profiles";

export const metadata: Metadata = {
  title: "Особистий кабінет",
  robots: { index: false, follow: false },
};

export default async function AccountPage() {
  const email = await currentUserEmail();

  if (!email) {
    return (
      <Container className="py-14 md:py-20">
        <LoginForm />
      </Container>
    );
  }

  const [orders, profile] = await Promise.all([listOrdersByEmail(email), getProfile(email)]);

  return (
    <Container className="py-10 md:py-14">
      <AccountDashboard email={email} orders={orders} profile={profile} />
    </Container>
  );
}
