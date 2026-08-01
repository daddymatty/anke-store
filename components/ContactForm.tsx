"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { submitContact } from "@/app/actions/contact";
import { pushEvent } from "@/lib/analytics";

const schema = z.object({
  name: z.string().min(2, "Вкажіть ім'я"),
  contact: z.string().min(5, "Вкажіть телефон або email"),
  message: z.string().min(10, "Опишіть звернення докладніше"),
});
type FormData = z.infer<typeof schema>;

/** Форма звернення споживача. */
export function ContactForm() {
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit(async (data) => {
    setServerError(null);
    const res = await submitContact(data);
    if (res.ok) {
      setSent(true);
      pushEvent("generate_lead", { lead_type: "contact_form" });
    } else {
      setServerError(res.error);
    }
  });

  if (sent) {
    return (
      <p className="border border-line bg-beige/50 p-5 text-[14px]">
        Дякуємо! Ми отримали звернення і відповімо протягом робочого дня.
      </p>
    );
  }

  const inputClass =
    "mt-1.5 w-full border border-line px-3.5 py-3 text-[14px] focus:border-ink focus:outline-none";
  const labelClass = "text-[12px] uppercase tracking-[0.12em] text-muted";

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="cf-name" className={labelClass}>Ім&apos;я *</label>
        <input id="cf-name" {...register("name")} className={inputClass} />
        {errors.name && <p role="alert" className="mt-1 text-[12px] text-rose-deep">{errors.name.message}</p>}
      </div>
      <div>
        <label htmlFor="cf-contact" className={labelClass}>Телефон або email *</label>
        <input id="cf-contact" {...register("contact")} className={inputClass} />
        {errors.contact && <p role="alert" className="mt-1 text-[12px] text-rose-deep">{errors.contact.message}</p>}
      </div>
      <div>
        <label htmlFor="cf-message" className={labelClass}>Звернення *</label>
        <textarea id="cf-message" rows={5} {...register("message")} className={inputClass} />
        {errors.message && <p role="alert" className="mt-1 text-[12px] text-rose-deep">{errors.message.message}</p>}
      </div>
      {serverError && <p role="alert" className="text-[12.5px] text-rose-deep">{serverError}</p>}
      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-ink px-8 py-3.5 text-[12px] font-medium uppercase tracking-[0.14em] text-paper disabled:opacity-50"
      >
        {isSubmitting ? "Надсилаємо…" : "Надіслати"}
      </button>
    </form>
  );
}
