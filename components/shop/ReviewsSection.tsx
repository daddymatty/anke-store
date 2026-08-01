"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { submitReview } from "@/app/actions/reviews";
import type { ProductReview } from "@/lib/catalog/types";

/** Зірки рейтингу (заповнені/порожні) */
export function Stars({ value, className = "" }: { value: number; className?: string }) {
  return (
    <span className={`inline-flex gap-0.5 ${className}`} aria-hidden="true">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} viewBox="0 0 20 20" className="h-4 w-4" fill={i <= Math.round(value) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.2">
          <path d="M10 1.8 12.5 7l5.7.6-4.3 3.9 1.2 5.6L10 14.3 4.9 17l1.2-5.6L1.8 7.6 7.5 7 10 1.8Z" />
        </svg>
      ))}
    </span>
  );
}

const reviewSchema = z.object({
  author: z.string().min(2, "Вкажіть ім'я"),
  rating: z.coerce.number<number>().int().min(1, "Поставте оцінку").max(5),
  text: z.string().min(10, "Напишіть хоча б речення"),
});
type ReviewFormData = z.infer<typeof reviewSchema>;

/**
 * Відгуки: список схвалених + форма (потрапляє на модерацію).
 * AggregateRating для Schema.org рендерить SEO-шар (Етап 8).
 */
export function ReviewsSection({
  slug,
  reviews,
  rating,
}: {
  slug: string;
  reviews: ProductReview[];
  rating?: { value: number; count: number };
}) {
  const [formOpen, setFormOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const approved = reviews.filter((r) => r.approved);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ReviewFormData>({ resolver: zodResolver(reviewSchema), defaultValues: { rating: 5 } });

  const onSubmit = handleSubmit(async (data) => {
    const res = await submitReview({ slug, ...data });
    if (res.ok) {
      setSent(true);
      setFormOpen(false);
    }
  });

  return (
    <section aria-labelledby="reviews-title" className="mt-20 border-t border-line pt-10" id="reviews">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 id="reviews-title" className="font-display text-display-sm font-light">
            Відгуки
          </h2>
          {rating && (
            <p className="mt-2 flex items-center gap-2 text-[13px] text-muted">
              <Stars value={rating.value} className="text-ink" />
              {rating.value} з 5 · {rating.count}{" "}
              {rating.count === 1 ? "відгук" : rating.count < 5 ? "відгуки" : "відгуків"}
            </p>
          )}
        </div>
        {!sent && (
          <button
            type="button"
            onClick={() => setFormOpen((v) => !v)}
            className="border border-ink px-6 py-2.5 text-[12px] font-medium uppercase tracking-[0.14em] transition-colors hover:bg-ink hover:text-paper"
          >
            Написати відгук
          </button>
        )}
      </div>

      {sent && (
        <p className="mt-6 border border-line bg-beige/50 p-4 text-[13px]">
          Дякуємо! Відгук з&apos;явиться після модерації.
        </p>
      )}

      {formOpen && !sent && (
        <form onSubmit={onSubmit} className="mt-6 max-w-lg space-y-4 border border-line p-5">
          <div>
            <label htmlFor="rev-author" className="text-[12px] uppercase tracking-[0.12em] text-muted">
              Ім&apos;я
            </label>
            <input
              id="rev-author"
              {...register("author")}
              className="mt-1.5 w-full border border-line px-3 py-2.5 text-[13px] focus:border-ink focus:outline-none"
            />
            {errors.author && <p role="alert" className="mt-1 text-[12px] text-rose-deep">{errors.author.message}</p>}
          </div>
          <div>
            <label htmlFor="rev-rating" className="text-[12px] uppercase tracking-[0.12em] text-muted">
              Оцінка
            </label>
            <select
              id="rev-rating"
              {...register("rating")}
              className="mt-1.5 w-full border border-line bg-paper px-3 py-2.5 text-[13px] focus:border-ink focus:outline-none"
            >
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>
                  {"★".repeat(n)}{"☆".repeat(5 - n)} — {n}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="rev-text" className="text-[12px] uppercase tracking-[0.12em] text-muted">
              Відгук
            </label>
            <textarea
              id="rev-text"
              rows={4}
              {...register("text")}
              className="mt-1.5 w-full border border-line px-3 py-2.5 text-[13px] focus:border-ink focus:outline-none"
            />
            {errors.text && <p role="alert" className="mt-1 text-[12px] text-rose-deep">{errors.text.message}</p>}
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-ink px-8 py-3 text-[12px] font-medium uppercase tracking-[0.14em] text-paper disabled:opacity-50"
          >
            Надіслати
          </button>
        </form>
      )}

      {approved.length > 0 ? (
        <ul className="mt-8 space-y-6">
          {approved.map((r) => (
            <li key={r.id} className="border-b border-line pb-6 last:border-0">
              <div className="flex items-center gap-3">
                <span className="text-[13px] font-medium">{r.author}</span>
                <Stars value={r.rating} className="text-ink" />
                <time dateTime={r.date} className="text-[12px] text-muted">
                  {new Date(r.date).toLocaleDateString("uk-UA", { day: "numeric", month: "long", year: "numeric" })}
                </time>
              </div>
              <p className="mt-2 max-w-2xl text-[13.5px] leading-relaxed text-muted">{r.text}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-8 text-[13px] text-muted">Відгуків поки немає — станьте першою.</p>
      )}
    </section>
  );
}
