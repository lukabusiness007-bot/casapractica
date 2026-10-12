import { publicPageMetadata } from "@/lib/seo";
import { getLocale, getTranslator } from "@/lib/i18n/server";
export const dynamic = "force-dynamic";
import { AuthPage } from "@/components/auth-page";
export default async function Register() {
  const t = await getTranslator();

  return <AuthPage mode="register" />;
}

export async function generateMetadata() {
  return publicPageMetadata(await getLocale(), "/registracija");
}
