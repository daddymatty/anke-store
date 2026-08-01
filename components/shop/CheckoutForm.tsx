"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { applyPromo, placeOrder, type CheckoutInput } from "@/app/actions/checkout";
import { pushEcommerce } from "@/lib/analytics";
import { notifyCartChanged } from "@/lib/cart-client";
import { formatPrice } from "@/lib/money";

/**
 * Одноекранний гостьовий checkout:
 * контакти → доставка НП (місто/відділення/адреса) → оплата → промокод → підсумок.
 */

type SummaryProps = {
  items: { slug: string; title: string; size: string; qty: number; price: number; image: string; alt: string }[];
  subtotal: number;
  freeShippingFrom: number;
};

const formSchema = z.object({
  name: z.string().min(5, "Вкажіть прізвище та ім'я"),
  phone: z.string().regex(/^\+380\d{9}$/, "Телефон у форматі +380 XX XXX XX XX"),
  email: z.email("Вкажіть коректний email"),
  deliveryMethod: z.enum(["np-warehouse", "np-postomat", "np-address"]),
  cityName: z.string().min(2, "Оберіть місто зі списку"),
  warehouseName: z.string().optional(),
  addressLine: z.string().optional(),
  paymentMethod: z.enum(["online", "installments", "cod"]),
  comment: z.string().max(500).optional(),
});
type FormData = z.infer<typeof formSchema>;

type City = { ref: string; name: string; area: string };
type Warehouse = { ref: string; description: string; number: string };

const DELIVERY_OPTIONS = [
  { value: "np-warehouse", label: "Нова Пошта — відділення" },
  { value: "np-postomat", label: "Нова Пошта — поштомат" },
  { value: "np-address", label: "Нова Пошта — кур'єр на адресу" },
] as const;

const PAYMENT_OPTIONS = [
  { value: "online", label: "Оплата онлайн", hint: "Картка, Apple Pay / Google Pay" },
  { value: "installments", label: "Оплата частинами", hint: "Покупка частинами від monobank" },
  { value: "cod", label: "Накладений платіж", hint: "Оплата при отриманні + комісія НП" },
] as const;

