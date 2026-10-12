import { publicPageMetadata } from "@/lib/seo";
import { getLocale, getTranslator } from "@/lib/i18n/server";
export default async function Privacy() {
  const t = await getTranslator();

  return (
    <div className="container page-section">
      <article className="prose">
        <span className="eyebrow">{t("VAŠI PODACI")}</span>
        <h1>{t("Obaveštenje o privatnosti")}</h1>
        <p className="notice">
          {t(
            "Radna verzija za pregled platforme. Pre početka stvarnog poslovanja potrebno je uneti identitet i kontakt rukovaoca, rokove čuvanja, pravni osnov obrade i postupak ostvarivanja prava.",
          )}
        </p>
        <h2>{t("Podaci za dogovor o usluzi")}</h2>
        <p>
          {t(
            "Kratak zahtev prikuplja ime, telefon i deo grada. Email, željeni datum i dodatne želje su opcioni. Izbor usluga, dopuna, načina kontakta i ličnih preporuka koristimo za dogovor o usluzi. Ne unosite osetljive informacije u napomenu.",
          )}
        </p>
        <h2>{t("Korisnički nalog i klub")}</h2>
        <p>
          {t(
            "Pri sastavljanju Casa plana čuvamo izabrane usluge i učestalost u vašem zahtevu, radi pripreme ponude.",
          )}
        </p>
        <p>
          {t(
            "Nalog služi pregledu sopstvenih zahteva i ponuda. Klub je besplatan i pristupanje je dobrovoljno. Lozinkama upravlja servis za autentifikaciju; tim nema pristup vašoj lozinci.",
          )}
        </p>
        <h2>{t("Povezani servisi")}</h2>
        <p>
          {t(
            "Supabase čuva podatke naloga i zahteva. Stripe obrađuje kartično plaćanje; platforma ne čuva broj kartice. WhatsApp se otvara tek kada izaberete nastavak razgovora. Poruku šaljete sami.",
          )}
        </p>
        <h2>{t("Profil doma i preporuke")}</h2>
        <p>
          {t(
            "Profil doma čuva vaše uređaje, želje, zadatke i datum održavanja. Kod preporuke povezujemo sa zahtevom radi provere objavljene pogodnosti. Lične preporuke i podsetnike birate u formi; tim ih obrađuje prema tom izboru.",
          )}
        </p>
        <h2>{t("Kolačići")}</h2>
        <p>
          {t(
            "Platforma koristi kolačiće potrebne za prijavljivanje. Analitika sajta uključuje se samo kada je dozvolite. Izbor se čuva u browseru, a nasumičan ID sesije traje u toj sesiji. Događaji ne sadrže ime, telefon, email ili adresu. Nema oglasnih piksela.",
          )}
        </p>
        <h2>{t("Pristup podacima")}</h2>
        <p>
          {t(
            "Korisnica vidi svoje zahteve. Ovlašćeni tim pristupa podacima potrebnim za obradu zahteva. Kontakt za pitanja, ispravku i brisanje podataka biće objavljen pre aktiviranja usluga.",
          )}
        </p>
      </article>
    </div>
  );
}

export async function generateMetadata() {
  return publicPageMetadata(await getLocale(), "/privatnost");
}
