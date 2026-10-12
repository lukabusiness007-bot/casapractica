import { getTranslator } from "@/lib/i18n/server";
export async function Faq() {
  const t = await getTranslator();

  const questions = [
    [
      t("Mogu li da sastavim svoj paket?"),
      t(
        "Da. U Casa planovima izaberite usluge i učestalost, pa pošaljite zahtev. Tim potvrđuje dostupnost, obim i konačnu ponudu. Slanje zahteva ne aktivira automatsku pretplatu.",
      ),
    ],
    [
      t("Kako da zakažem uslugu?"),
      t(
        "Izaberite uslugu i popunite kratak zahtev. Zatim otvorite pripremljenu WhatsApp poruku i pošaljite je našem timu. Zajedno dogovaramo detalje, cenu i termin.",
      ),
    ],
    [
      t("Da li moram da budem članica kluba?"),
      t(
        "Ne. Usluge su dostupne i bez članstva. Besplatan klub je tu za one koje žele pristup posebnim ponudama i novitetima pre svih.",
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
      t("Mogu li da promenim dogovoreni termin?"),
      t(
        "Javite nam se preko istog WhatsApp razgovora i navedite broj zahteva. Tim će sa vama proveriti mogućnost promene termina.",
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
