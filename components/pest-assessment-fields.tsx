"use client";
import { useTranslation } from "./locale-provider";
import { propertyTypes, pestTypes, protectionPlans } from "@/lib/pest-assessment";

export function PestAssessmentFields({ slug, collectionId }: { slug: string; collectionId?: string }) {
  const t = useTranslation();
  const defaults: Record<string, string> = {
    deratizacija: "rodents", dezinsekcija: "unknown", dezinfekcija: "prevention",
    "tretman-protiv-stenica": "bedbugs", "uklanjanje-gnezda-osa-i-strsljena": "wasps",
    "preventivna-ddd-zastita": "prevention", "sanacija-budji": "mould",
    "uklanjanje-neprijatnih-mirisa": "mould",
  };
  const plan = collectionId === "zastita-zgrade" ? "building" : collectionId === "zastita-poslovnog-prostora" ? "business" : collectionId === "zastita-doma" ? "home" : "assessment";
  return (
    <div className="pest-assessment">
      <h2>{t("Detalji za procenu prostora")}</h2>
      <div className="form-row">
        <label>{t("Tip prostora")}
          <select name="pest_property" required defaultValue={plan === "building" || plan === "business" ? plan : "apartment"}>
            {Object.entries(propertyTypes).map(([value, label]) => <option value={value} key={value}>{t(label)}</option>)}
          </select>
        </label>
        <label>{t("Približna kvadratura (m²)")}
          <input name="pest_area" type="number" min="0.1" max="100000" step="0.1" placeholder={t("Ako znate površinu")} />
        </label>
      </div>
      <label>{t("Šta primećujete?")}
        <select name="pest_type" required defaultValue={defaults[slug] || "unknown"}>
          {Object.entries(pestTypes).map(([value, label]) => <option value={value} key={value}>{t(label)}</option>)}
        </select>
      </label>
      <label>{t("Gde se problem javlja i koliko dugo traje?")}
        <textarea name="pest_affected" rows={2} maxLength={500} />
      </label>
      <label>{t("Prethodni tretmani i datum, ako ih je bilo")}
        <textarea name="pest_previous" rows={2} maxLength={500} />
      </label>
      <label>{t("Plan zaštite")}
        <select name="pest_plan" defaultValue={plan}>
          {Object.entries(protectionPlans).map(([value, label]) => <option value={value} key={value}>{t(label)}</option>)}
        </select>
      </label>
      <label className="inline-check"><input name="pest_children" type="checkbox" /><span>{t("U prostoru borave deca")}</span></label>
      <label className="inline-check"><input name="pest_pets" type="checkbox" /><span>{t("U prostoru borave kućni ljubimci")}</span></label>
      <p className="fine-print">{t("Fotografije možete poslati na WhatsApp nakon slanja zahteva ili tokom dogovora sa timom.")}</p>
    </div>
  );
}
