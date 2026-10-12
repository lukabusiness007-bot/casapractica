import { publicPageMetadata } from "@/lib/seo";
import { getLocale, getTranslator } from "@/lib/i18n/server";
import { AuthPage } from "@/components/auth-page";
export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string; error?: string }>;
}) {
  const t = await getTranslator();

  const q = await searchParams;
  return (
    <>
      {q.error && (
        <p className="error center">
          {t(
            "Link nije važeći ili je istekao. Zatražite novi link i pokušajte ponovo.",
          )}
        </p>
      )}
      <AuthPage mode={q.mode === "reset" ? "reset" : "login"} />
    </>
  );
}

export async function generateMetadata() {
  return publicPageMetadata(await getLocale(), "/prijava");
}
