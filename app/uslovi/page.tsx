import { publicPageMetadata } from "@/lib/seo";
import { getLocale, getTranslator } from "@/lib/i18n/server";
export default async function Terms() {
  const t = await getTranslator();

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
            "Članstvo je besplatno. Popusti i raniji pristup važe prema uslovima konkretne objavljene pogodnosti. Samo članstvo ne garantuje popust na svaku uslugu.",
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
