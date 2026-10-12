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
      "Za trenutke kada vam znači dodatna pomoć. Navedite količinu, sprat i da li zgrada ima lift, pa ćemo dogovoriti iznošenje kućnog smeća.",
    image: "/images/kitchen.jpg",
    price: null,
    active: true,
    sort_order: 2,
  },
  {
    id: "33333333-3333-4333-8333-333333333333",
    slug: "ugradnja-tv-a",
    name: "Ugradnja TV-a",
    tagline: "Vaše malo kućno bioskopsko veče.",
    description:
      "Televizor na svom mestu, a vi bez brige. Pošaljite model televizora, tip zida i informaciju o nosaču kako bismo pripremili ponudu za montažu.",
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
];
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
