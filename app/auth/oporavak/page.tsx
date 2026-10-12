import { publicPageMetadata } from "@/lib/seo";
import { localePath } from "@/lib/i18n/routing";
import { getLocale, getTranslator } from "@/lib/i18n/server";
export const dynamic = "force-dynamic";
import { AuthPage } from "@/components/auth-page";
import { currentUser } from "@/lib/supabase";
import { redirect } from "next/navigation";
export default async function Reset() {
  const t = await getTranslator();

  if (!(await currentUser()))
    redirect(localePath("/prijava?mode=reset", await getLocale()));
  return <AuthPage mode="update" />;
}

export async function generateMetadata() {
  return publicPageMetadata(await getLocale(), "/auth/oporavak");
}
