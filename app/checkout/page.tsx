import type { Metadata } from "next";
import Link from "next/link";
import { getCartLines } from "@/app/actions/cart";
import { CheckoutForm } from "@/components/shop/CheckoutForm";
import { Container } from "@/components/ui/Container";
import { resolveCart } from "@/lib/cart/summary";

export const metadata: Metadata = {
  title: "Оформлення замовлення",
  robots: { index: false, follow: false },
};

/** Одноекранний гостьовий checkout (реєстрація не потрібна). */
export default async function CheckoutPage() {
  const lines = await getCartLines();
  const cart = await resolveCart(lines);

  if (!cart.items.length) {
    return (
      <Container className="py-20 text-center">
        <h1 className="font-display text-display-sm font-light">Кошик порожній</h1>
        <p className="mt-3 text-[14px] text-muted">Додайте щось до кошика — і повертайтесь сюди.</p>
        <Link
          href="/novynky"
          className="mt-6 inline-block border border-ink px-8 py-3 text-[13px] font-medium uppercase tracking-[0.14em] transition-colors hover:bg-ink hover:text-paper"
        >
          До новинок
        </Link>
      </Container>
    );
  }

  return (
    <Container className="py-8 md:py-12">
      <h1 className="font-display text-display-sm font-light md:text-display">Оформлення замовлення</h1>
      <p className="mt-2 text-[13px] text-muted">
        Без реєстрації. Поля з * — обов&apos;язкові.
      </p>
      <div className="mt-8">
        <CheckoutForm
          items={cart.items.map((i) => ({
            slug: i.slug,
            title: i.title,
            size: i.size,
            qty: i.qty,
            price: i.price,
            image: i.image.url,
            alt: i.image.alt,
          }))}
          subtotal={cart.subtotal}
          freeShippingFrom={cart.freeShippingFrom}
        />
      </div>
    </Container>
  );
}
