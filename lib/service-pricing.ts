export type ServicePricing = { price: number; scope: string; unit: string };

// Indicative standard jobs researched on 12 October 2026; amounts are RSD minor units.
// Rounded to the nearest 500 RSD, or 100 RSD for prices below 1,000 RSD.
export const servicePricing: Record<string, ServicePricing> = {
  "pranje-tepiha": {
    "price": 90000,
    "scope": "Standardni mašinski tepih",
    "unit": "po m²"
  },
  "ugradnja-tv-a": {
    "price": 1100000,
    "scope": "TV do 55 inča, standardni nosač",
    "unit": "po poslu"
  },
  "servis-klime": {
    "price": 850000,
    "scope": "Redovan servis 9/12.000 BTU",
    "unit": "po uređaju"
  },
  "kacenje-slika-i-ogledala": {
    "price": 800000,
    "scope": "Kačenje slike / manjeg ogledala",
    "unit": "po poslu"
  },
  "montaza-polica": {
    "price": 1150000,
    "scope": "Jedna zidna polica, 2 rupe",
    "unit": "po poslu"
  },
  "postavljanje-garnisni": {
    "price": 1000000,
    "scope": "Jedna standardna garnišna",
    "unit": "po komadu"
  },
  "sklapanje-namestaja": {
    "price": 1300000,
    "scope": "Jedna standardna komoda",
    "unit": "po komadu"
  },
  "podesavanje-vrata-i-fioka": {
    "price": 600000,
    "scope": "Podešavanje vrata kuhinjskih elemenata",
    "unit": "po poslu"
  },
  "obnova-silikona": {
    "price": 700000,
    "scope": "Silikoniranje jedne sanitarije",
    "unit": "po poslu"
  },
  "vodoinstalaterske-intervencije": {
    "price": 950000,
    "scope": "Zamena standardne slavine",
    "unit": "po poslu"
  },
  "elektricarske-intervencije": {
    "price": 850000,
    "scope": "Zamena jedne šuko utičnice",
    "unit": "po poslu"
  },
  "odrzavanje-filtera": {
    "price": 1000000,
    "scope": "Zamena filtera aspiratora",
    "unit": "po poslu"
  },
  "podesavanje-wifi-mreze": {
    "price": 300000,
    "scope": "Podešavanje jednog rutera",
    "unit": "po uređaju"
  },
  "pametni-uredjaji": {
    "price": 900000,
    "scope": "Ugradnja jedne pametne utičnice",
    "unit": "po uređaju"
  },
  "nega-garderobe": {
    "price": 90000,
    "scope": "Standardni veš, samo peglanje",
    "unit": "po kg"
  },
  "pakovanje-i-raspakivanje": {
    "price": 1600000,
    "scope": "Pakovanje stvari za selidbu",
    "unit": "po poslu"
  },
  "elektroinstalacije": {
    "price": 2050000,
    "scope": "Nova tabla do 12 osigurača, na zid",
    "unit": "po poslu"
  },
  "odgusenje-odvoda": {
    "price": 1000000,
    "scope": "Odgušenje tuša / podnog slivnika",
    "unit": "po poslu"
  },
  "bojleri-pumpe-i-cevi": {
    "price": 1350000,
    "scope": "Montaža bojlera 30–80 L",
    "unit": "po poslu"
  },
  "montaza-i-servis-roletni": {
    "price": 1100000,
    "scope": "Montaža jedne roletne",
    "unit": "po prozoru"
  },
  "popravka-vrata-i-prozora": {
    "price": 950000,
    "scope": "Podešavanje vrata / prozora",
    "unit": "po poslu"
  },
  "zaptivanje-i-komarnici": {
    "price": 1000000,
    "scope": "Popravka jednog komarnika",
    "unit": "po poslu"
  },
  "pametna-zvona-kamere-i-brave": {
    "price": 1850000,
    "scope": "Montaža jedne elektronske brave",
    "unit": "po poslu"
  },
  "ciscenje-oluka": {
    "price": 4000000,
    "scope": "Prizemna kuća do 100 m² / do 5 m visine",
    "unit": "po objektu"
  }
};
