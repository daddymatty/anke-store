"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { requestLoginCode, verifyLoginCode } from "@/app/actions/auth";
import { pushEvent } from "@/lib/analytics";

/** Вхід без пароля: email → одноразовий код з листа. */
export function LoginForm() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const sendCode = async () => {
    setBusy(true);
    setError(null);
    const res = await requestLoginCode(email);
    setBusy(false);
    if (res.ok) {
      setStep("code");
      setDevCode(res.devCode ?? null);
    } else {
      setError(res.error ?? "Щось пішло не так");
    }
  };

  const confirm = async () => {
    setBusy(true);
    setError(null);
    const res = await verifyLoginCode(email, code);
    setBusy(false);
    if (res.ok) {
      pushEvent("sign_up", { method: "email_otp" });
      router.refresh();
    }
    else setError(res.error ?? "Щось пішло не так");
  };

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="font-display text-display-sm font-light">Особистий кабінет</h1>
      {step === "email" ? (
        <>
          <p className="mt-3 text-[13.5px] leading-relaxed text-muted">
            Без паролів: вкажіть email — надішлемо одноразовий код входу. Замовлення, зроблені з цим
            email, з&apos;являться в кабінеті автоматично.
          </p>
          <label htmlFor="login-email" className="mt-6 block text-[12px] uppercase tracking-[0.12em] text-muted">
            Email
          </label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendCode()}
            className="mt-1.5 w-full border border-line px-3.5 py-3 text-[14px] focus:border-ink focus:outline-none"
          />
          <button
            type="button"
            onClick={sendCode}
            disabled={busy}
            className="mt-4 w-full bg-ink py-3.5 text-[13px] font-medium uppercase tracking-[0.14em] text-paper disabled:opacity-50"
          >
            {busy ? "Надсилаємо…" : "Отримати код"}
          </button>
        </>
      ) : (
        <>
          <p className="mt-3 text-[13.5px] text-muted">
            Ввели {email}.{" "}
            <button type="button" className="underline underline-offset-2" onClick={() => setStep("email")}>
              Змінити
            </button>
          </p>
          {devCode && (
            <p className="mt-3 bg-beige px-3 py-2 text-[12.5px] text-muted">
              Dev-режим (без SMTP): ваш код — <b className="text-ink">{devCode}</b>
            </p>
          )}
          <label htmlFor="login-code" className="mt-5 block text-[12px] uppercase tracking-[0.12em] text-muted">
            Код з листа
          </label>
          <input
            id="login-code"
            inputMode="numeric"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            onKeyDown={(e) => e.key === "Enter" && confirm()}
            className="mt-1.5 w-full border border-line px-3.5 py-3 text-center text-[18px] tracking-[0.4em] focus:border-ink focus:outline-none"
          />
          <button
            type="button"
            onClick={confirm}
            disabled={busy || code.length !== 6}
            className="mt-4 w-full bg-ink py-3.5 text-[13px] font-medium uppercase tracking-[0.14em] text-paper disabled:opacity-50"
          >
            Увійти
          </button>
        </>
      )}
      {error && (
        <p role="alert" className="mt-3 text-[12.5px] text-rose-deep">
          {error}
        </p>
      )}
    </div>
  );
}
