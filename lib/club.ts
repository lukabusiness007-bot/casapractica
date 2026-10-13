import { washingPriceList } from "./washing-pricing";
// All prices are integer RSD minor units, shared by estimates and quote previews.
export const clubDiscountPercent = 5;
export function clubDiscount(amount: number) {
  if (!Number.isSafeInteger(amount) || amount < 0)
    throw new Error("Neispravan iznos.");
  return Math.round((amount * clubDiscountPercent) / 100);
}
export function clubPrice(amount: number) {
  return amount - clubDiscount(amount);
}
export type WashingSelection = {
  area: number;
  method: "wet" | "semi-dry";
  transport: boolean;
};
export function washingEstimate(selection: WashingSelection) {
  if (
    !Number.isFinite(selection.area) ||
    selection.area <= 0 ||
    selection.area > 1000
  )
    throw new Error("Proverite površinu tepiha.");
  const rate =
    washingPriceList[0].items[selection.method === "wet" ? 0 : 1].price!;
  return (
    Math.round(selection.area * rate) +
    (selection.transport ? washingPriceList[1].items[0].price! : 0)
  );
}
export const washingExtras = [
  { key: "upholstery", ...washingPriceList[6].items[0] },
  { key: "single-mattress", ...washingPriceList[6].items[4] },
  { key: "double-mattress", ...washingPriceList[6].items[5] },
] as const;
export type WashingExtra = {
  key: (typeof washingExtras)[number]["key"];
  count: number;
};
export const clubBenefits = [
  {
    title: "5% popusta na usluge",
    text: "Klupska cena važi za članove. Popust se obračunava u konačnoj ponudi.",
  },
  {
    title: "Ponovite bez ponovnog objašnjavanja",
    text: "Prethodna usluga i podaci doma ostaju u nalogu. Novi obim, cenu i termin potvrđujete sa timom.",
  },
  {
    title: "Preporučite i zaradite kredit",
    text: "Po 500 RSD za vas i prijatelja nakon njegove prve izvršene i plaćene usluge od najmanje 10.000 RSD.",
  },
] as const;
export const clubTerms =
  "Članstvo je besplatno. Klupski popust od 5% i kredit za preporuku ne sabiraju se; koristite povoljniju pogodnost. Konačnu cenu potvrđujete pre plaćanja.";

export function normalizePhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("00")) return digits.slice(2);
  return digits.startsWith("0") ? `381${digits.slice(1)}` : digits;
}
