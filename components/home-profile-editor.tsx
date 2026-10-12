"use client";
import { ActionForm } from "./action-form";
import { useTranslation } from "./locale-provider";
import type { HomeProfile } from "@/lib/home-profile";
export function HomeProfileEditor({ home }: { home?: HomeProfile }) {
  const t = useTranslation();
  return (
    <details className="home-profile-editor">
      <summary>{home ? home.label : t("Dodajte svoj dom")}</summary>
      <ActionForm
        endpoint="/api/dom"
        label={t("Sačuvajte profil doma")}
        payload={home?.id ? { id: home.id } : {}}
      >
        <div className="form-row">
          <label>
            {t("Naziv doma")}
            <input
              name="label"
              required
              minLength={2}
              maxLength={100}
              defaultValue={home?.label}
              placeholder={t("Moj stan")}
            />
          </label>
          <label>
            {t("Vrsta nekretnine")}
            <select
              name="property_type"
              defaultValue={home?.property_type || "apartment"}
            >
              <option value="apartment">{t("Stan")}</option>
              <option value="house">{t("Kuća")}</option>
            </select>
          </label>
        </div>
        <label>
          {t("Lokacija u Beogradu")}
          <input
            name="location"
            required
            minLength={2}
            maxLength={240}
            defaultValue={home?.location}
          />
        </label>
        <label>
          {t("Uređaji i modeli")}
          <textarea
            name="appliances"
            maxLength={1500}
            defaultValue={home?.appliances}
            rows={3}
          />
        </label>
        <label>
          {t("Vaše navike i želje")}
          <textarea
            name="preferences"
            maxLength={1500}
            defaultValue={home?.preferences}
            rows={3}
            placeholder={t("Sprat, lift, kućni red i željeni termin dolaska…")}
          />
        </label>
        <label>
          {t("Naredni zadaci")}
          <textarea
            name="future_tasks"
            maxLength={1500}
            defaultValue={home?.future_tasks}
            rows={3}
          />
        </label>
        <label>
          {t("Podsetnik za održavanje")}
          <input
            name="maintenance_due"
            type="date"
            defaultValue={home?.maintenance_due || ""}
          />
        </label>
        <p className="fine-print">
          {t(
            "Ne unosite šifre, pristupne kodove ili podatke kartice. Profil je dostupan vama i ovlašćenom timu.",
          )}
        </p>
      </ActionForm>
    </details>
  );
}
