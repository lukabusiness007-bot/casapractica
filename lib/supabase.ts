import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
export const configured = () =>
  Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
export async function authClient() {
  const jar = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => jar.getAll(),
        setAll: (items) => {
          try {
            items.forEach(({ name, value, options }) =>
              jar.set(name, value, options),
            );
          } catch {
            /* Server components cannot set cookies. Proxy refreshes sessions. */
          }
        },
      },
    },
  );
}
export function db() {
  if (!configured()) throw new Error("Platforma još nije povezana sa bazom.");
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
export async function currentUser() {
  if (!configured()) return null;
  const c = await authClient();
  const {
    data: { user },
  } = await c.auth.getUser();
  return user;
}
export async function isAdmin(id: string) {
  const { data } = await db()
    .from("admins")
    .select("user_id")
    .eq("user_id", id)
    .maybeSingle();
  return !!data;
}
