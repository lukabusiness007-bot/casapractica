import { NextResponse } from "next/server";
import { trustedSiteOrigins } from "./site-url";
import { configured, currentUser, isAdmin } from "./supabase";
export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export function assertReady() {
  if (!configured())
    throw new HttpError(
      503,
      "Povezivanje platforme je u toku. Zahtev nije poslat.",
    );
}
export function assertOrigin(req: Request) {
  if (!trustedSiteOrigins().has(req.headers.get("origin") || ""))
    throw new HttpError(403, "Nevažeći izvor zahteva.");
}
export async function requireUser(admin = false) {
  assertReady();
  const user = await currentUser();
  if (!user?.email_confirmed_at)
    throw new HttpError(401, "Prijavite se i potvrdite email adresu.");
  if (admin && !(await isAdmin(user.id)))
    throw new HttpError(403, "Pristup nije dozvoljen.");
  return user;
}
export function failure(e: unknown) {
  if (e instanceof HttpError)
    return NextResponse.json({ error: e.message }, { status: e.status });
  console.error(e instanceof Error ? e.message : "Server error");
  return NextResponse.json(
    { error: "Radnja nije uspela. Pokušajte ponovo." },
    { status: 500 },
  );
}
