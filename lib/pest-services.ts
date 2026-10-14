import type { Service } from "./catalog";

export const pestServices: Service[] = [
  {
    "id": "ca5a0000-0000-4000-8000-000000000401",
    "slug": "deratizacija",
    "name": "Deratizacija",
    "tagline": "Procena prostora. Dogovoren tretman.",
    "description": "Deratizacija stanova, kuća, podruma i poslovnih prostora u Beogradu. Procenu problema sa miševima i pacovima, obim tretmana i kontrolu dogovaramo pre dolaska.",
    "image": "/images/services/ddd-zastita.webp",
    "price": null,
    "active": true,
    "sort_order": 55
  },
  {
    "id": "ca5a0000-0000-4000-8000-000000000402",
    "slug": "dezinsekcija",
    "name": "Dezinsekcija",
    "tagline": "Procena prostora. Dogovoren tretman.",
    "description": "Dezinsekcija protiv bubašvaba, mrava, buva i drugih insekata u Beogradu. Vrstu štetočine, zahvaćene prostorije, pripremu i obim tretmana potvrđujemo nakon procene.",
    "image": "/images/services/ddd-zastita.webp",
    "price": null,
    "active": true,
    "sort_order": 56
  },
  {
    "id": "ca5a0000-0000-4000-8000-000000000403",
    "slug": "dezinfekcija",
    "name": "Dezinfekcija prostora",
    "tagline": "Procena prostora. Dogovoren tretman.",
    "description": "Dezinfekcija dogovorenih površina u stanovima, zgradama i poslovnim prostorima u Beogradu. Namenu prostora, početno stanje, pripremu i cenu potvrđujemo pre tretmana.",
    "image": "/images/services/ddd-zastita.webp",
    "price": null,
    "active": true,
    "sort_order": 57
  },
  {
    "id": "ca5a0000-0000-4000-8000-000000000404",
    "slug": "tretman-protiv-stenica",
    "name": "Tretman protiv stenica",
    "tagline": "Procena prostora. Dogovoren tretman.",
    "description": "Procena i tretman protiv stenica u stanovima i smeštajnim objektima u Beogradu. Pregled, pripremu prostorija, plan tretmana i moguće ponovljene posete dogovaramo sa specijalistom.",
    "image": "/images/services/ddd-zastita.webp",
    "price": null,
    "active": true,
    "sort_order": 58
  },
  {
    "id": "ca5a0000-0000-4000-8000-000000000405",
    "slug": "uklanjanje-gnezda-osa-i-strsljena",
    "name": "Uklanjanje gnezda osa i stršljena",
    "tagline": "Procena prostora. Dogovoren tretman.",
    "description": "Procena i uklanjanje gnezda osa i stršljena u Beogradu. Položaj gnezda, visinu i pristup proveravamo pre ponude i dogovora o intervenciji odgovarajućeg specijaliste.",
    "image": "/images/services/ddd-zastita.webp",
    "price": null,
    "active": true,
    "sort_order": 59
  },
  {
    "id": "ca5a0000-0000-4000-8000-000000000406",
    "slug": "preventivna-ddd-zastita",
    "name": "Preventivna DDD zaštita",
    "tagline": "Procena prostora. Dogovoren tretman.",
    "description": "Preventivni DDD plan za stambene zgrade i poslovne prostore u Beogradu. Preglede, potrebu za tretmanima, učestalost i kontrolne posete dogovaramo prema proceni objekta.",
    "image": "/images/services/ddd-zastita.webp",
    "price": null,
    "active": true,
    "sort_order": 60
  },
  {
    "id": "ca5a0000-0000-4000-8000-000000000407",
    "slug": "uklanjanje-neprijatnih-mirisa",
    "name": "Uklanjanje neprijatnih mirisa",
    "tagline": "Procena prostora. Dogovoren tretman.",
    "description": "Procena i uklanjanje neprijatnih mirisa u stanovima i poslovnim prostorima u Beogradu. Izvor mirisa, zahvaćene materijale i odgovarajući postupak proveravamo pre ponude.",
    "image": "/images/services/ddd-zastita.webp",
    "price": null,
    "active": true,
    "sort_order": 61
  },
  {
    "id": "ca5a0000-0000-4000-8000-000000000408",
    "slug": "ciscenje-posle-ddd-tretmana",
    "name": "Čišćenje posle DDD tretmana",
    "tagline": "Procena prostora. Dogovoren tretman.",
    "description": "Čišćenje nakon deratizacije, dezinsekcije ili dezinfekcije u Beogradu. Termin, dozvoljene površine i obim čišćenja usklađujemo sa uputstvom izvođača prethodnog tretmana.",
    "image": "/images/services/ddd-zastita.webp",
    "price": null,
    "active": true,
    "sort_order": 62
  },
  {
    "id": "ca5a0000-0000-4000-8000-000000000409",
    "slug": "sanacija-budji",
    "name": "Sanacija buđi",
    "tagline": "Procena prostora. Dogovoren tretman.",
    "description": "Procena i sanacija buđi na zidovima i površinama u Beogradu. Stanje podloge, obim zahvaćenih delova i potrebu za rešavanjem vlage proveravamo sa specijalistom pre ponude.",
    "image": "/images/services/ddd-zastita.webp",
    "price": null,
    "active": true,
    "sort_order": 63
  }
];

