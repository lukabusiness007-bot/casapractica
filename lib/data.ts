import { cache } from "react";
import { services } from "./catalog";
import type { Service } from "./catalog";
import { configured, db } from "./supabase";
export const getServices = cache(async (): Promise<Service[]> => {
  if (!configured()) return services;
  const { data, error } = await db()
    .from("services")
    .select("*")
    .eq("active", true)
    .order("sort_order");
  if (error)
    throw new Error("Usluge trenutno nisu dostupne. Pokušajte ponovo.");
  return data || [];
});
