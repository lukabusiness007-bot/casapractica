import { headers } from "next/headers";
import { cache } from "react";
import { isLocale } from "./routing";
import { translator } from ".";
export const getLocale = cache(async () => {
  const value = (await headers()).get("x-site-locale") || "sr";
  return isLocale(value) ? value : "sr";
});
export async function getTranslator() {
  return translator(await getLocale());
}
