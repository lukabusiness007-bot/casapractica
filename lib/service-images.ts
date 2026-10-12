import type { Service } from "./catalog";

// Replace the original generic interiors, while preserving custom admin photography.
const genericInteriors = new Set([
  "/images/carpet.jpg", "/images/kitchen.jpg", "/images/living.jpg",
  "/images/lamp.jpg", "/images/air.jpg", "/images/club.jpg", "/images/hero.jpg",
]);
const illustratedServices = new Set([
  "pranje-tepiha",
  "iznosenje-smeca",
  "ugradnja-tv-a",
  "zamena-sijalica",
  "servis-klime",
  "kacenje-slika-i-ogledala",
  "montaza-polica",
  "postavljanje-garnisni",
  "sklapanje-namestaja",
  "podesavanje-vrata-i-fioka",
  "obnova-silikona",
  "sitne-popravke-zidova",
  "vodoinstalaterske-intervencije",
  "elektricarske-intervencije",
  "odrzavanje-filtera",
  "podesavanje-tv-a",
  "podesavanje-wifi-mreze",
  "pametni-uredjaji",
  "nega-garderobe",
  "sveza-posteljina",
  "organizacija-doma",
  "licna-nabavka",
  "paketi-i-hemijsko-ciscenje",
  "dom-na-cuvanju",
  "pakovanje-i-raspakivanje",
  "dom-spreman-za-goste",
  "ventilatori-i-ventilacija",
  "detektori-dima",
  "elektroinstalacije",
  "odgusenje-odvoda",
  "mlin-za-otpatke",
  "bojleri-pumpe-i-cevi",
  "odrzavanje-kucnih-aparata",
  "terase-i-spoljne-povrsine",
  "preventivni-pregled-doma",
  "krov-temelji-i-dimnjak",
  "montaza-i-servis-roletni",
  "zavese-i-roletne-po-meri",
  "popravka-vrata-i-prozora",
  "zaptivanje-i-komarnici",
  "ugradnja-i-obnova-prozora",
  "gipsani-radovi-i-sanacija",
  "nosaci-i-organizacija-garaze",
  "ugradnja-zvucnih-sistema",
  "vertikalne-baste",
  "popravka-i-ucvrscivanje-namestaja",
  "tapaciranje-i-mehanizmi",
  "pametna-zvona-kamere-i-brave",
  "mrezna-dijagnostika-i-bezbednost",
  "punjaci-za-elektricna-vozila",
  "ciscenje-oluka",
  "popravka-i-podesavanje-oluka",
  "usmeravanje-i-sakupljanje-kisnice",
  "zamena-i-zastita-oluka",
]);

export function serviceImage(service: Pick<Service, "slug" | "image">): string {
  return illustratedServices.has(service.slug) && genericInteriors.has(service.image)
    ? `/images/services/${service.slug}${service.slug === "elektricarske-intervencije" ? "-v2" : ""}.webp`
    : service.image;
}