export function CheckoutForm({ items, subtotal, freeShippingFrom }: SummaryProps) {
  const router = useRouter();
  const [cities, setCities] = useState<City[]>([]);
  const [cityOpen, setCityOpen] = useState(false);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [cityRef, setCityRef] = useState<string | undefined>();
  const [warehouseRef, setWarehouseRef] = useState<string | undefined>();
  const [promoInput, setPromoInput] = useState("");
  const [promo, setPromo] = useState<{ code: string; label: string; discount: number; freeShipping: boolean } | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const cityBoxRef = useRef<HTMLDivElement>(null);
  const shippingSent = useRef(false);
  const paymentSent = useRef(false);

  const gaItems = items.map((i) => ({
    item_id: i.slug,
    item_name: i.title,
    item_variant: i.size,
    price: Math.round(i.price) / 100,
    quantity: i.qty,
  }));

  const trackShipping = (tier: string) => {
    if (shippingSent.current) return;
    shippingSent.current = true;
    pushEcommerce("add_shipping_info", { shipping_tier: tier, value: subtotal / 100, items: gaItems });
  };

  const trackPayment = (type: string) => {
    if (paymentSent.current) return;
    paymentSent.current = true;
    pushEcommerce("add_payment_info", { payment_type: type, value: subtotal / 100, items: gaItems });
  };

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { deliveryMethod: "np-warehouse", paymentMethod: "online", phone: "+380" },
  });

  const deliveryMethod = watch("deliveryMethod");
  const cityName = watch("cityName");

  // Підказки міст (дебаунс)
  useEffect(() => {
    if (!cityOpen || !cityName || cityName.length < 2) return;
    const t = setTimeout(async () => {
      const res = await fetch(`/api/np/cities?q=${encodeURIComponent(cityName)}`);
      const data = (await res.json()) as { cities: City[] };
      setCities(data.cities);
    }, 250);
    return () => clearTimeout(t);
  }, [cityName, cityOpen]);

  // Відділення/поштомати після вибору міста
  useEffect(() => {
    if (!cityRef || deliveryMethod === "np-address") return;
    const type = deliveryMethod === "np-postomat" ? "postomat" : "warehouse";
    (async () => {
      const res = await fetch(
        `/api/np/warehouses?city=${encodeURIComponent(cityName ?? "")}&type=${type}`,
      );
      const data = (await res.json()) as { warehouses: Warehouse[] };
      setWarehouses(data.warehouses);
    })();
  }, [cityRef, deliveryMethod, cityName]);

  // Закриття дропдауна міст по кліку поза ним
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!cityBoxRef.current?.contains(e.target as Node)) setCityOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const onPhoneChange = (raw: string) => {
    let digits = raw.replace(/[^\d]/g, "");
    if (digits.startsWith("380")) digits = digits.slice(3);
    else if (digits.startsWith("0")) digits = digits.slice(1);
    setValue("phone", `+380${digits.slice(0, 9)}`, { shouldValidate: false });
  };

  const onApplyPromo = async () => {
    setPromoError(null);
    if (!promoInput.trim()) return;
    const res = await applyPromo(promoInput.trim());
    if (res.ok) {
      setPromo({ code: promoInput.trim().toUpperCase(), label: res.label, discount: res.discount, freeShipping: res.freeShipping });
    } else {
      setPromo(null);
      setPromoError(res.error);
    }
  };

  const discount = promo?.discount ?? 0;
  const total = subtotal - discount;
  const freeShipping = (promo?.freeShipping ?? false) || total >= freeShippingFrom;

  const onSubmit = handleSubmit(async (data) => {
    setSubmitError(null);
    const payload: CheckoutInput = {
      ...data,
      cityRef,
      warehouseRef,
      promoCode: promo?.code,
    };
    trackShipping(data.deliveryMethod);
    trackPayment(data.paymentMethod);
    const res = await placeOrder(payload);
    if (res.ok) {
      notifyCartChanged();
      router.push(res.redirect);
    } else {
      setSubmitError(res.error);
    }
  });

  const inputClass =
    "mt-1.5 w-full border border-line px-3.5 py-3 text-[14px] focus:border-ink focus:outline-none";
  const labelClass = "text-[12px] uppercase tracking-[0.12em] text-muted";

  return (
    <form onSubmit={onSubmit} className="grid gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
      <div className="space-y-9">
        {/* Контакти */}
        <fieldset>
          <legend className="font-display text-xl font-light">Контактні дані</legend>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label htmlFor="co-name" className={labelClass}>Прізвище та ім&apos;я *</label>
              <input id="co-name" autoComplete="name" {...register("name")} className={inputClass} />
              {errors.name && <p role="alert" className="mt-1 text-[12px] text-rose-deep">{errors.name.message}</p>}
            </div>
            <div>
              <label htmlFor="co-phone" className={labelClass}>Телефон *</label>
              <input
                id="co-phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                {...register("phone")}
                onChange={(e) => onPhoneChange(e.target.value)}
                className={inputClass}
              />
              {errors.phone && <p role="alert" className="mt-1 text-[12px] text-rose-deep">{errors.phone.message}</p>}
            </div>
            <div>
              <label htmlFor="co-email" className={labelClass}>Email *</label>
              <input id="co-email" type="email" autoComplete="email" {...register("email")} className={inputClass} />
              {errors.email && <p role="alert" className="mt-1 text-[12px] text-rose-deep">{errors.email.message}</p>}
            </div>
          </div>
        </fieldset>

        {/* Доставка */}
        <fieldset>
          <legend className="font-display text-xl font-light">Доставка</legend>
          <div className="mt-4 space-y-2">
            {DELIVERY_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className={`flex cursor-pointer items-center gap-3 border px-4 py-3.5 text-[14px] transition-colors ${
                  deliveryMethod === opt.value ? "border-ink" : "border-line hover:border-muted"
                }`}
              >
                <input
                  type="radio"
                  value={opt.value}
                  {...register("deliveryMethod")}
                  className="h-4 w-4 accent-ink"
                />
                {opt.label}
              </label>
            ))}
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div ref={cityBoxRef} className="relative">
              <label htmlFor="co-city" className={labelClass}>Місто *</label>
              <input
                id="co-city"
                autoComplete="off"
                placeholder="Почніть вводити…"
                {...register("cityName")}
                onFocus={() => setCityOpen(true)}
                onChange={(e) => {
                  setValue("cityName", e.target.value);
                  setCityRef(undefined);
                  setCityOpen(true);
                }}
                className={inputClass}
              />
              {errors.cityName && <p role="alert" className="mt-1 text-[12px] text-rose-deep">{errors.cityName.message}</p>}
              {cityOpen && cities.length > 0 && (
                <ul className="absolute z-10 mt-1 max-h-56 w-full overflow-y-auto border border-line bg-paper shadow-soft">
                  {cities.map((c) => (
                    <li key={c.ref}>
                      <button
                        type="button"
                        className="block w-full px-3.5 py-2.5 text-left text-[13px] hover:bg-beige"
                        onClick={() => {
                          setValue("cityName", c.name, { shouldValidate: true });
                          setCityRef(c.ref);
                          setCityOpen(false);
                          setValue("warehouseName", undefined);
                          setWarehouseRef(undefined);
                        }}
                      >
                        {c.name} <span className="text-muted">— {c.area}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {deliveryMethod !== "np-address" ? (
              <div>
                <label htmlFor="co-wh" className={labelClass}>
                  {deliveryMethod === "np-postomat" ? "Поштомат *" : "Відділення *"}
                </label>
                <select
                  id="co-wh"
                  {...register("warehouseName")}
                  onChange={(e) => {
                    setValue("warehouseName", e.target.value);
                    setWarehouseRef(warehouses.find((w) => w.description === e.target.value)?.ref);
                    if (e.target.value) trackShipping(deliveryMethod);
                  }}
                  disabled={!cityRef}
                  className={`${inputClass} bg-paper disabled:opacity-50`}
                >
                  <option value="">{cityRef ? "Оберіть зі списку" : "Спершу оберіть місто"}</option>
                  {warehouses.map((w) => (
                    <option key={w.ref} value={w.description}>
                      {w.description}
                    </option>
                  ))}
                </select>
                {errors.warehouseName && (
                  <p role="alert" className="mt-1 text-[12px] text-rose-deep">{errors.warehouseName.message}</p>
                )}
              </div>
            ) : (
              <div>
                <label htmlFor="co-addr" className={labelClass}>Вулиця, будинок, квартира *</label>
                <input id="co-addr" autoComplete="street-address" {...register("addressLine")} className={inputClass} />
                {errors.addressLine && (
                  <p role="alert" className="mt-1 text-[12px] text-rose-deep">{errors.addressLine.message}</p>
                )}
              </div>
            )}
          </div>
        </fieldset>

        {/* Оплата */}
        <fieldset>
          <legend className="font-display text-xl font-light">Оплата</legend>
          <div className="mt-4 space-y-2">
            {PAYMENT_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className={`flex cursor-pointer items-start gap-3 border px-4 py-3.5 transition-colors ${
                  watch("paymentMethod") === opt.value ? "border-ink" : "border-line hover:border-muted"
                }`}
              >
                <input
                  type="radio"
                  value={opt.value}
                  {...register("paymentMethod")}
                  className="mt-0.5 h-4 w-4 accent-ink"
                />
                <span>
                  <span className="block text-[14px]">{opt.label}</span>
                  <span className="block text-[12px] text-muted">{opt.hint}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        {/* Коментар */}
        <div>
          <label htmlFor="co-comment" className={labelClass}>Коментар до замовлення</label>
          <textarea id="co-comment" rows={3} {...register("comment")} className={inputClass} />
        </div>
      </div>

      {/* Підсумок */}
      <aside className="h-fit border border-line bg-beige/40 p-6 lg:sticky lg:top-24">
        <h2 className="text-[14px] font-medium uppercase tracking-[0.14em]">Ваше замовлення</h2>
        <ul className="mt-4 divide-y divide-line">
          {items.map((i) => (
            <li key={`${i.slug}-${i.size}`} className="flex items-center gap-3 py-3">
              <span className="relative block h-16 w-12 shrink-0 overflow-hidden bg-beige">
                <Image src={i.image} alt={i.alt} fill sizes="48px" className="object-cover" />
              </span>
              <span className="flex-1 text-[12.5px] leading-snug">
                {i.title}
                <span className="block text-muted">Розмір {i.size} × {i.qty}</span>
              </span>
              <span className="text-[13px] font-medium">{formatPrice(i.price * i.qty)}</span>
            </li>
          ))}
        </ul>

        {/* Промокод */}
        <div className="mt-4">
          <div className="flex gap-2">
            <input
              value={promoInput}
              onChange={(e) => setPromoInput(e.target.value)}
              placeholder="Промокод або сертифікат"
              aria-label="Промокод"
              className="w-full border border-line bg-paper px-3 py-2.5 text-[13px] focus:border-ink focus:outline-none"
            />
            <button
              type="button"
              onClick={onApplyPromo}
              className="whitespace-nowrap border border-ink px-4 text-[12px] font-medium uppercase tracking-[0.1em] transition-colors hover:bg-ink hover:text-paper"
            >
              OK
            </button>
          </div>
          {promo && <p className="mt-1.5 text-[12px] text-ink">✓ {promo.label}</p>}
          {promoError && <p role="alert" className="mt-1.5 text-[12px] text-rose-deep">{promoError}</p>}
        </div>

        <dl className="mt-5 space-y-1.5 border-t border-line pt-4 text-[13.5px]">
          <div className="flex justify-between">
            <dt className="text-muted">Товари</dt>
            <dd>{formatPrice(subtotal)}</dd>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-rose-deep">
              <dt>Знижка</dt>
              <dd>−{formatPrice(discount)}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-muted">Доставка</dt>
            <dd>{freeShipping ? "Безкоштовно" : "за тарифами НП"}</dd>
          </div>
          <div className="flex justify-between pt-2 text-[16px] font-medium">
            <dt>Разом</dt>
            <dd>{formatPrice(total)}</dd>
          </div>
        </dl>

        {submitError && (
          <p role="alert" className="mt-4 border border-rose-deep/40 bg-rose-soft/40 p-3 text-[12.5px] text-rose-deep">
            {submitError}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-5 w-full bg-ink py-4 text-[13px] font-medium uppercase tracking-[0.14em] text-paper transition-colors hover:bg-ink/85 disabled:opacity-50"
        >
          {isSubmitting ? "Оформлюємо…" : "Підтвердити замовлення"}
        </button>
        <p className="mt-3 text-[11.5px] leading-relaxed text-muted">
          Підтверджуючи замовлення, ви погоджуєтесь з умовами{" "}
          <Link href="/oferta" className="underline underline-offset-2">публічної оферти</Link> і{" "}
          <Link href="/konfidentsiynist" className="underline underline-offset-2">політикою конфіденційності</Link>.
        </p>
      </aside>
    </form>
  );
}
