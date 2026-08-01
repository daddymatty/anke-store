"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { logout, updateNewsletter, updateProfile } from "@/app/actions/auth";
import { formatPrice } from "@/lib/money";
import type { Order } from "@/lib/orders/types";
import type { NewsletterSegment, Profile } from "@/lib/profiles";

/** Кабінет: замовлення (ТТН-трекінг), дані, сегментована підписка. */

const STATUS_LABEL: Record<Order["status"], { text: string; cls: string }> = {
  new: { text: "Нове", cls: "bg-beige text-ink" },
  processing: { text: "Комплектується", cls: "bg-rose-soft text-rose-deep" },
  shipped: { text: "Відправлено", cls: "bg-ink text-paper" },
  done: { text: "Отримано", cls: "bg-beige-deep text-ink" },
  canceled: { text: "Скасовано", cls: "bg-line text-muted" },
};

const SEGMENTS: { value: NewsletterSegment; label: string; hint: string }[] = [
  { value: "novynky", label: "Новинки", hint: "Перші дізнавайтесь про нові моделі" },
  { value: "znyzhky", label: "Знижки і private sale", hint: "Закриті розпродажі для своїх" },
  { value: "styling", label: "Стилістика", hint: "Образи і поради від стилістів ANKE" },
];

export function AccountDashboard({ email, orders, profile }: { email: string; orders: Order[]; profile: Profile }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: profile.name ?? "",
    phone: profile.phone ?? "",
    defaultCity: profile.defaultCity ?? "",
    defaultWarehouse: profile.defaultWarehouse ?? "",
  });
  const [segments, setSegments] = useState<NewsletterSegment[]>(profile.newsletter);
  const [saved, setSaved] = useState<string | null>(null);
  const [ttnStatus, setTtnStatus] = useState<Record<string, string>>({});

  const saveProfileForm = async () => {
    const res = await updateProfile(form);
    setSaved(res.ok ? "Збережено ✓" : (res.error ?? "Помилка"));
    setTimeout(() => setSaved(null), 2500);
  };

  const toggleSegment = async (s: NewsletterSegment) => {
    const next = segments.includes(s) ? segments.filter((x) => x !== s) : [...segments, s];
    setSegments(next);
    await updateNewsletter(next);
  };

  const trackTtn = async (ttn: string) => {
    const res = await fetch(`/api/np/track?ttn=${encodeURIComponent(ttn)}`);
    const data = (await res.json()) as { status: string | null };
    setTtnStatus((m) => ({ ...m, [ttn]: data.status ?? "Статус недоступний" }));
  };

  const onLogout = async () => {
    await logout();
    router.refresh();
  };

  const inputClass =
    "mt-1.5 w-full border border-line px-3.5 py-3 text-[14px] focus:border-ink focus:outline-none";
  const labelClass = "text-[12px] uppercase tracking-[0.12em] text-muted";

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-display-sm font-light">Кабінет</h1>
          <p className="mt-1 text-[13px] text-muted">{email}</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/vishlist"
            className="border border-line px-5 py-2.5 text-[12px] font-medium uppercase tracking-[0.12em] transition-colors hover:border-ink"
          >
            Вішліст
          </Link>
          <button
            type="button"
            onClick={onLogout}
            className="border border-line px-5 py-2.5 text-[12px] font-medium uppercase tracking-[0.12em] text-muted transition-colors hover:border-ink hover:text-ink"
          >
            Вийти
          </button>
        </div>
      </div>

      {/* Замовлення */}
      <section aria-labelledby="acc-orders" className="mt-10">
        <h2 id="acc-orders" className="text-[13px] font-medium uppercase tracking-[0.16em]">
          Мої замовлення
        </h2>
        {orders.length === 0 ? (
          <p className="mt-4 text-[13.5px] text-muted">
            Замовлень з email {email} поки немає.{" "}
            <Link href="/novynky" className="text-ink underline underline-offset-4">
              До новинок →
            </Link>
          </p>
        ) : (
          <ul className="mt-4 space-y-4">
            {orders.map((o) => {
              const st = STATUS_LABEL[o.status];
              return (
                <li key={o.number} className="border border-line p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-[14px] font-medium">{o.number}</span>
                      <span className={`px-2 py-0.5 text-[11px] uppercase tracking-[0.08em] ${st.cls}`}>
                        {st.text}
                      </span>
                    </div>
                    <time dateTime={o.createdAt} className="text-[12px] text-muted">
                      {new Date(o.createdAt).toLocaleDateString("uk-UA", { day: "numeric", month: "long", year: "numeric" })}
                    </time>
                  </div>
                  <ul className="mt-3 space-y-1 text-[13px] text-muted">
                    {o.items.map((i) => (
                      <li key={`${i.slug}-${i.size}`}>
                        <Link href={`/product/${i.slug}`} className="hover:text-ink">
                          {i.title}, {i.size} × {i.qty}
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
                    <span className="text-[14px] font-medium">{formatPrice(o.totals.total)}</span>
                    {o.delivery.ttn ? (
                      <div className="text-right">
                        <button
                          type="button"
                          onClick={() => trackTtn(o.delivery.ttn!)}
                          className="text-[12.5px] underline underline-offset-4 hover:text-rose-deep"
                        >
                          ТТН {o.delivery.ttn} — де посилка?
                        </button>
                        {ttnStatus[o.delivery.ttn] && (
                          <p className="mt-1 text-[12px] text-muted">{ttnStatus[o.delivery.ttn]}</p>
                        )}
                      </div>
                    ) : (
                      <span className="text-[12px] text-muted">ТТН з&apos;явиться після відправки</span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <div className="mt-12 grid gap-10 md:grid-cols-2">
        {/* Дані */}
        <section aria-labelledby="acc-profile">
          <h2 id="acc-profile" className="text-[13px] font-medium uppercase tracking-[0.16em]">
            Мої дані
          </h2>
          <div className="mt-4 space-y-4">
            <div>
              <label htmlFor="pf-name" className={labelClass}>Прізвище та ім&apos;я</label>
              <input id="pf-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label htmlFor="pf-phone" className={labelClass}>Телефон</label>
              <input id="pf-phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+380XXXXXXXXX" className={inputClass} />
            </div>
            <div>
              <label htmlFor="pf-city" className={labelClass}>Місто за замовчуванням</label>
              <input id="pf-city" value={form.defaultCity} onChange={(e) => setForm({ ...form, defaultCity: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label htmlFor="pf-wh" className={labelClass}>Відділення НП за замовчуванням</label>
              <input id="pf-wh" value={form.defaultWarehouse} onChange={(e) => setForm({ ...form, defaultWarehouse: e.target.value })} className={inputClass} />
            </div>
            <button
              type="button"
              onClick={saveProfileForm}
              className="bg-ink px-8 py-3 text-[12px] font-medium uppercase tracking-[0.14em] text-paper"
            >
              Зберегти
            </button>
            {saved && <p className="text-[12.5px] text-muted">{saved}</p>}
          </div>
        </section>

        {/* Розсилка */}
        <section aria-labelledby="acc-news">
          <h2 id="acc-news" className="text-[13px] font-medium uppercase tracking-[0.16em]">
            Розсилка
          </h2>
          <p className="mt-2 text-[12.5px] text-muted">
            Обирайте, про що писати саме вам — жодного спаму.
          </p>
          <ul className="mt-4 space-y-3">
            {SEGMENTS.map((s) => (
              <li key={s.value}>
                <label className="flex cursor-pointer items-start gap-3 border border-line p-4 transition-colors hover:border-ink">
                  <input
                    type="checkbox"
                    checked={segments.includes(s.value)}
                    onChange={() => toggleSegment(s.value)}
                    className="mt-0.5 h-4 w-4 accent-ink"
                  />
                  <span>
                    <span className="block text-[14px]">{s.label}</span>
                    <span className="block text-[12px] text-muted">{s.hint}</span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
