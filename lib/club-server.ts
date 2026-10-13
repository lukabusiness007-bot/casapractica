import "server-only";
import { cache } from "react";
import { currentUser, db, configured } from "./supabase";
export const clubStatus = cache(async () => {
  const user = await currentUser();
  if (!user?.email_confirmed_at) return { member: false, signedIn: false };
  const { data, error } = await db()
    .from("memberships")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (error) throw error;
  return { member: Boolean(data), signedIn: true };
});
export const clubReady = cache(async () => {
  if (!configured()) return false;
  const { error } = await db().from("club_credits").select("id").limit(0);
  if (error && ["42P01", "PGRST205"].includes(error.code)) return false;
  if (error) throw error;
  return true;
});
