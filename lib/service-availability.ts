// Retired from the public offer; keep records for existing requests and payments.
export const retiredServiceSlugs = new Set([
  "nega-garderobe",
  "sveza-posteljina",
  "organizacija-doma",
  "licna-nabavka",
  "dom-na-cuvanju",
  "pakovanje-i-raspakivanje",
  "dom-spreman-za-goste",
  "mlin-za-otpatke",
  "elektroinstalacije",
  "punjaci-za-elektricna-vozila",
  "ugradnja-zvucnih-sistema",
  "mrezna-dijagnostika-i-bezbednost",
  "vertikalne-baste",
  "popravka-i-podesavanje-oluka",
  "usmeravanje-i-sakupljanje-kisnice",
  "zamena-i-zastita-oluka",
]);

export function isPublishedService(service: { slug: string; active: boolean }) {
  return service.active && !retiredServiceSlugs.has(service.slug);
}
