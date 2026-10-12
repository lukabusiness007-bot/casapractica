import Image from "next/image";
import { getTranslator } from "@/lib/i18n/server";
import Link from "@/components/localized-link";
import { configured } from "@/lib/supabase";
import { ActionForm } from "./action-form";
export async function AuthPage({
  mode,
}: {
  mode: "login" | "register" | "reset" | "update";
}) {
  const t = await getTranslator();

  const ready = configured();
  const titles = {
    login: t("Lepo je što ste tu."),
    register: t("Vaš lakši dan počinje ovde."),
    reset: t("Novi početak."),
    update: t("Vaša nova lozinka."),
  };
  return (
    <section className="auth-wrap">
      <div className="auth-visual">
        <Image
          width={1000}
          height={1200}
          sizes="(max-width: 760px) 100vw, 50vw"
          src="/images/club.jpg"
          alt={t("Vaš trenutak mira kod kuće")}
        />
        <div>
          <span className="eyebrow">{t("VAŠ MALI SVAKODNEVNI LUKSUZ")}</span>
          <h2>
            {t("Vreme za sebe.")}
            <br />
            <em>{t("Bez griže savesti.")}</em>
          </h2>
          <p>{t("Umetnost jednostavnijeg života.")}</p>
        </div>
      </div>
      <div className="auth-content">
        <span className="eyebrow">{t("DOBRO DOŠLI U casa practica")}</span>
        <h1>{titles[mode]}</h1>
        <p>
          {mode === "register"
            ? t(
                "Napravite nalog da pratite zahteve i pristupite svojim ponudama.",
              )
            : mode === "reset"
              ? t("Poslaćemo vam link za postavljanje nove lozinke.")
              : mode === "update"
                ? t("Izaberite lozinku od najmanje 10 karaktera.")
                : t("Vaše usluge, ponude i male privilegije na jednom mestu.")}
        </p>
        {!ready && (
          <p className="notice">
            {t(
              "Prijavljivanje još nije aktivirano. Nalozi će biti dostupni nakon povezivanja platforme.",
            )}
          </p>
        )}
        {(mode === "login" || mode === "register") && (
          <div className="auth-tabs">
            <Link className={mode === "login" ? "active" : ""} href="/prijava">
              {t("Prijavite se")}
            </Link>
            <Link
              className={mode === "register" ? "active" : ""}
              href="/registracija"
            >
              {t("Napravite nalog")}
            </Link>
          </div>
        )}
        <ActionForm
          endpoint="/api/auth"
          payload={{ mode }}
          label={
            {
              login: t("Prijavite se"),
              register: t("Napravite nalog"),
              reset: t("Pošaljite link"),
              update: t("Sačuvajte novu lozinku"),
            }[mode]
          }
          disabled={!ready}
          redirect={
            mode === "login" || mode === "update" ? "/nalog" : undefined
          }
        >
          {mode === "register" && (
            <label>
              {t("Ime i prezime")}
              <input
                name="name"
                autoComplete="name"
                required
                minLength={2}
                maxLength={100}
              />
            </label>
          )}
          {mode !== "update" && (
            <label>
              {t("Email adresa")}
              <input name="email" type="email" autoComplete="email" required />
            </label>
          )}
          {mode !== "reset" && (
            <label>
              {t("Lozinka")}
              <input
                name="password"
                type="password"
                autoComplete={
                  mode === "login" ? "current-password" : "new-password"
                }
                required
                minLength={mode === "login" ? 1 : 10}
                maxLength={128}
              />
            </label>
          )}
          {mode === "register" && (
            <>
              <label className="check-label">
                <input type="checkbox" name="club" value="yes" />
                {t("Želim besplatno članstvo u casa practica klubu.")}
              </label>
              <p className="fine-print">
                {t("Pravljenjem naloga prihvatate")}{" "}
                <Link href="/uslovi">{t("uslove korišćenja")}</Link>{" "}
                {t("i upoznati ste sa")}{" "}
                <Link href="/privatnost">{t("obradom podataka")}</Link>.
              </p>
            </>
          )}
        </ActionForm>
        <div className="form-foot" style={{ marginTop: 20 }}>
          <Link href="/">{t("Nazad na početnu")}</Link>
          {mode === "login" && (
            <Link href="/prijava?mode=reset">{t("Zaboravljena lozinka?")}</Link>
          )}
        </div>
      </div>
    </section>
  );
}
