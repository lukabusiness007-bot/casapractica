import type { Service, ServiceCategory } from "./catalog";

export const homeServiceAdditions: Service[] = [
  {
    "id": "ca5a0000-0000-4000-8000-000000000501",
    "slug": "dubinsko-pranje-duseka-sofa-i-fotelja",
    "name": "Dubinsko pranje dušeka, sofa i fotelja",
    "tagline": "Svežina omiljenog mesta za odmor.",
    "description": "Dubinski peremo dušeke, sofe i fotelje u Beogradu. Materijal, dimenzije, broj sedećih mesta, stanje i način čišćenja potvrđujemo pre dolaska, uz dogovor o sušenju i korišćenju nakon pranja.",
    "image": "/images/services/dubinsko-pranje-duseka-sofa-i-fotelja.webp",
    "price": 240000,
    "active": true,
    "sort_order": 64
  },
  {
    "id": "ca5a0000-0000-4000-8000-000000000502",
    "slug": "skidanje-i-postavljanje-tapeta",
    "name": "Skidanje i postavljanje tapeta",
    "tagline": "Novi zidovi, sa pažnjom prema svakom spoju.",
    "description": "Skidamo stare i postavljamo nove tapete u Beogradu. Površinu zidova, stanje podloge, vrstu tapeta, pripremu i završne detalje dogovaramo pre rada, uz zaštitu prostora i sređivanje nakon završetka.",
    "image": "/images/services/skidanje-i-postavljanje-tapeta.webp",
    "price": null,
    "active": true,
    "sort_order": 65
  },
  {
    "id": "ca5a0000-0000-4000-8000-000000000503",
    "slug": "praznjenje-podruma-tavana-i-garaza",
    "name": "Pražnjenje podruma, tavana i garaža",
    "tagline": "Oslobodite prostor za ono što vam je važno.",
    "description": "Praznimo podrume, tavane i garaže u Beogradu. Unapred dogovaramo šta ostaje, šta iznosimo, količinu stvari, pristup i odvoz, uz jasnu ponudu za rad i odgovarajuće zbrinjavanje.",
    "image": "/images/services/praznjenje-podruma-tavana-i-garaza.webp",
    "price": null,
    "active": true,
    "sort_order": 66
  },
  {
    "id": "ca5a0000-0000-4000-8000-000000000504",
    "slug": "kosenje-trave-i-sisanje-zive-ograde",
    "name": "Košenje trave i šišanje žive ograde",
    "tagline": "Uredna bašta, više vremena za uživanje.",
    "description": "Kosimo travu i šišamo živu ogradu u Beogradu. Površinu travnjaka, visinu i dužinu ograde, pristup, opremu i uklanjanje zelenog otpada dogovaramo za jednu posetu ili redovno održavanje.",
    "image": "/images/services/kosenje-trave-i-sisanje-zive-ograde.webp",
    "price": null,
    "active": true,
    "sort_order": 67
  },
  {
    "id": "ca5a0000-0000-4000-8000-000000000505",
    "slug": "ciscenje-i-odrzavanje-bazena",
    "name": "Čišćenje i održavanje bazena",
    "tagline": "Vi uživate u vodi. Mi brinemo o detaljima.",
    "description": "Čistimo i održavamo privatne bazene u Beogradu. Čišćenje površine, dna i ivica, pregled dostupne filtracije i redovno održavanje dogovaramo prema dimenzijama, stanju vode i opremi.",
    "image": "/images/services/ciscenje-i-odrzavanje-bazena.webp",
    "price": null,
    "active": true,
    "sort_order": 68
  }
];

export const homeServiceCategories: Record<string, ServiceCategory> = {
  "dubinsko-pranje-duseka-sofa-i-fotelja": "everyday",
  "skidanje-i-postavljanje-tapeta": "doors-windows",
  "praznjenje-podruma-tavana-i-garaza": "organization",
  "kosenje-trave-i-sisanje-zive-ograde": "gutters",
  "ciscenje-i-odrzavanje-bazena": "gutters"
};

