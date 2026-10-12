import { getTranslator } from "@/lib/i18n/server";
export async function Faq() {
  const t = await getTranslator();

  const questions = [
    [
      t("Kako organizujete dolazak u zgradu?"),
      t("U zahtevu navedite sprat, lift i pravila kućnog reda. Pristup stanu, unos opreme i termin bučnih radova usaglašavamo sa vama pre dolaska. Za radove na zajedničkim delovima zgrade prethodno dogovaramo potrebnu saglasnost."),
    ],
    [
      t("Kako da zakažem uslugu?"),
      t(
        "Pošaljite kratak zahtev za uslugu ili razgovor o planu. Tim vas kontaktira na izabrani način. WhatsApp je opciona mogućnost da odmah dodate detalje.",
      ),
    ],
    [
      t("Kako saznajem cenu i plaćam?"),
      t(
        "Cena zavisi od obima posla. Posle dogovora dobijate konačnu ponudu u svom nalogu, gde možete da je pregledate i platite karticom. Plaćanje je dostupno nakon aktiviranja platnog servisa.",
      ),
    ],
    [
      t("Na kojoj teritoriji su usluge dostupne?"),
      t(
        "Počinjemo u Beogradu. Unesite svoju lokaciju prilikom slanja zahteva, a naš tim će potvrditi dostupnost za vašu adresu.",
      ),
    ],
    [
      t("Mogu li da pošaljem više poslova u jednom zahtevu?"),
      t(
        "Da. Pošaljite svoju listu kroz zahtev za posetu. Tim će sa vama dogovoriti obim, cenu i da li se poslovi mogu završiti u jednom dolasku.",
      ),
    ],
    [
      t("Mogu li da promenim dogovoreni termin?"),
      t(
        "Javite nam se preko istog WhatsApp razgovora i navedite broj zahteva. Tim će sa vama proveriti mogućnost promene termina.",
      ),
    ],
    [
      t("Da li moram da budem članica kluba?"),
      t(
        "Ne. Usluge su dostupne i bez članstva. Besplatan klub je tu za one koje žele pristup posebnim ponudama i novitetima pre svih.",
      ),
    ],
  ];

  return (
    <section className="faq-section container" id="pitanja">
      <div>
        <span className="eyebrow">{t("DOBRO JE ZNATI")}</span>
        <h2>
          {t("Još nešto")}
          <br />
          <em>{t("vas zanima?")}</em>
        </h2>
        <p>
          {t("Jednostavni odgovori.")}
          <br />
          {t("Za jednostavniji svaki dan.")}
        </p>
      </div>
      <div className="faq-list">
        {questions.map(([q, a]) => (
          <details key={q}>
            <summary>
              {q}
              <span>+</span>
            </summary>
            <p>{a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
