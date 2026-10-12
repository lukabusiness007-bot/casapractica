import { servicePricing } from "./service-pricing";
import { additionalServices } from "./catalog-additions";
export type Service = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  image: string;
  price: number | null;
  active: boolean;
  sort_order: number;
};
export const serviceCategories = [
  {
    "id": "electrical",
    "title": "Elektrika i rasveta",
    "tagline": "Svetlo, sigurnost i pouzdane instalacije.",
    "description": "Svetlo, sigurnost i pouzdane instalacije."
  },
  {
    "id": "plumbing",
    "title": "Vodovod i sanitarije",
    "tagline": "Od slavine koja kaplje do novih sanitarija.",
    "description": "Od slavine koja kaplje do novih sanitarija."
  },
  {
    "id": "maintenance",
    "title": "Popravke i održavanje",
    "tagline": "Redovna briga, u kući i oko nje.",
    "description": "Redovna briga, u kući i oko nje."
  },
  {
    "id": "window-treatments",
    "title": "Zavese, roletne i žaluzine",
    "tagline": "Lepše svetlo. Više privatnosti.",
    "description": "Lepše svetlo. Više privatnosti."
  },
  {
    "id": "doors-windows",
    "title": "Vrata i prozori",
    "tagline": "Otvaranje sa lakoćom, zatvaranje bez brige.",
    "description": "Otvaranje sa lakoćom, zatvaranje bez brige."
  },
  {
    "id": "walls",
    "title": "Zidovi i gipsani radovi",
    "tagline": "Uredne površine, do poslednjeg detalja.",
    "description": "Uredne površine, do poslednjeg detalja."
  },
  {
    "id": "mounting",
    "title": "Montaža i postavljanje",
    "tagline": "TV, slike, ogledala i police na svom mestu.",
    "description": "TV, slike, ogledala i police na svom mestu."
  },
  {
    "id": "furniture",
    "title": "Nameštaj: montaža i popravke",
    "tagline": "Stabilno, funkcionalno i spremno za korišćenje.",
    "description": "Stabilno, funkcionalno i spremno za korišćenje."
  },
  {
    "id": "technology",
    "title": "Tehnologija u domu",
    "tagline": "Pametni uređaji, Wi-Fi i povezan dom.",
    "description": "Pametni uređaji, Wi-Fi i povezan dom."
  },
  {
    "id": "gutters",
    "title": "Oluci i odvod kišnice",
    "tagline": "Čisti oluci i kišnica na pravom putu.",
    "description": "Čisti oluci i kišnica na pravom putu."
  },
  {
    "id": "everyday",
    "title": "Svakodnevna briga",
    "tagline": "Garderoba, posteljina, nabavka i male obaveze uz pažnju prema vašim navikama.",
    "description": "Garderoba, posteljina, nabavka i male obaveze uz pažnju prema vašim navikama."
  }
] as const;
export type ServiceCategory = (typeof serviceCategories)[number]["id"];
const categoriesBySlug: Record<string, ServiceCategory> = {
  "pranje-tepiha": "everyday",
  "iznosenje-smeca": "everyday",
  "ugradnja-tv-a": "mounting",
  "zamena-sijalica": "electrical",
  "servis-klime": "maintenance",
  "kacenje-slika-i-ogledala": "mounting",
  "montaza-polica": "mounting",
  "postavljanje-garnisni": "window-treatments",
  "sklapanje-namestaja": "furniture",
  "podesavanje-vrata-i-fioka": "furniture",
  "obnova-silikona": "maintenance",
  "sitne-popravke-zidova": "walls",
  "vodoinstalaterske-intervencije": "plumbing",
  "elektricarske-intervencije": "electrical",
  "odrzavanje-filtera": "maintenance",
  "podesavanje-tv-a": "technology",
  "podesavanje-wifi-mreze": "technology",
  "pametni-uredjaji": "technology",
  "nega-garderobe": "everyday",
  "sveza-posteljina": "everyday",
  "organizacija-doma": "everyday",
  "licna-nabavka": "everyday",
  "paketi-i-hemijsko-ciscenje": "everyday",
  "dom-na-cuvanju": "everyday",
  "pakovanje-i-raspakivanje": "everyday",
  "dom-spreman-za-goste": "everyday",
  "ventilatori-i-ventilacija": "electrical",
  "detektori-dima": "electrical",
  "elektroinstalacije": "electrical",
  "odgusenje-odvoda": "plumbing",
  "mlin-za-otpatke": "plumbing",
  "bojleri-pumpe-i-cevi": "plumbing",
  "odrzavanje-kucnih-aparata": "maintenance",
  "terase-i-spoljne-povrsine": "maintenance",
  "preventivni-pregled-doma": "maintenance",
  "krov-temelji-i-dimnjak": "maintenance",
  "montaza-i-servis-roletni": "window-treatments",
  "zavese-i-roletne-po-meri": "window-treatments",
  "popravka-vrata-i-prozora": "doors-windows",
  "zaptivanje-i-komarnici": "doors-windows",
  "ugradnja-i-obnova-prozora": "doors-windows",
  "gipsani-radovi-i-sanacija": "walls",
  "nosaci-i-organizacija-garaze": "mounting",
  "ugradnja-zvucnih-sistema": "technology",
  "vertikalne-baste": "maintenance",
  "popravka-i-ucvrscivanje-namestaja": "furniture",
  "tapaciranje-i-mehanizmi": "furniture",
  "pametna-zvona-kamere-i-brave": "technology",
  "mrezna-dijagnostika-i-bezbednost": "technology",
  "punjaci-za-elektricna-vozila": "technology",
  "ciscenje-oluka": "gutters",
  "popravka-i-podesavanje-oluka": "gutters",
  "usmeravanje-i-sakupljanje-kisnice": "gutters",
  "zamena-i-zastita-oluka": "gutters"
};
export const packageServiceId = "ca5a0000-0000-4000-8000-000000000100";
export function serviceCategory(
  service: Pick<Service, "slug">,
): ServiceCategory {
  return categoriesBySlug[service.slug] || "everyday";
}
export function isIndividualService(service: Pick<Service, "id" | "slug">) {
  return service.id !== packageServiceId && service.slug !== "moja-casa";
}
export const services: Service[] = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    slug: "pranje-tepiha",
    name: "Pranje tepiha",
    tagline: "Svežina koju vaš dom zaslužuje.",
    description:
      "Osvežite svoj omiljeni kutak. Pošaljite nam dimenzije i vrstu tepiha, a pre potvrde dogovorićemo način preuzimanja, pranje i povratak.",
    image: "/images/carpet.jpg",
    price: null,
    active: true,
    sort_order: 1,
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    slug: "iznosenje-smeca",
    name: "Iznošenje smeća",
    tagline: "Jedna obaveza manje. Svakog dana.",
    description:
      "Diskretno preuzimanje kućnog smeća i reciklaže u dogovorenom terminu, zamena kese i uredan prostor oko kante. Navedite količinu, sprat i lift; redovne dolaske planiramo prema vašoj adresi.",
    image: "/images/kitchen.jpg",
    price: null,
    active: true,
    sort_order: 2,
  },
  {
    id: "33333333-3333-4333-8333-333333333333",
    slug: "ugradnja-tv-a",
    name: "Montaža TV-a",
    tagline: "Vaše malo kućno bioskopsko veče.",
    description:
      "Provera zida i nosača, dogovor o visini, zaštita prostora, montaža i povezivanje televizora. Uređujemo kablove i prostor nakon rada; nosač i skrivanje kablova u zidu navodimo posebno u ponudi.",
    image: "/images/living.jpg",
    price: null,
    active: true,
    sort_order: 3,
  },
  {
    id: "44444444-4444-4444-8444-444444444444",
    slug: "zamena-sijalica",
    name: "Zamena sijalica",
    tagline: "Mala promena. Lepše svetlo.",
    description:
      "Vratite toplinu u svaki kutak doma. Navedite broj sijalica, vrstu rasvete i visinu plafona. Nabavku sijalica dogovaramo pre dolaska.",
    image: "/images/lamp.jpg",
    price: null,
    active: true,
    sort_order: 4,
  },
  {
    id: "55555555-5555-4555-8555-555555555555",
    slug: "servis-klime",
    name: "Servis klime",
    tagline: "Savršena temperatura za vaš mir.",
    description:
      "Za prijatnije dane kod kuće. Navedite model klime, pristupačnost uređaja i da li vam je potrebno redovno održavanje ili pregled kvara.",
    image: "/images/air.jpg",
    price: null,
    active: true,
    sort_order: 5,
  },
  {
    id: "ca5a0000-0000-4000-8000-000000000006",
    slug: "kacenje-slika-i-ogledala",
    name: "Kačenje slika i ogledala",
    tagline: "Sve na svom mestu.",
    description:
      "Dogovaramo raspored i visinu, proveravamo zid i pričvršćenja, postavljamo slike ili ogledala i ostavljamo prostor urednim.",
    image: "/images/living.jpg",
    price: null,
    active: true,
    sort_order: 6,
  },
  {
    id: "ca5a0000-0000-4000-8000-000000000007",
    slug: "montaza-polica",
    name: "Montaža polica i nosača",
    tagline: "Sve na svom mestu.",
    description:
      "Postavljamo police, zidne nosače i kupatilske dodatke uz proveru podloge, nosivosti i položaja. Materijal i obim dogovaramo pre dolaska.",
    image: "/images/living.jpg",
    price: null,
    active: true,
    sort_order: 7,
  },
  {
    id: "ca5a0000-0000-4000-8000-000000000008",
    slug: "postavljanje-garnisni",
    name: "Postavljanje garnišni i zavesa",
    tagline: "Sve na svom mestu.",
    description:
      "Montiramo garnišne, postavljamo zavese i podešavamo dostupne mehanizme roletni. Mere, podlogu i potrebne delove dogovaramo unapred.",
    image: "/images/living.jpg",
    price: null,
    active: true,
    sort_order: 8,
  },
  {
    id: "ca5a0000-0000-4000-8000-000000000009",
    slug: "sklapanje-namestaja",
    name: "Sklapanje nameštaja",
    tagline: "Sve na svom mestu.",
    description:
      "Sklapamo komode, stolove, stolice i drugi nameštaj prema uputstvu, podešavamo elemente i sređujemo ambalažu nakon rada.",
    image: "/images/living.jpg",
    price: null,
    active: true,
    sort_order: 9,
  },
  {
    id: "ca5a0000-0000-4000-8000-000000000010",
    slug: "podesavanje-vrata-i-fioka",
    name: "Podešavanje vrata i fioka",
    tagline: "Detalji pod kontrolom.",
    description:
      "Podešavamo šarke i klizače, zatežemo spojeve i menjamo dogovorene ručke ili okove, za nameštaj koji ponovo radi sa lakoćom.",
    image: "/images/kitchen.jpg",
    price: null,
    active: true,
    sort_order: 10,
  },
  {
    id: "ca5a0000-0000-4000-8000-000000000011",
    slug: "obnova-silikona",
    name: "Obnova silikona",
    tagline: "Detalji pod kontrolom.",
    description:
      "Uklanjamo dotrajali silikon i obnavljamo dogovorene spojeve oko kade, tuša ili sudopere. Obim i vreme sušenja potvrđujemo pre rada.",
    image: "/images/kitchen.jpg",
    price: null,
    active: true,
    sort_order: 11,
  },
  {
    id: "ca5a0000-0000-4000-8000-000000000012",
    slug: "sitne-popravke-zidova",
    name: "Sitne popravke zidova",
    tagline: "Detalji pod kontrolom.",
    description:
      "Popunjavamo manje rupe i oštećenja i radimo lokalne popravke boje. Nijansu, materijal i površinu usaglašavamo pre dolaska.",
    image: "/images/living.jpg",
    price: null,
    active: true,
    sort_order: 12,
  },
  {
    id: "ca5a0000-0000-4000-8000-000000000013",
    slug: "vodoinstalaterske-intervencije",
    name: "Vodoinstalaterske intervencije",
    tagline: "Detalji pod kontrolom.",
    description:
      "Naš stručni tim pregleda slavine, sifone i vodokotliće i izvodi dogovorene manje popravke ili zamene. Delove navodimo posebno u ponudi.",
    image: "/images/kitchen.jpg",
    price: null,
    active: true,
    sort_order: 13,
  },
  {
    id: "ca5a0000-0000-4000-8000-000000000014",
    slug: "elektricarske-intervencije",
    name: "Električarske intervencije",
    tagline: "Detalji pod kontrolom.",
    description:
      "Naš stručni tim obavlja dogovorene popravke i zamene rasvete, prekidača i utičnica nakon provere instalacije i obima posla.",
    image: "/images/lamp.jpg",
    price: null,
    active: true,
    sort_order: 14,
  },
  {
    id: "ca5a0000-0000-4000-8000-000000000015",
    slug: "odrzavanje-filtera",
    name: "Održavanje dostupnih filtera",
    tagline: "Detalji pod kontrolom.",
    description:
      "Čistimo ili menjamo dostupne filtere aspiratora i kućnih uređaja prema uputstvu proizvođača. Model i potrošni materijal proveravamo unapred.",
    image: "/images/air.jpg",
    price: null,
    active: true,
    sort_order: 15,
  },
  {
    id: "ca5a0000-0000-4000-8000-000000000016",
    slug: "podesavanje-tv-a",
    name: "Podešavanje TV-a i zvuka",
    tagline: "Povezano sa lakoćom.",
    description:
      "Povezujemo televizor, soundbar i postojeće uređaje, podešavamo dostupne aplikacije i pokazujemo vam osnovne funkcije.",
    image: "/images/living.jpg",
    price: null,
    active: true,
    sort_order: 16,
  },
  {
    id: "ca5a0000-0000-4000-8000-000000000017",
    slug: "podesavanje-wifi-mreze",
    name: "Podešavanje Wi-Fi mreže",
    tagline: "Povezano sa lakoćom.",
    description:
      "Podešavamo ruter i pojačivače signala, povezujemo uređaje i proveravamo vezu u dogovorenim prostorijama.",
    image: "/images/living.jpg",
    price: null,
    active: true,
    sort_order: 17,
  },
  {
    id: "ca5a0000-0000-4000-8000-000000000018",
    slug: "pametni-uredjaji",
    name: "Povezivanje pametnih uređaja",
    tagline: "Povezano sa lakoćom.",
    description:
      "Podešavamo kompatibilne pametne sijalice, utičnice i druge kućne uređaje, kao i štampače, uz vaše prisustvo pri prijavljivanju na naloge.",
    image: "/images/lamp.jpg",
    price: null,
    active: true,
    sort_order: 18,
  },
  {
    id: "ca5a0000-0000-4000-8000-000000000019",
    slug: "nega-garderobe",
    name: "Nega garderobe",
    tagline: "Više vremena za vas.",
    description:
      "Peglamo i slažemo odeću prema uputstvima za negu, pripremamo veš za pranje i odlažemo stvari prema vašim navikama.",
    image: "/images/club.jpg",
    price: null,
    active: true,
    sort_order: 19,
  },
  {
    id: "ca5a0000-0000-4000-8000-000000000020",
    slug: "sveza-posteljina",
    name: "Sveža posteljina",
    tagline: "Više vremena za vas.",
    description:
      "Menjamo vašu pripremljenu posteljinu, pažljivo nameštamo krevet i pripremamo korišćenu posteljinu za pranje.",
    image: "/images/hero.jpg",
    price: null,
    active: true,
    sort_order: 20,
  },
  {
    id: "ca5a0000-0000-4000-8000-000000000021",
    slug: "organizacija-doma",
    name: "Organizacija doma",
    tagline: "Više vremena za vas.",
    description:
      "Sređujemo garderober, ostavu i kuhinjske elemente sa vama, organizujemo sezonske stvari i pripremamo dogovorene predmete za donaciju.",
    image: "/images/kitchen.jpg",
    price: null,
    active: true,
    sort_order: 21,
  },
  {
    id: "ca5a0000-0000-4000-8000-000000000022",
    slug: "licna-nabavka",
    name: "Vaša lična nabavka",
    tagline: "Više vremena za vas.",
    description:
      "Kupujemo prema vašoj listi, dogovaramo zamene proizvoda i raspoređujemo namirnice po dolasku. Proizvode i uslugu iskazujemo odvojeno.",
    image: "/images/kitchen.jpg",
    price: null,
    active: true,
    sort_order: 22,
  },
  {
    id: "ca5a0000-0000-4000-8000-000000000023",
    slug: "paketi-i-hemijsko-ciscenje",
    name: "Paketi i hemijsko čišćenje",
    tagline: "Više vremena za vas.",
    description:
      "Preuzimamo dogovorene pakete i odnosimo ili vraćamo garderobu sa hemijskog čišćenja. Troškove trećih strana potvrđujete unapred.",
    image: "/images/club.jpg",
    price: null,
    active: true,
    sort_order: 23,
  },
  {
    id: "ca5a0000-0000-4000-8000-000000000024",
    slug: "dom-na-cuvanju",
    name: "Dom na čuvanju",
    tagline: "Više vremena za vas.",
    description:
      "Tokom vašeg odsustva zalivamo biljke, obilazimo stan i šaljemo kratak izveštaj. Pristup i listu zadataka dogovaramo pre putovanja.",
    image: "/images/hero.jpg",
    price: null,
    active: true,
    sort_order: 24,
  },
  {
    id: "ca5a0000-0000-4000-8000-000000000025",
    slug: "pakovanje-i-raspakivanje",
    name: "Pakovanje i raspakivanje",
    tagline: "Više vremena za vas.",
    description:
      "Pomažemo da pažljivo spakujete stvari ili uredite novi dom nakon selidbe. Ambalažu, obim i eventualno pomeranje težih predmeta dogovaramo posebno.",
    image: "/images/living.jpg",
    price: null,
    active: true,
    sort_order: 25,
  },
  {
    id: "ca5a0000-0000-4000-8000-000000000026",
    slug: "dom-spreman-za-goste",
    name: "Dom spreman za goste",
    tagline: "Više vremena za vas.",
    description:
      "Uređujemo dogovoreni prostor, pripremamo posteljinu i postavljamo sto sa vašim posuđem i dekoracijom, uz pažnju prema završnim detaljima.",
    image: "/images/kitchen.jpg",
    price: null,
    active: true,
    sort_order: 26,
  },
  ...additionalServices,
  {
    id: "ca5a0000-0000-4000-8000-000000000100",
    slug: "moja-casa",
    name: "Moja Casa",
    tagline: "Briga o domu, po vašoj meri.",
    description:
      "Sastavite svoj izbor usluga i učestalost dolazaka. Naš tim potvrđuje obim, dostupnost i konačnu ponudu pre početka saradnje.",
    image: "/images/hero.jpg",
    price: null,
    active: true,
    sort_order: 100,
  },
].map((service) => ({ ...service, price: servicePricing[service.slug]?.price ?? service.price }));
export const statusLabels: Record<string, string> = {
  received: "Primljen zahtev",
  discussing: "U dogovoru",
  quoted: "Ponuda spremna",
  scheduled: "Zakazano",
  completed: "Završeno",
  cancelled: "Otkazano",
};
export const paymentLabels: Record<string, string> = {
  pending: "Čeka uplatu",
  paid: "Plaćeno",
  partially_refunded: "Delimično vraćeno",
  refunded: "Vraćeno",
  failed: "Neuspela uplata",
};
export const money = (minor: number, locale = "sr-Latn-RS") =>
  new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "RSD",
    maximumFractionDigits: 2,
  }).format(minor / 100);

export function servicePriceLabel(service: Pick<Service, "slug" | "price">, locale: string, t: (value: string) => string) {
  if (service.price === null) return t("Cena na upit");
  const unit = servicePricing[service.slug]?.unit;
  return `${t("Od")} ${money(service.price, locale)}${unit ? ` · ${t(unit)}` : ""}`;
}
