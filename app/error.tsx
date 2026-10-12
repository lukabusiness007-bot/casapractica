"use client";
import { useTranslation } from "@/components/locale-provider";
export default function ErrorPage({ reset }: { reset: () => void }) {
  const t = useTranslation();

  return (
    <div className="loading">
      <span>{t("Treba nam još jedan trenutak.")}</span>
      <p>{t("Stranica trenutno nije dostupna.")}</p>
      <button className="button button-dark" onClick={reset}>
        {t("Pokušajte ponovo")}
      </button>
    </div>
  );
}
