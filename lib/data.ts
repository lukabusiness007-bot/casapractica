import { cache } from "react";
import { publicService, services } from "./catalog";
import type { Service } from "./catalog";
import { configured, db } from "./supabase";
import { isPublishedService } from "./service-availability";
export const getServices = cache(async (): Promise<Service[]> => {
  if (!configured()) return services.filter(isPublishedService).sort((a, b) => a.sort_order - b.sort_order);
  const { data, error } = await db()
    .from("services")
    .select("*")
    .eq("active", true)
    .order("sort_order");
  if (error)
    throw new Error("Usluge trenutno nisu dostupne. Pokušajte ponovo.");
  return (data || []).filter(isPublishedService).map((service: Service) => publicService(service));
});

// Keep the existing site readable while a connected deployment awaits migration 003.
export const growthReady = cache(async (): Promise<boolean> => {
  if (!configured()) return false;
  const { error } = await db().from("home_profiles").select("id").limit(0);
  if (error && ["PGRST205", "42P01"].includes(error.code)) return false;
  if (error) throw new Error("Dodatne mogućnosti trenutno nisu dostupne.");
  return true;
});