export const homeServiceDetails: Record<string, { title: string; tasks: string[]; specialist: boolean; preparation: string; faq: [string, string]; requestHint: string }> = {
  "dubinsko-pranje-duseka-sofa-i-fotelja": {
    "title": "Dubinsko pranje dušeka i nameštaja u Beogradu",
    "tasks": [
      "Provera materijala, dimenzija i stanja pre pranja",
      "Dubinsko pranje dogovorenih tapaciranih površina",
      "Dogovor o sušenju, provetravanju i narednom korišćenju"
    ],
    "specialist": false,
    "preparation": "Pripremite pristup nameštaju, vodu i struju i navedite osetljive materijale ili ranije tretirane mrlje. Trajanje sušenja zavisi od materijala i uslova u prostoru; očekivano vreme potvrđujemo pre rada.",
    "faq": [
      "Kako se obračunavaju sofe, fotelje i dušeci?",
      "Pranje sofa i fotelja obračunava se po sedećem mestu, a dušeci prema tipu iz cenovnika. Broj mesta, dimenzije, materijal i eventualne dodatne radove potvrđujemo u ponudi; postojeći klupski popust važi prema uslovima članstva."
    ],
    "requestHint": "Navedite broj i dimenzije dušeka, broj sedećih mesta, materijal i mrlje koje želite da procenimo."
  },
  "skidanje-i-postavljanje-tapeta": {
    "title": "Skidanje i postavljanje tapeta u Beogradu",
    "tasks": [
      "Skidanje postojećih tapeta u dogovorenom obimu",
      "Provera i priprema podloge za nove tapete",
      "Postavljanje tapeta i sređivanje prostora nakon rada"
    ],
    "specialist": true,
    "preparation": "Navedite površinu zidova, visinu, postojeće slojeve i da li su tapete nabavljene. Pristup zidovima, zaštitu nameštaja, lepak i eventualno gletovanje potvrđujemo u ponudi; rok zavisi od pripreme i sušenja podloge.",
    "faq": [
      "Mogu li da zatražim samo skidanje ili samo postavljanje tapeta?",
      "Da. Navedite da li želite skidanje, postavljanje ili oba posla. Sanaciju podloge, materijal i odvoz ostataka navodimo posebno u ponudi prema proceni zida."
    ],
    "requestHint": "Navedite skidanje ili postavljanje, površinu zidova, visinu i vrstu tapeta; fotografije možete poslati tokom dogovora."
  },
  "praznjenje-podruma-tavana-i-garaza": {
    "title": "Pražnjenje podruma, tavana i garaža u Beogradu",
    "tasks": [
      "Dogovor o predmetima koji ostaju i onima za iznošenje",
      "Iznošenje stvari iz podruma, tavana ili garaže",
      "Odvoz i zbrinjavanje prema potvrđenoj ponudi"
    ],
    "specialist": false,
    "preparation": "Označite stvari koje želite da sačuvate i navedite veće predmete, sprat, stepenice, lift i mogućnost prilaza vozila. Obim iznošenja, odvoz i eventualno završno čišćenje potvrđujemo pre dolaska.",
    "faq": [
      "Da li su odvoz i čišćenje uključeni u pražnjenje?",
      "U ponudi odvojeno prikazujemo iznošenje, transport i zbrinjavanje. Završno čišćenje možete zatražiti kao dodatnu stavku; količinu i konačnu cenu dogovaramo unapred."
    ],
    "requestHint": "Opišite količinu i veće predmete, šta želite da sačuvate, sprat, stepenice, lift i prilaz vozila."
  },
  "kosenje-trave-i-sisanje-zive-ograde": {
    "title": "Košenje trave i šišanje žive ograde u Beogradu",
    "tasks": [
      "Košenje dogovorene površine travnjaka",
      "Šišanje žive ograde prema dogovorenoj visini i obliku",
      "Sakupljanje i odvoz zelenog otpada po dogovoru"
    ],
    "specialist": false,
    "preparation": "Navedite površinu i trenutno stanje travnjaka, dimenzije žive ograde i pristup dvorištu. Oprema, struja, iznošenje otpada i vremenski uslovi utiču na organizaciju; učestalost i termin potvrđujemo sa timom.",
    "faq": [
      "Mogu li da dogovorim redovno održavanje dvorišta?",
      "Da. Predlažemo ritam prema površini, stanju i sezoni. Svaku posetu, obim, opremu i odvoz potvrđujemo u ponudi; slanje zahteva ne aktivira automatsku pretplatu."
    ],
    "requestHint": "Navedite površinu travnjaka, dimenzije žive ograde, stanje i pristup, opremu koju imate i željenu učestalost."
  },
  "ciscenje-i-odrzavanje-bazena": {
    "title": "Čišćenje i održavanje bazena u Beogradu",
    "tasks": [
      "Čišćenje površine, dna i ivica bazena u dogovorenom obimu",
      "Pregled i održavanje dostupnog sistema filtracije",
      "Dogovor o sredstvima i rasporedu održavanja"
    ],
    "specialist": true,
    "preparation": "Navedite dimenzije ili zapreminu bazena, tip filtracije, trenutno stanje vode i datum poslednjeg održavanja. Pristup, sredstva, redovne posete i eventualne popravke opreme potvrđuje odgovarajući specijalista.",
    "faq": [
      "Da li cena uključuje sredstva i popravke bazenske opreme?",
      "U ponudi jasno odvajamo rad, dolazak, sredstva i eventualne popravke. Jednokratno čišćenje i redovno održavanje imaju zasebno dogovoren obim i cenu; zamenu delova potvrđujete pre realizacije."
    ],
    "requestHint": "Navedite dimenzije ili zapreminu bazena, tip filtracije, stanje vode, poslednji servis i željenu učestalost."
  }
};

export const homeServiceSearchTerms: Record<string, string[]> = {
  "dubinsko-pranje-duseka-sofa-i-fotelja": [
    "Dušeci",
    "Sofe",
    "Fotelje"
  ],
  "skidanje-i-postavljanje-tapeta": [
    "Tapete"
  ],
  "praznjenje-podruma-tavana-i-garaza": [
    "Podrumi",
    "Tavani",
    "Garaže"
  ],
  "kosenje-trave-i-sisanje-zive-ograde": [
    "Travnjak"
  ],
  "ciscenje-i-odrzavanje-bazena": [
    "Bazeni"
  ]
};
