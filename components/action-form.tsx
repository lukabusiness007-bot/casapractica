"use client";
import { localePath } from "@/lib/i18n/routing";
import { useLocale, useTranslation } from "@/components/locale-provider";
import { useState } from "react";
import { useRouter } from "next/navigation";
export function ActionForm({
  endpoint,
  children,
  label = "Sačuvaj",
  className = "",
  payload = {},
  disabled = false,
  redirect,
}: {
  endpoint: string;
  children?: React.ReactNode;
  label?: string;
  className?: string;
  payload?: Record<string, unknown>;
  disabled?: boolean;
  redirect?: string;
}) {
  const t = useTranslation();
  const locale = useLocale();

  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [success, setSuccess] = useState("");
  const router = useRouter();
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      const fields = Object.fromEntries(new FormData(e.currentTarget));
      const r = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, ...fields, locale }),
      });
      const data = await r.json();
      if (!r.ok) throw Error(data.error || t("Pokušajte ponovo."));
      if (data.url) {
        window.location.assign(data.url);
        return;
      }
      if (redirect) {
        router.push(localePath(redirect, locale));
        router.refresh();
        return;
      }
      setSuccess(t(data.message || "Sačuvano."));
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? t(e.message) : t("Radnja nije uspela."));
    } finally {
      setBusy(false);
    }
  }
  return (
    <form onSubmit={submit} className={`form ${className}`}>
      {children}
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {success && (
        <p className="notice" role="status">
          {success}
        </p>
      )}
      <button className="button button-dark" disabled={disabled || busy}>
        {busy ? t("Trenutak…") : t(label)}
      </button>
    </form>
  );
}
