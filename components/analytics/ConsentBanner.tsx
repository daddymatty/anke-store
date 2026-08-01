"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CONSENT_COOKIE } from "@/lib/cookie-names";
import { pushEvent } from "@/lib/analytics";

/**
 * Банер згоди (Consent Mode v2). Дефолт — усе denied (задано в Gtm.tsx);
 * тут лише update після вибору. Вибір живе в cookie 180 днів.
 */

type Consent = { analytics: boolean; ads: boolean };

function readConsent(): Consent | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.split("; ").find((c) => c.startsWith(`${CONSENT_COOKIE}=`));
  if (!m) return null;
  try {
    return JSON.parse(decodeURIComponent(m.slice(CONSENT_COOKIE.length + 1))) as Consent;
  } catch {
    return null;
  }
}

function applyConsent(c: Consent) {
  window.dataLayer = window.dataLayer ?? [];
  // клас gtag-виклику через dataLayer (GTM його підхопить)
  window.dataLayer.push([
    "consent",
    "update",
    {
      analytics_storage: c.analytics ? "granted" : "denied",
      ad_storage: c.ads ? "granted" : "denied",
      ad_user_data: c.ads ? "granted" : "denied",
      ad_personalization: c.ads ? "granted" : "denied",
    },
  ] as unknown as Record<string, unknown>);
  pushEvent("consent_updated", { consent_analytics: c.analytics, consent_ads: c.ads });
}

export function ConsentBanner() {
  const [visible, setVisible] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [ads, setAds] = useState(true);

  useEffect(() => {
    const saved = readConsent();
    if (saved) {
      applyConsent(saved);
    } else {
      const t = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  const save = (c: Consent) => {
    document.cookie = `${CONSENT_COOKIE}=${encodeURIComponent(JSON.stringify(c))}; max-age=${180 * 24 * 3600}; path=/; samesite=lax`;
    applyConsent(c);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Налаштування cookie"
      className="fixed inset-x-3 bottom-3 mx-auto max-w-xl border border-line bg-paper p-5 shadow-soft md:inset-x-auto md:right-6 md:bottom-6"
      style={{ zIndex: "var(--z-consent)" }}
    >
      <p className="text-[13px] leading-relaxed text-muted">
        Ми використовуємо cookie для роботи сайту, аналітики і персоналізованої реклами.
        Детальніше — у{" "}
        <Link href="/cookie" className="text-ink underline underline-offset-2">
          політиці cookie
        </Link>
        .
      </p>

      {settingsOpen && (
        <div className="mt-3 space-y-2 border-t border-line pt-3">
          <label className="flex items-center gap-2.5 text-[13px]">
            <input type="checkbox" checked disabled className="h-4 w-4 accent-ink" />
            Необхідні (завжди увімкнені)
          </label>
          <label className="flex items-center gap-2.5 text-[13px]">
            <input
              type="checkbox"
              checked={analytics}
              onChange={(e) => setAnalytics(e.target.checked)}
              className="h-4 w-4 accent-ink"
            />
            Аналітика (GA4)
          </label>
          <label className="flex items-center gap-2.5 text-[13px]">
            <input
              type="checkbox"
              checked={ads}
              onChange={(e) => setAds(e.target.checked)}
              className="h-4 w-4 accent-ink"
            />
            Реклама (Google Ads, Meta)
          </label>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => save({ analytics: true, ads: true })}
          className="bg-ink px-5 py-2.5 text-[12px] font-medium uppercase tracking-[0.12em] text-paper"
        >
          Прийняти все
        </button>
        {settingsOpen ? (
          <button
            type="button"
            onClick={() => save({ analytics, ads })}
            className="border border-ink px-5 py-2.5 text-[12px] font-medium uppercase tracking-[0.12em]"
          >
            Зберегти вибір
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            className="border border-line px-5 py-2.5 text-[12px] font-medium uppercase tracking-[0.12em] text-muted hover:border-ink hover:text-ink"
          >
            Налаштувати
          </button>
        )}
        <button
          type="button"
          onClick={() => save({ analytics: false, ads: false })}
          className="px-4 py-2.5 text-[12px] uppercase tracking-[0.12em] text-muted underline-offset-4 hover:underline"
        >
          Лише необхідні
        </button>
      </div>
    </div>
  );
}