export const pestContent: Record<string, { title: string; tasks: string[]; faq: [string, string] }> = {
  "deratizacija": {
    "title": "Deratizacija u Beogradu",
    "tasks": [
      "Pregled tragova i mogućih ulaznih tačaka glodara",
      "Plan tretmana protiv miševa i pacova i kontrola po dogovoru"
    ],
    "faq": [
      "Da li deratizacija obuhvata ceo objekat?",
      "Obim određujemo prema tragovima, pristupu i tipu objekta. Navedite sve pogođene prostorije, podrume i zajedničke delove; tretman stana i tretman cele zgrade imaju zasebnu procenu."
    ]
  },
  "dezinsekcija": {
    "title": "Dezinsekcija u Beogradu",
    "tasks": [
      "Procena vrste insekata i zahvaćenih delova prostora",
      "Dogovoren tretman protiv bubašvaba, mrava ili buva"
    ],
    "faq": [
      "Šta ako ne znam koji su insekti u pitanju?",
      "Izaberite „Nisam siguran/a“ i opišite gde ih primećujete. Fotografije možete poslati u nastavku razgovora; vrstu problema i odgovarajući obim potvrđuje specijalista."
    ]
  },
  "dezinfekcija": {
    "title": "Dezinfekcija prostora u Beogradu",
    "tasks": [
      "Procena namene prostora i površina za dezinfekciju",
      "Dezinfekcija površina u potvrđenom obimu"
    ],
    "faq": [
      "Da li je čišćenje uključeno u dezinfekciju?",
      "Čišćenje i dezinfekciju navodimo kao zasebne stavke. Pre ponude proveravamo stanje površina i potrebu za prethodnim čišćenjem; obim obe usluge potvrđujete unapred."
    ]
  },
  "tretman-protiv-stenica": {
    "title": "Tretman protiv stenica u Beogradu",
    "tasks": [
      "Pregled zahvaćenih prostorija i mesta na kojima se sumnja na stenice",
      "Plan pripreme, tretmana i mogućih ponovljenih poseta"
    ],
    "faq": [
      "Da li je dovoljan jedan tretman protiv stenica?",
      "Broj poseta potvrđuje specijalista nakon procene. U ponudi posebno navodimo početni tretman, kontrolu i eventualne ponovljene dolaske; cenu dodatnih poseta dogovaramo pre zakazivanja."
    ]
  },
  "uklanjanje-gnezda-osa-i-strsljena": {
    "title": "Uklanjanje osa i stršljena u Beogradu",
    "tasks": [
      "Procena položaja gnezda, visine i pristupa",
      "Dogovor o intervenciji specijaliste i potrebnoj opremi"
    ],
    "faq": [
      "Da li uklanjate gnezda na krovu ili fasadi?",
      "Mogućnost intervencije potvrđujemo nakon procene pristupa. Navedite približnu visinu, položaj gnezda i dostupnost prilaza; rad na visini i posebna oprema navode se zasebno u ponudi."
    ]
  },
  "preventivna-ddd-zastita": {
    "title": "Preventivna DDD zaštita u Beogradu",
    "tasks": [
      "Početni pregled objekta i procena potreba za DDD zaštitom",
      "Dogovoren raspored pregleda, tretmana i kontrolnih poseta"
    ],
    "faq": [
      "Da li se preventivni tretmani rade svakog meseca?",
      "Učestalost određujemo prema nameni, stanju i proceni objekta. Plan može sadržati preglede i tretmane po potrebi; slanje zahteva ne aktivira pretplatu niti automatski raspored dolazaka."
    ]
  },
  "uklanjanje-neprijatnih-mirisa": {
    "title": "Uklanjanje neprijatnih mirisa u Beogradu",
    "tasks": [
      "Procena izvora mirisa i zahvaćenih površina",
      "Dogovor o čišćenju i odgovarajućem postupku uklanjanja mirisa"
    ],
    "faq": [
      "Da li je dovoljno samo osvežiti prostor?",
      "Najpre procenjujemo izvor i materijale u kojima se miris zadržava. Potrebno čišćenje, sanaciju ili dodatni pregled navodimo u ponudi; trajanje i rezultat ne obećavamo pre procene."
    ]
  },
  "ciscenje-posle-ddd-tretmana": {
    "title": "Čišćenje posle DDD tretmana u Beogradu",
    "tasks": [
      "Provera uputstva i termina za čišćenje nakon tretmana",
      "Čišćenje dozvoljenih površina u dogovorenom obimu"
    ],
    "faq": [
      "Kada može da počne čišćenje nakon tretmana?",
      "Termin i površine koje se mogu čistiti potvrđuje izvođač tretmana. Pošaljite datum prethodne intervencije i dobijeno uputstvo, kako bismo dogovorili odgovarajući obim i redosled rada."
    ]
  },
  "sanacija-budji": {
    "title": "Sanacija buđi u Beogradu",
    "tasks": [
      "Pregled zahvaćenih površina i procena potrebe za sanacijom",
      "Dogovor o sanaciji, rešavanju vlage i obnovi površina"
    ],
    "faq": [
      "Da li je krečenje uključeno u sanaciju buđi?",
      "Sanaciju, radove povezane sa vlagom i završno krečenje navodimo odvojeno. Potreban obim i redosled potvrđuje specijalista nakon pregleda; dodatne radove dogovaramo pre početka."
    ]
  }
};

export function isPestService(slug: string) {
  return Object.hasOwn(pestContent, slug);
}

// Natural query forms that may differ from the grammatical case in descriptions.
export const pestSearchTerms: Record<string, string[]> = {
  deratizacija: ["Miševi ili pacovi"],
  dezinsekcija: ["Bubašvabe", "Mravi", "Buve"],
  "tretman-protiv-stenica": ["Stenice"],
  "uklanjanje-gnezda-osa-i-strsljena": ["Ose ili stršljeni"],
  "uklanjanje-neprijatnih-mirisa": ["Buđ ili neprijatan miris"],
  "sanacija-budji": ["Buđ ili neprijatan miris"],
};

export const pestCollectionTitles: Record<string, string> = {
  "zastita-doma": "DDD zaštita doma u Beogradu",
  "zastita-zgrade": "DDD zaštita zgrade u Beogradu",
  "zastita-poslovnog-prostora": "DDD zaštita poslovnog prostora u Beogradu"
};
