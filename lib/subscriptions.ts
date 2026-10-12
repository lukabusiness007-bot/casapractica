export const subscriptions = [
  {
    "id": "garderoba",
    "name": "Casa Garderoba",
    "description": "Vaša garderoba, spremna za novu nedelju.",
    "price": 1000000,
    "includes": [
      "8 kg standardnog peglanja mesečno",
      "Dva preuzimanja i povratka veša",
      "Dogovoreni termini sa vašim koordinatorom"
    ],
    "excludes": "Pranje, hemijsko čišćenje, košulje i osetljivi komadi obračunavaju se posebno."
  },
  {
    "id": "ritam",
    "name": "Casa Ritam",
    "description": "Male obaveze, redovno preuzete.",
    "price": 1800000,
    "includes": [
      "Četiri dolaska do 90 minuta po ciklusu",
      "Promena jedne posteljine, slaganje garderobe i iznošenje smeća",
      "Sređivanje kuhinjskih površina prema dogovorenoj listi"
    ],
    "excludes": "Generalno čišćenje, dodatni poslovi i majstorski radovi nisu uključeni."
  },
  {
    "id": "na-cuvanju",
    "name": "Casa Na čuvanju",
    "description": "Vaš dom pod pažnjom dok ste odsutni.",
    "price": 1200000,
    "includes": [
      "Dva obilaska do 60 minuta mesečno",
      "Zalivanje do 10 biljaka i preuzimanje pošte",
      "Vizuelna provera doma i foto-izveštaj"
    ],
    "excludes": "Dodatni obilasci i popravke plaćaju se posebno. Paket ne obuhvata stalni nadzor."
  },
  {
    "id": "family",
    "name": "Casa Family",
    "description": "Više kućnih obaveza. Jedan dogovor.",
    "price": 3800000,
    "includes": [
      "Sve iz paketa Casa Ritam i Casa Garderoba",
      "Dve nabavke do 60 minuta, po jedna lokacija",
      "Jedan koordinator za celu kućnu listu"
    ],
    "excludes": "Namirnice i roba plaćaju se po računu. Majstorski radovi imaju zasebnu ponudu."
  }
] as const;
export type SubscriptionId = (typeof subscriptions)[number]["id"];
export function findSubscription(id?: string) { return subscriptions.find((plan) => plan.id === id); }
