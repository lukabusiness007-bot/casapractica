import { publicPageMetadata } from "@/lib/seo";
import { businessDetails } from "@/lib/business";
import { BusinessContact } from "@/components/business-contact";
import { getLocale, getTranslator } from "@/lib/i18n/server";
export default async function Terms() {
  const t = await getTranslator();
  const business = businessDetails();

  return (
    <div className="container page-section">
      <article className="prose">
        <span className="eyebrow">{t("JASAN DOGOVOR")}</span>
        <h1>{t("Uslovi korišćenja")}</h1>
        <p className="notice">
          {t(
            "Radna verzija za pregled. Pre početka stvarnog poslovanja potrebno je uneti poslovne podatke pružaoca, konačne uslove otkazivanja i povraćaja, reklamacije i informacije o računima.",
          )}
        </p>
        {business.legalName && <p>{business.legalName}</p>}
        {business.address && <p>{business.address}</p>}
        <BusinessContact />
        <h2>{t("Zahtev i rezervacija")}</h2>
        <p>
          {t(
            "Slanje zahteva i otvaranje WhatsApp-a ne predstavljaju potvrđenu rezervaciju. Obim posla, cena i termin dogovaraju se sa timom. Lokacija usluge je Beograd, uz potvrdu dostupnosti za konkretnu adresu.",
          )}
        </p>
        <h2>{t("Ponuda i plaćanje")}</h2>
        <p>
          {t(
            "Konačna ponuda prikazuje osnovni iznos, eventualni članski popust i ukupan iznos. Plaćanje se pokreće tek na vaš izbor. Status uplate potvrđuje platni servis.",
          )}
        </p>
        <h2>{t("casa practica klub")}</h2>
        <p>
          {t(
            "Članstvo je besplatno. Članovi ostvaruju 5% popusta na redovnu cenu usluga, uključujući transport iz cenovnika. Za usluge na upit popust se obračunava na dogovorenu osnovnu cenu. Članstvo mora biti potvrđeno pre početka plaćanja. Popust i kredit za preporuku ne sabiraju se; bira se povoljnija pogodnost. Već zaključane ili plaćene ponude ne menjaju se naknadno.",
          )}
        </p>
        <h2>{t("Casa planovi")}</h2>
        <p>
          {t(
            "Za redovne planove dogovaramo mesečnu ponudu i uplatu unapred, nakon aktiviranja naplate. Trajanje poseta, promene termina i eventualni prenos posete navode se u vašoj ponudi. Majstorski rad ima zaseban obračun u okviru istog plana.",
          )}
        </p>
        <h2>{t("Promene i otkazivanje")}</h2>
        <p>
          {t(
            "Za promenu termina ili otkazivanje javite se timu u istom WhatsApp razgovoru, uz broj zahteva. Uslove konkretne usluge potrebno je dogovoriti pre prihvatanja ponude.",
          )}
        </p>
      </article>
    </div>
  );
}

export async function generateMetadata() {
  return publicPageMetadata(await getLocale(), "/uslovi");
}
