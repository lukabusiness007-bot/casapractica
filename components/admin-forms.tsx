"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Service } from "@/lib/catalog";
import { statusLabels } from "@/lib/catalog";
import { ActionForm } from "./action-form";
export function ServiceEditor({ service }: { service?: Service }) {
  return (
    <ActionForm
      endpoint="/api/admin"
      payload={{ action: "service", ...(service ? { id: service.id } : {}) }}
      label={service ? "Sačuvajte uslugu" : "Dodajte uslugu"}
    >
      <div className="form-row">
        <label>
          Naziv
          <input name="name" required defaultValue={service?.name} />
        </label>
        <label>
          URL oznaka
          <input
            name="slug"
            required
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            defaultValue={service?.slug}
            placeholder="naziv-usluge"
          />
        </label>
      </div>
      <label>
        Kratka poruka
        <input name="tagline" required defaultValue={service?.tagline} />
      </label>
      <label>
        Opis
        <textarea
          name="description"
          required
          minLength={10}
          rows={3}
          defaultValue={service?.description}
        />
      </label>
      <label>
        Fotografija (lokalna putanja ili HTTPS URL)
        <input
          name="image"
          required
          defaultValue={service?.image || "/images/living.jpg"}
        />
      </label>
      <div className="form-row">
        <label>
          Cena od (RSD, prazno = na upit)
          <input
            name="price"
            type="number"
            min="0.01"
            step="0.01"
            defaultValue={service?.price ? service.price / 100 : ""}
          />
        </label>
        <label>
          Redosled
          <input
            name="sort_order"
            type="number"
            min="0"
            max="1000"
            defaultValue={service?.sort_order ?? 6}
          />
        </label>
      </div>
      <label>
        Vidljivost
        <select name="active" defaultValue={String(service?.active ?? true)}>
          <option value="true">Aktivna</option>
          <option value="false">Sakrivena</option>
        </select>
      </label>
    </ActionForm>
  );
}
export type Benefit = {
  id: string;
  title: string;
  description: string;
  discount_percent: number | null;
  member_at: string;
  public_at: string | null;
  ends_at: string | null;
  active: boolean;
};
function localDate(value: string | null | undefined) {
  if (!value) return "";
  const d = new Date(value);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
}
export function TimedForm({
  children,
  payload,
  label,
}: {
  children: React.ReactNode;
  payload: Record<string, unknown>;
  label: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [error, setError] = useState("");
  return (
    <form
      className="form"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError("");
        setMessage("");
        try {
          const values: Record<string, unknown> = Object.fromEntries(
            new FormData(e.currentTarget),
          );
          for (const key of [
            "member_at",
            "public_at",
            "ends_at",
            "appointment_at",
          ]) {
            if (key in values)
              values[key] = values[key]
                ? new Date(String(values[key])).toISOString()
                : null;
          }
          const r = await fetch("/api/admin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...payload, ...values }),
          });
          const d = await r.json();
          if (!r.ok) throw Error(d.error);
          setMessage(d.message);
          router.refresh();
        } catch (e) {
          setError(e instanceof Error ? e.message : "Pokušajte ponovo.");
        } finally {
          setBusy(false);
        }
      }}
    >
      {children}
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {message && (
        <p className="notice" role="status">
          {message}
        </p>
      )}
      <button className="button button-dark" disabled={busy}>
        {busy ? "Čuvamo…" : label}
      </button>
    </form>
  );
}
export function BenefitEditor({ benefit: b }: { benefit?: Benefit }) {
  return (
    <TimedForm
      payload={{ action: "benefit", ...(b ? { id: b.id } : {}) }}
      label="Sačuvajte pogodnost"
    >
      <label>
        Naslov
        <input name="title" required defaultValue={b?.title} />
      </label>
      <label>
        Opis
        <textarea
          name="description"
          required
          minLength={5}
          defaultValue={b?.description}
        />
      </label>
      <label>
        Popust (%) — opciono
        <input
          name="discount_percent"
          type="number"
          min="1"
          max="100"
          defaultValue={b?.discount_percent ?? ""}
        />
      </label>
      <div className="form-row">
        <label>
          Dostupno članicama
          <input
            name="member_at"
            type="datetime-local"
            required
            defaultValue={localDate(b?.member_at)}
          />
        </label>
        <label>
          Javno od (opciono)
          <input
            name="public_at"
            type="datetime-local"
            defaultValue={localDate(b?.public_at)}
          />
        </label>
      </div>
      <label>
        Važi do (opciono)
        <input
          name="ends_at"
          type="datetime-local"
          defaultValue={localDate(b?.ends_at)}
        />
      </label>
      <label>
        Vidljivost
        <select name="active" defaultValue={String(b?.active ?? true)}>
          <option value="true">Aktivna</option>
          <option value="false">Sakrivena</option>
        </select>
      </label>
    </TimedForm>
  );
}
export function RequestEditor({
  id,
  status,
  appointment,
}: {
  id: string;
  status: string;
  appointment: string | null;
}) {
  return (
    <TimedForm payload={{ action: "request", id }} label="Sačuvajte status">
      <div className="form-row">
        <label>
          Status
          <select name="status" defaultValue={status}>
            {Object.entries(statusLabels).map(([v, l]) => (
              <option value={v} key={v}>
                {l}
              </option>
            ))}
          </select>
        </label>
        <label>
          Dogovoreni termin
          <input
            type="datetime-local"
            name="appointment_at"
            defaultValue={localDate(appointment)}
          />
        </label>
      </div>
      <p className="fine-print">
        Termin se prikazuje u lokalnoj zoni ovog uređaja; čuva se kao UTC.
      </p>
    </TimedForm>
  );
}
