import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { formatPrice } from "@/lib/money";
import { getOrder } from "@/lib/orders/store";

/**
 * Сторінка «Дякуємо» — окремий URL для conversion tracking (purchase, Етап 9).
 */

export const metadata: Metadata = {
  title: "Дякуємо за замовлення",
  robots: { index: false, follow: false },
};

const PAYMENT_LABEL = {
  online: "Оплата онлайн",
  installments: "Оплата частинами",
  cod: "Накладений платіж (оплата при отриманні)",
} as const;

export default async function ThankYouPage({
  params,
  searchParams,
}: {
  params: Promise<{ number: string }>;
  searchParams: Promise<{ dev_paid?: string; pay?: string }>;
}) {
  const { number } = await params;
  const sp = await searchParams;
  const order = await getOrder(number.toUpperCase());
  if (!order) notFound();

  return (
    <Container className="py-14 md:py-20">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-[12px] font-medium uppercase tracking-[0.22em] text-rose-deep">Замовлення прийнято</p>
        <h1 className="mt-3 font-display text-display-sm font-light md:text-display">
          Дякуємо! Ваш номер — {order.number}
        </h1>
        <p className="mt-4 text-[14px] leading-relaxed text-muted">
          Підтвердження вже летить на {order.customer.email}. Зберемо замовлення і надішлемо
          ТТН Нової Пошти в SMS та на пошту.
        </p>
        {sp.dev_paid === "1" && (
          <p className="mt-3 inline-block bg-beige px-4 py-2 text-[12.5px] text-muted">
            Тестовий режим: оплату позначено як успішну без реального списання.
          </p>
        )}
        {sp.pay === "failed" && (
          <p className="mt-3 inline-block border border-rose-deep/40 bg-rose-soft/40 px-4 py-2 text-[12.5px] text-rose-deep">
            Не вдалося створити рахунок на оплату — ми зв&apos;яжемось для оплати іншим способом.
          </p>
        )}
      </div>

      <div className="mx-auto mt-10 max-w-lg border border-line p-6">
        <h2 className="text-[12px] font-medium uppercase tracking-[0.16em] text-muted">Склад замовлення</h2>
        <ul className="mt-3 divide-y divide-line text-[13.5px]">
          {order.items.map((i) => (
            <li key={`${i.slug}-${i.size}`} className="flex justify-between gap-4 py-2.5">
              <span>
                {i.title}, {i.size} × {i.qty}
              </span>
              <span className="font-medium">{formatPrice(i.price * i.qty)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-3 space-y-1 border-t border-line pt-3 text-[13.5px]">
          {order.totals.discount > 0 && (
            <div className="flex justify-between text-rose-deep">
              <dt>Знижка{order.promo ? ` (${order.promo.code})` : ""}</dt>
              <dd>−{formatPrice(order.totals.discount)}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-muted">Доставка</dt>
            <dd>{order.totals.shipping === 0 ? "Безкоштовно" : "за тарифами НП"}</dd>
          </div>
          <div className="flex justify-between pt-1 text-[15px] font-medium">
            <dt>Разом</dt>
            <dd>{formatPrice(order.totals.total)}</dd>
          </div>
        </dl>
        <div className="mt-4 border-t border-line pt-3 text-[13px] text-muted">
          <p>
            {order.delivery.cityName}
            {order.delivery.warehouseName ? `, ${order.delivery.warehouseName}` : ""}
            {order.delivery.addressLine ? `, ${order.delivery.addressLine}` : ""}
          </p>
          <p className="mt-1">{PAYMENT_LABEL[order.payment.method]}</p>
        </div>
      </div>

      <div className="mt-10 text-center">
        <Link
          href="/"
          className="inline-block border border-ink px-8 py-3 text-[13px] font-medium uppercase tracking-[0.14em] transition-colors hover:bg-ink hover:text-paper"
        >
          Повернутись до покупок
        </Link>
      </div>
    </Container>
  );
}
