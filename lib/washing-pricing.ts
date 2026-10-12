export type WashingPriceItem = {
  name: string;
  detail?: string;
  price: number | null;
  maxPrice?: number;
  unit?: string;
};

// User-supplied price list, doubled exactly. Amounts are integer RSD minor units.
// Units are preserved as supplied, including m² for carpet edge binding.
export const washingPriceList: { title: string; items: WashingPriceItem[] }[] = [
  {
    title: "Pranje tepiha",
    items: [
      { name: "Dubinsko, mokro pranje", detail: "Sintetika, šegi, vuneni i debeli tepisi", price: 98000, unit: "po m²" },
      { name: "Polusuvo pranje bez ispiranja", detail: "Persijski, svileni i viskozni tepisi", price: 120000, unit: "po m²" },
    ],
  },
  {
    title: "Transport",
    items: [{ name: "Odvoz i dovoz tepiha", price: 100000, unit: "po usluzi" }],
  },
  {
    title: "Pranje jorgana i ćebadi",
    items: [
      { name: "Pranje jorgana", price: 98000, unit: "po m²" },
      { name: "Pranje ćebadi", price: 98000, unit: "po m²" },
    ],
  },
  {
    title: "Opšivanje tepiha",
    items: [
      { name: "Tanji tepisi", price: 78000, unit: "po m²" },
      { name: "Deblji tepisi sa zaštitnom trakom", price: 160000, unit: "po m²" },
    ],
  },
  {
    title: "Zamena resa",
    items: [
      { name: "Ručne, pamučne rese", price: 200000, unit: "po dužnom metru" },
      { name: "Ručne, pamučne rese sa zaštitnom trakom", price: 280000, unit: "po dužnom metru" },
      { name: "Vunene rese", price: 300000, unit: "po dužnom metru" },
      { name: "Vunene rese sa zaštitnom trakom", price: 380000, unit: "po dužnom metru" },
      { name: "Svilene rese", price: 320000, unit: "po dužnom metru" },
      { name: "Svilene rese sa zaštitnom trakom", price: 400000, unit: "po dužnom metru" },
    ],
  },
  {
    title: "Lepljenje trake",
    items: [{ name: "Bela mašinska ili postojeća traka", price: 100000, unit: "po dužnom metru" }],
  },
  {
    title: "Pranje nameštaja",
    items: [
      { name: "Pranje nameštaja", price: 240000, unit: "po sedećem mestu" },
      { name: "Stolice", detail: "Bez ili sa naslonom", price: 80000, maxPrice: 90000, unit: "po komadu" },
      { name: "Tabure", price: null },
      { name: "Dečji dušek", price: 200000, unit: "po komadu" },
      { name: "Singl dušek za jednu osobu", price: 400000, unit: "po komadu" },
      { name: "Dušek za bračni krevet", price: 600000, unit: "po komadu" },
    ],
  },
];
