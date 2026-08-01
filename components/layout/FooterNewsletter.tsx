"use client";

import { useState } from "react";
import { subscribeGuest } from "@/app/actions/auth";
import type { NewsletterSegment } from "@/lib/profiles";

const SEGMENTS: { value: NewsletterSegment; label: string }[] = [
  { value: "novynky", label: "Новинки" },
  { value: "znyzhky", label: "Знижки" },
  { value: "styling", label: "Стилістика" },
];

/** Сегментована підписка у футері (референс — Katsurina). */
export function FooterNewsletter() {
  const [email, setEmail] = useState("");
  const [segments, setSegments] = useState<NewsletterSegment[]>(["novynky"]);
  const [state, setState] = useState<"idle" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const toggle = (s: NewsletterSegment) =>
    setSegments((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]));

  const submit = async () => {
    setError(null);
    const res = await subscribeGuest(email, segments.length ? segments : ["novynky"]);
    if (res.ok) setState("done");
    else {
      setState("error");
      setError(res.error ?? "Спробуйте ще раз");
    }
  };

  if (state === "done") {
    return <p className="mt-5 text-[13px]">Дякуємо! Перевірте пошту — там лист-підтвердження 💌</p>;
  }

  return (
    <div className="mt-5">
      <p className="text-[12px] font-medium uppercase tracking-[0.16em] text-ink">Розсилка ANKE</p>
      <div className="mt-3 flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="Ваш email"
          aria-label="Email для розсилки"
          className="w-full max-w-60 border border-line bg-paper px-3 py-2.5 text-[13px] focus:border-ink focus:outline-none"
        />
        <button
          type="button"
          onClick={submit}
          className="bg-ink px-4 py-2.5 text-[12px] font-medium uppercase tracking-[0.1em] text-paper"
        >
          →
        </button>
      </div>
      <div className="mt-2.5 flex flex-wrap gap-3">
        {SEGMENTS.map((s) => (
          <label key={s.value} className="flex cursor-pointer items-center gap-1.5 text-[12px] text-muted">
            <input
              type="checkbox"
              checked={segments.includes(s.value)}
              onChange={() => toggle(s.value)}
              className="h-3.5 w-3.5 accent-ink"
            />
            {s.label}
          </label>
        ))}
      </div>
      {error && <p className="mt-1.5 text-[12px] text-rose-deep">{error}</p>}
    </div>
  );
}
