"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { clubPrice } from "@/lib/club";
import { money } from "@/lib/catalog";
export type QuoteItem = {
  label: string;
  amount: number;
  kind: "primary" | "addon" | "upgrade" | "travel" | "material";
};
export function QuoteEditor({
  requestId,
  name,
  description,
  items,
  base = 0,
  member,
}: {
  requestId: string;
  name: string;
  description?: string;
  items?: QuoteItem[];
  base?: number;
  member: boolean;
}) {
  const [rows, setRows] = useState(
    items?.length
      ? items.map((item) => ({ ...item, amount: String(item.amount / 100) }))
      : [
          {
            label: name,
            amount: base ? String(base / 100) : "",
            kind: "primary" as QuoteItem["kind"],
          },
        ],
  );
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();
  const total = rows.reduce(
    (sum, item) => sum + Math.round((Number(item.amount) || 0) * 100),
    0,
  );
  return (
    <form
      className="form quote-editor"
      onSubmit={async (event) => {
        event.preventDefault();
        setBusy(true);
        setMessage("");
        try {
          const response = await fetch("/api/admin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "quote",
              request_id: requestId,
              description: new FormData(event.currentTarget).get("description"),
              items: rows.map((row) => ({
                ...row,
                amount: Number(row.amount),
              })),
            }),
          });
          const result = await response.json();
          if (!response.ok) throw new Error(result.error);
          setMessage(result.message);
          router.refresh();
        } catch (error) {
          setMessage(
            error instanceof Error ? error.message : "Ponuda nije sačuvana.",
          );
        } finally {
          setBusy(false);
        }
      }}
    >
      <fieldset disabled={busy} className="request-fields">
        <label>
          Opis dogovorene usluge
          <textarea
            name="description"
            required
            minLength={5}
            maxLength={1000}
            defaultValue={description || name}
          />
        </label>
        {rows.map((row, index) => (
          <div className="quote-item-editor" key={index}>
            <div className="form-row">
              <label>
                Stavka
                <input
                  required
                  minLength={2}
                  maxLength={200}
                  value={row.label}
                  onChange={(event) =>
                    setRows(
                      rows.map((item, i) =>
                        i === index
                          ? { ...item, label: event.target.value }
                          : item,
                      ),
                    )
                  }
                />
              </label>
              <label>
                Iznos stavke (RSD)
                <input
                  required
                  type="number"
                  min="0.01"
                  max="10000000"
                  step="0.01"
                  value={row.amount}
                  onChange={(event) =>
                    setRows(
                      rows.map((item, i) =>
                        i === index
                          ? { ...item, amount: event.target.value }
                          : item,
                      ),
                    )
                  }
                />
              </label>
            </div>
            <label>
              Vrsta stavke
              <select
                value={row.kind}
                onChange={(event) =>
                  setRows(
                    rows.map((item, i) =>
                      i === index
                        ? {
                            ...item,
                            kind: event.target.value as QuoteItem["kind"],
                          }
                        : item,
                    ),
                  )
                }
              >
                <option value="primary">Osnovna usluga</option>
                <option value="addon">Povezana usluga</option>
                <option value="upgrade">Veći obim / dopuna</option>
                <option value="travel">Dolazak / transport</option>
                <option value="material">Materijal</option>
              </select>
            </label>
            {rows.length > 1 && (
              <button
                className="text-link"
                type="button"
                onClick={() => setRows(rows.filter((_, i) => i !== index))}
              >
                Uklonite stavku
              </button>
            )}
          </div>
        ))}
        {rows.length < 12 && (
          <button
            type="button"
            className="button button-light"
            onClick={() =>
              setRows([...rows, { label: "", amount: "", kind: "addon" }])
            }
          >
            Dodajte stavku
          </button>
        )}
        <p>
          Redovna cena: <strong>{money(total)}</strong>
          {member && (
            <>
              {" "}
              · Klupska cena (−5%): <strong>{money(clubPrice(total))}</strong>
            </>
          )}
        </p>
        <p className="fine-print">
          Popust se obračunava na serveru. Član koristi 5% ili jedan važeći
          kredit kada je povoljniji. Svaka stavka mora biti dogovorena sa
          klijentom. Za preuzimanje gostujućeg zahteva klijent potvrđuje isti
          email u nalogu.
        </p>
      </fieldset>
      {message && (
        <p role="status" className="notice">
          {message}
        </p>
      )}
      <button className="button button-dark" disabled={busy}>
        {busy ? "Čuvamo…" : "Sačuvajte ponudu"}
      </button>
    </form>
  );
}
