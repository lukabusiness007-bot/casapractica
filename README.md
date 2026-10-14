# casa practica

Premium platforma za usluge u domu u Beogradu. Next.js 16, React, TypeScript, Tailwind CSS, Supabase Auth/PostgreSQL i Stripe Checkout.

Osnovna smernica za ceo sajt: prema poslovnom kontekstu, 90% kupaca živi u stanovima. Tekstovi, izbor istaknutih usluga i fotografije treba prvenstveno da prikazuju život u beogradskom stanu: popravke, montažu TV-a i polica, organizaciju garderobera, održavanje klime, posteljinu i svakodnevnu pomoć. Stan ne mora biti mali; koristimo primere za različite kvadrature bez pretpostavke da kupac ima dvorište, garažu ili gostinsku sobu. Sprat, lift, pristup opremi i kućni red uzimaju se u obzir pri dogovoru. Usluge za kuće ostaju u katalogu kao dopunska ponuda. Podatak od 90% je interna smernica, ne javna marketinška tvrdnja.

## Deploy na Vercel

Repozitorijum: [lukabusiness007-bot/casapractica](https://github.com/lukabusiness007-bot/casapractica).

1. U [Vercel Import](https://vercel.com/new/import?s=https%3A%2F%2Fgithub.com%2Flukabusiness007-bot%2Fcasapractica) izaberite ovaj GitHub repozitorijum i granu `main`.
2. Root Directory je koren repozitorijuma (`./`). `vercel.json` postavlja **Next.js**, `npm ci` i `npm run build`; `package.json` bira **Node.js 24.x**. Output Directory ostavite na Next.js podrazumevanoj vrednosti.
3. Za prvi pregled dizajna nisu potrebni servisni ključevi. Kliknite **Deploy**. U tom režimu katalog radi, a slanje zahteva, nalozi i plaćanje ostaju označeni kao neaktivni.
4. Za aktiviranje servisa unesite promenljive u **Settings → Environment Variables**, zatim pokrenite novi deployment:

| Promenljiva | Kada je potrebna |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Opciono, za izričit produkcioni HTTPS domen. Na Vercel-u ne unosite localhost. Bez ove vrednosti koristi se Vercel domen projekta; preview koristi adresu svog deployment-a. |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase projekat za prijavu, naloge i zahteve. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Javni Supabase ključ. |
| `SUPABASE_SERVICE_ROLE_KEY` | Serverski ključ za zahteve i administraciju. |
| `WHATSAPP_NUMBER` | Kontakt tima, u međunarodnom formatu, samo cifre. |
| `STRIPE_SECRET_KEY` | Stripe Checkout, nakon pripreme naplate. |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook `/api/stripe/webhook`. |
| `PAYMENTS_LIVE_ENABLED` | `false` dok se ne aktivira i proveri stvarna naplata. |

5. Izvršite Supabase migracije i seed prema uputstvu ispod. U Supabase Auth podesite konačni Site URL i callback `https://VAS-DOMEN/auth/callback`, uključujući jezičke i recovery parametre. U Stripe-u povežite isti domen sa webhook-om.

Vercel sistemske promenljive moraju ostati dostupne aplikaciji da automatsko određivanje domena radi. Preview deployment-i imaju `noindex`. Za prilagođeni domen postavite `NEXT_PUBLIC_SITE_URL` u **Production** okruženju; u **Preview** ga ostavite praznim ili koristite zaseban preview domen. Naknadni push na `main` pokreće novi deployment kada je repo povezan sa Vercel projektom.

Dokumentacija: [Next.js na Vercel-u](https://vercel.com/docs/frameworks/full-stack/nextjs), [sistemske promenljive](https://vercel.com/docs/environment-variables/system-environment-variables), [Node.js verzije](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions).

## Lokalni pregled

```sh
npm ci
npm run dev
```

Otvorite http://localhost:3000. Bez konfiguracije su dostupni početna, katalog, stranice usluga, klub i prikaz formi. Registracija, slanje zahteva i plaćanje ostaju jasno označeni kao neaktivni; nema lažnog čuvanja u browseru.

```sh
cp .env.example .env.local
```

Unesite vrednosti u `.env.local`; ne delite ključeve u kodu, screenshotovima ni verzionisanim fajlovima.

## Supabase

1. Kreirajte Supabase projekat. U SQL editoru izvršite migracije `001_initial.sql`, `002_premium_catalog.sql`, `003_growth.sql`, `004_home_services.sql`, `005_service_prices.sql`, `006_rounded_service_prices.sql`, `007_washing_prices.sql` i `008_service_offer.sql` iz direktorijuma `supabase/migrations`, tim redom, pa `supabase/seed.sql`. Na postojećoj bazi izvršite samo migracije koje još nisu primenjene. Migracija `004_home_services.sql` dodaje prošireni katalog bez izmena postojećih usluga, cena, vidljivosti, sadržaja ili zahteva.
Migracija `006_rounded_service_prices.sql` zaokružuje izvorne početne cene na 500 RSD (ispod 1.000 RSD na 100 RSD), samo kada cena još odgovara izvornoj vrednosti. Migracija `007_washing_prices.sql` postavlja početnu cenu pranja tepiha na 980 RSD/m² prema korisnikovom udvostručenom cenovniku bez izmene cena drugih usluga, ponuda i plaćanja. Detaljan cenovnik je u `lib/washing-pricing.ts`.

2. U okruženje unesite URL projekta, anon ključ i **serverski** service-role ključ. Nijedan privilegovani ključ nema `NEXT_PUBLIC_` prefiks.
3. U Auth uključite email/password i obaveznu potvrdu email adrese. Podesite Site URL i dozvoljeni callback `https://vas-domen/auth/callback` (lokalno `http://localhost:3000/auth/callback`). Dodajte i callback sa `?next=/auth/oporavak` ako vaša allowlist konfiguracija traži tačan URL. Aplikacija koristi PKCE exchange i standardne Supabase confirmation/recovery linkove; ne menjajte template na direktan token link bez corresponding callback podrške.
4. Za stvarnu isporuku emaila podesite SMTP provajdera u Supabase. Podesite Supabase Auth rate limits i zaštitu od zloupotrebe prema saobraćaju.
5. Napravite i potvrdite nalog administratora kroz aplikaciju. Njegov UUID dodajte **ručno** u tabelu `public.admins` preko SQL editora:

```sql
insert into public.admins(user_id) values ('UUID-POTVRDJENOG-NALOGA');
```

Admin pristupa `/admin`. Registracioni metapodaci ne mogu da daju admin ulogu. Korisnice mogu da vide samo svoje podatke kroz RLS; upisi idu kroz proverene serverske rute.

Gostujući zahtev se vezuje za nalog isključivo nakon potvrde istog emaila. Izričit izbor članstva tokom registracije aktivira klub nakon potvrde; članstvo se može aktivirati i naknadno iz naloga.

## WhatsApp

Postavite `WHATSAPP_NUMBER` u međunarodnom formatu, samo cifre, npr. `381...`, bez `+` i razmaka. Platforma prvo čuva zahtev pa prikazuje link sa nazivom usluge i brojem zahteva. Ne šalje poruku automatski i ne potvrđuje termin. Ako broj nedostaje, zahtev ostaje u administraciji, a korisnica dobija jasno obaveštenje.

## Stripe

1. Unesite testni `STRIPE_SECRET_KEY`. `PAYMENTS_LIVE_ENABLED` ostaje `false`.
2. Podesite webhook `/api/stripe/webhook` za `checkout.session.completed`, `checkout.session.async_payment_succeeded` i `charge.refunded`, a signing secret unesite kao `STRIPE_WEBHOOK_SECRET`.
3. Za lokalnu proveru, uz instaliran i prijavljen Stripe CLI:

```sh
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

4. Kreirajte zahtev, potvrdite email korisnice, zatim u adminu sačuvajte konačnu ponudu. Platite je iz njenog naloga Stripe test karticom. Proverite i odbijenu karticu, zatvaranje Checkout-a, ponovljen webhook i povraćaj iz Stripe Dashboard-a.
5. Tek nakon potvrde podrške RSD za konkretan poslovni nalog, poslovnih podataka i uspešnih testova unesite live ključeve, live webhook secret i postavite `PAYMENTS_LIVE_ENABLED=true`.

Stripe SDK je zaključan kroz package-lock. Checkout koristi `allowed_payment_method_types` prema ugrađenim tipovima Stripe 23. Iznosi se čuvaju kao cele najmanje novčane jedinice (RSD × 100). Korisnički payload sadrži samo ID ponude; cenu uzima server. Potpisani webhook jedini potvrđuje naplatu. Prikaz success URL-a ne znači da je plaćeno.

Ponuda se zaključava čim započne Checkout, čime je sprečena promena iznosa tokom uplate. Postojeća otvorena sesija se koristi ponovo, a istekla dobija novu generaciju uz idempotency ključ. Odbijena kartica/odustajanje ostavljaju ponudu neplaćenom. Povraćaji se iniciraju iz Stripe Dashboard-a i webhook ih evidentira, uključujući delimične i događaje pristigle van redosleda. Posle započetog Checkout-a aplikacija odbija otkazivanje dok se ne evidentira puni povraćaj; tim prvo rešava uplatu sa korisnicom u Stripe-u. Nakon punog povraćaja admin može da označi zahtev kao otkazan. Izmena već zaključanih ponuda nije deo prve verzije.

## Administracija

- **Usluge:** naziv, URL oznaka, fotografija, opis, početna cena, redosled i vidljivost. Prazna cena znači „Cena na upit“.
- **Zahtevi:** kontakt, napomena, status, termin i konačna ponuda. Termini u admin formi koriste vremensku zonu uređaja, čuvaju se kao UTC i korisnici prikazuju kao Europe/Belgrade.
- **Ponude:** osnovna cena, članski popust i opis. Popust je dozvoljen samo za povezanu članicu. Važeća ponuda je jedna po zahtevu i može se menjati do početka naplate.
- **Pogodnosti:** dostupnost članicama, datum javne dostupnosti, opciono isticanje i procenat. Članski procenat je opis objavljene ponude; tim unosi odgovarajući konačni popust u ponudu za konkretnu uslugu.
- **Članice:** pregled imena i datuma pristupanja.

Nema automatizovanih poruka, rasporeda izvođača, isplata trećim licima ni automatskih rezervacija. Tim šalje korisnici link do naloga u postojećem WhatsApp razgovoru. Nema izmišljenih ocena, recenzija ili popusta.

## Provere

```sh
npm run typecheck
npm test
npm run build
```

Testovi koriste PGlite (stvarni PostgreSQL engine u procesu) za migraciju, RLS, potvrđeno preuzimanje zahteva, sprečavanje dodele admin uloge preko metadata, zaključavanje ponuda, pokušaj promene iznosa, duple webhook događaje, delimične povraćaje, raniji pristup i ograničenje broja zahteva. UUID funkcija je ugrađena u testni PostgreSQL; samo `create extension pgcrypto` se izostavlja u testu. Testovi ne kontaktiraju stvarni Supabase ili Stripe nalog.

Vizuelne i navigacione provere obavljene su Playwright CLI-jem. Snimci su u ignorisanom `output/playwright/` direktorijumu. Bez servisnih ključeva nije moguće potvrditi isporuku emailova, stvarni Stripe Checkout niti produkcioni webhook end-to-end.

## Produkcija

Projekat je pripremljen za Vercel, nije javno objavljen. Podesite sve promenljive iz `.env.example`, uključujući tačan `NEXT_PUBLIC_SITE_URL`, izvršite migraciju i seed, dodajte callback URL-ove i Stripe endpoint. Provera Origin zaglavlja mora odgovarati stvarnom domenu. Za preview domene koristite zasebnu konfiguraciju i testne ključeve.

Pre puštanja dopunite radne stranice privatnosti/uslova stvarnim poslovnim podacima i potvrđenim uslovima poslovanja. Pregledajte i proverite naplatu i otkazivanje sa poslovnim timom. Greške webhook-a vraćaju 500 radi Stripe ponavljanja; pratite Stripe failed deliveries i Vercel server logs. Aplikacija ne instalira marketinške trackere.

## Aktuelna ponuda usluga

Migracija `008_service_offer.sql` deaktivira 16 uklonjenih usluga uz očuvanje istorije zahteva, proširuje iznošenje na smeće, šut i nameštaj i dodaje čišćenje doma i krečenje sa cenom na upit. `lib/service-availability.ts` sprečava prikaz i nove zahteve za povučene usluge i pre primene migracije. Stari mesečni paketi više se ne nude novim korisnicima; njihove definicije su sačuvane za istoriju i zahteve za promenu ritma. Redovne posete dogovaraju se preko sastavljača paketa od dostupnih usluga.

## Fotografije

Katalog i stranice usluga koriste namenski generisane, fotorealistične ilustracije konkretnih zadataka u `public/images/services/`. To nisu fotografije našeg tima niti dokumentacija obavljenih radova. Generisane su ugrađenim `image_gen` alatom; specifikacije i kompletan skup promptova su u `docs/service-image-prompts.json`. WebP verzije su optimizovane na širinu 900 px i učitavaju se preko `next/image`. `lib/service-images.ts` zamenjuje originalne opšte enterijere i zadržava prilagođene fotografije iz administracije.

Lokalno sačuvane fotografije enterijera sa Unsplash-a, korišćene kao ilustracija doma (ne kao fotografije izvođača ili potvrda obavljenih radova):

- hero: `photo-1600210492486-724fe5c67fb0`
- tepih: `photo-1600166898405-da9535204843`
- kuhinja: `photo-1556912172-45b7abe8b7e1`
- dnevna soba: `photo-1600607687920-4e2a09cf159d`
- lampa: `photo-1507473885765-e6ed057f782c`
- enterijer / klima: `photo-1616486338812-3dadae4b4ace`
- klub: `photo-1616486029423-aaa4789e8c9a`

Dizajn prati referencu https://getcasa.com/: krem kartice i maslinast footer. Sajt koristi isti lokalni Diatype font kao header (`public/fonts/diatype.woff2`) za naslove i sav ostali tekst. Ikonice kuće, alata i sata iz reference su u `public/images/casa/`. Početna prikazuje lokalnu fotografiju enterijera stana `public/images/hero.jpg`. Ranija komponenta `components/hero-video.tsx` ostaje sačuvana, ali se ne koristi na početnoj jer strani video nije prilagođen pretežno stanarskoj publici. Izbor usluge u `components/service-explorer.tsx` podržava miš, dodir i tastaturu.

## Jezici, identitet i SEO

- Zaglavlje koristi znak kuće i naziv casa practica, usklađen sa Casa referencom. Ikonica i Open Graph slika prate isti identitet. Raniji vektorski grb ostaje sačuvan u `public/brand/crest.svg`.
- Srpski zadržava postojeće adrese. Engleski, ruski, nemački i turski koriste `/en`, `/ru`, `/de`, `/tr`. Izbor jezika zadržava stranicu, query i anchor. Jezici se renderuju na serveru, bez zavisnosti od JavaScript prevoda.
- `lib/i18n/messages.json` sadrži prevode sadržaja, kataloga, obrazaca, naloga i poznatih API poruka. Novi ili izmenjeni tekstovi iz administracije treba da dobiju prevode u ovom rečniku; nepoznat sadržaj ostaje na izvornom jeziku. Lične beleške, nazivi korisnica i konkretne ponude tima se ne prevode automatski. Administracija ostaje na srpskom.
- Svaka javna stranica ima zaseban naslov/opis, svoj canonical i uzajamne `hreflang` oznake sa `x-default`. Sitemap obuhvata početnu, katalog, klub i aktivne usluge na svih šest jezika. Ne navodimo izmišljene recenzije, cene, adresu ili radno vreme.
- `Organization`, `WebSite`, `WebPage`, `Service` i `BreadcrumbList` JSON-LD opisuju stvarni sadržaj. Open Graph slika koristi novi identitet. Fotografije koriste responsive `next/image`, a fontovi uključuju ćirilicu.
- Nalozi, prijava, registracija, administracija i radne verzije pravnih tekstova imaju `noindex`. Lokalno i Vercel Preview okruženje imaju `noindex` i blokadu u `robots.txt`. Vercel Production automatski koristi domen projekta; za prilagođeni konačni HTTPS domen opciono podesite `NEXT_PUBLIC_SITE_URL` i ponovo izgradite aplikaciju; canonical, sitemap i pravila indeksiranja tada koriste taj domen. Za preview deployment zadržite neprodukcioni URL. Ne unosite izmišljeni domen.
- U Supabase allowlist dodajte produkcioni `/auth/callback` sa parametrima za podržane jezike i oporavak lozinke. Posle registracije, oporavka lozinke i novog Stripe Checkout-a povratak zadržava izabrani jezik. Ranije otvorene Stripe sesije zadržavaju prethodno definisani povratni URL.
- Kada domen bude izabran i sajt objavljen, verifikujte Google Search Console i podnesite `/sitemap.xml`. To nije urađeno lokalnim izmenama. Uslovi/privatnost ostaju jasno označeni radni tekstovi.

Dodatna provera renderovanog HTML-a (pokrenite lokalni server pre provere):

```sh
TEST_SITE_URL=http://localhost:3000 npx tsx scripts/check-site.mjs
```

Proverava 65 stranica, jezike, canonical/hreflang oznake, sitemap, JSON-LD, 404 odgovore, robots i sliku za deljenje. Automatizovani testovi dodatno proveravaju prevode i putanje. Stvarni email, zahtevi i plaćanja zahtevaju podešene servise.

## Premium katalog i Casa planovi

Katalog ima 26 pojedinačnih usluga u četiri celine: montaža i postavljanje, popravke i održavanje, tehnologija u domu i svakodnevna briga. Postojeće adrese i ID-evi usluga ostaju važeći, uključujući `/usluge/ugradnja-tv-a`, sada prikazanu kao Montaža TV-a. Grupisanje podrazumevanih usluga koristi njihove URL oznake; nove usluge iz administracije prikazuju se u svakodnevnoj brizi. Fotografije enterijera ilustruju grupe usluga.

`/paketi` predstavlja Casa jednom, Casa mesečno, Casa svake nedelje, Casa održavanje i Moja Casa. Korisnica bira do 12 različitih aktivnih usluga i učestalost za svaku. Promena pojedinačnog ritma prebacuje izbor u Moja Casa. Kontakt forma šalje paket na postojeći `/api/zahtevi`; server proverava strukturu, aktivne usluge i njihove stvarne nazive i upisuje pregled paketa u napomenu zahteva. Pregled je dostupan administraciji i korisnici u nalogu. Slobodan tekst napomene služi dodatnom obimu, količinama i željama korisnice.

Paket je zahtev za konkretnu ponudu. Ne aktivira pretplatu, ne naplaćuje karticu i ne garantuje termin. Tim dogovara trajanje, mesečni obim, materijal, dodatni stručni rad i uslove prenosa/otkazivanja; postojeća konačna ponuda i Checkout ostaju način naplate. Automatska obnova, čuvanje kartice za buduće naplate, kalendar raspoloživosti i praćenje potrošnje poseta nisu uvedeni. Cene paketa se ne izmišljaju pre obračuna stvarnih troškova tima.

Klub ostaje besplatan. Redovni termini, kontinuitet izvođača i sezonski plan dogovaraju se uz plaćene Casa planove. Rođendanske pažnje, poklon-posete, preporuke i događaji prikazani su kao pogodnosti koje važe samo kada su objavljene sa konkretnim uslovima; nisu automatski aktivirane nagrade ili obećani događaji. Novi sadržaj je preveden na engleski, ruski, nemački i turski.

## Prodajni tok, lični planovi i praćenje

Pre deployment-a povezanog sa stvarnom bazom izvršite `supabase/migrations/003_growth.sql`, posle 001 i 002. Migracija ne briše postojeće podatke; email zahteva postaje opcion i dodaju se komercijalni kontekst, profili domova, analitika, preporuke i stvarni prikazi tima/radova. Bez konfiguracije ostaje pregled sajta i onemogućeno slanje zahteva.

- `/konsultacije` je kratak kontakt za prvu Casa posetu, Signature, Private i promenu ritma. Ime, telefon i deo grada su obavezni; email i datum se otkrivaju u opcionim detaljima. Zahtev se čuva pre opcionog WhatsApp razgovora. Nalog se ne traži za prvi kontakt. Tim mora prikupiti email u administraciji da nepovezani gost kasnije potvrdi nalog, preuzme zahtev i pristupi postojećoj bezbednoj naplati. Zahtev bez emaila ne vezuje se za nalog preko telefona.
- Na stranicama usluga prikazuju se do dve odgovarajuće dodatne usluge i jedna relevantna dopuna. Server proverava vezu sa osnovnom uslugom, dostupnost i stvarne nazive; cena i konačan obim i dalje idu kroz potvrđenu ponudu. Nijedna dopuna nije unapred izabrana ili automatski naplaćena.
- `/kolekcije` ima pet kolekcija sa pregledom uključenih usluga i jednim zahtevom. Kolekcija se može zatražiti samo kada su sve njene usluge aktivne. Glavna stranica planova ističe tri nivoa; izbor manjeg obima, sezonske brige ili pauze traži dogovor, bez automatske izmene postojeće ponude.
- Nalog podržava više profila domova sa uređajima, željama, narednim zadacima i datumom održavanja. Profile čitaju vlasnik i administrator. Upisi su serverski i ograničeni na prijavljenog vlasnika. Ne prikupljaju se pristupni kodovi. Korisnik može oceniti samo svoju završenu posetu i ponovo zatražiti uslugu; Signature se preporučuje nakon ocene 4–5.
- Korisnik dobija svoj link za preporuku. Kod se beleži u novom zahtevu; istekao/neaktivan ili sopstveni kod ne blokira prijem, ali se ne pripisuje preporuci. Admin pregled ističe preporuke uz prvu neto plaćenu porudžbinu kontakta. Stvarna nagrada, iznos i proveravanje uslova ostaju ručni, prema objavljenoj klupskoj pogodnosti; nema automatskog kreditiranja.
- `Administracija → Prodaja i praćenje` prikazuje neto prihod, prosečnu porudžbinu, ostvareni prihod po kontaktu, pokrivenost troškovima i ponovnu kupovinu u zrelim kohortama od 30/60/90 dana. Doprinos uključuje unete troškove refundiranih porudžbina; nepoznati troškovi se ne računaju kao nula. Ovo nisu prognoza LTV-a ni konačan profit. Kontakt se grupiše po ciframa telefona, pa tim treba dosledno da koristi međunarodni format.
- Po završetku posete automatski se predlaže provera za dva dana samo kada je klijent izabrao lične preporuke/podsetnike. Admin može promeniti datum, povod i status. Red za kontakte daje poziv ili nacrt WhatsApp poruke; ništa se ne šalje automatski. Slabe ocene prvo usmeravaju na rešavanje kvaliteta. Datumi koriste Europe/Belgrade.
- Analitika je prva strana, bez oglasnih piksela. Isključena je dok posetilac ne dozvoli merenje; izbor se čuva lokalno, nasumičan ID u sessionStorage. Događaji imaju samo kontrolisan tip, tehnički kontekst i ID sesije, bez kontakta, adrese ili punog URL-a. Server proverava izvor i ograničava broj događaja, a ponovljene događaje iste vrste/konteksta u sesiji deduplikuje. Konverzija u adminu obuhvata samo sesije sa dozvoljenim merenjem, povezane sa stvarnim zahtevom/uplatom. Ne predstavlja broj osoba. Ne postoji predviđena stopa rasta konverzije.
- `Administracija → Tim i radovi` prima samo stvarne zapise i fotografije uz dozvolu. Nacrt je podrazumevan. Objavljeni zapisi prikazuju se uz Casa standard na početnoj; prazna baza ne prikazuje izmišljene izvođače, recenzije ili završene radove. Dinamičan sadržaj iz administracije prevodi se kroz postojeći jezički rečnik.

Automatska naplata pretplata, automatski email/WhatsApp, garantovani termini i kalendar zaposlenih nisu aktivirani. Sve javne ponude imaju dogovoren obim i cenu. Za stvarne naplate i isporuku poruka potrebni su odgovarajući povezani servisi i zasebna provera poslovne konfiguracije.

## Mesečni paketi, cenovnik i operativa

`lib/subscriptions.ts` definiše Casa Garderoba (10.000 RSD), Casa Ritam (18.000 RSD), Casa Na čuvanju (12.000 RSD) i Casa Family (38.000 RSD). To su mesečne ponude sa jasno ograničenim obimom. Izbor paketa prenosi se kroz `commerce.subscription_id`; server formira opis i cenu u zahtevu. Slanje zahteva ne aktivira automatsku pretplatu niti Stripe recurring naplatu. Tim prvo potvrđuje dostupnost, obim, početak i način mesečne uplate.

`lib/service-pricing.ts` čuva informativne cene za 24 standardna zadatka, na osnovu javnih beogradskih cenovnika proverenih 12.10.2026. Naša referentna cena je 2× prosek malog uporedivog uzorka, odnosno 2× jedna referenca gde nema više izvora. Cena se odnosi samo na prikazani obim i jedinicu; materijal, posebni uslovi, minimum i troškovi dolaska potvrđuju se ponudom. Za preostalih 30 usluga ostaje cena na upit.

Na postojećoj bazi primeniti `004_home_services.sql`, pa `005_service_prices.sql` nakon ranije primenjenih 001–003. Migracija 005 popunjava samo nedostajuće cene i čuva administratorove cene, zahteve, već prihvaćene ponude i uplate. Seed uključuje nove usluge i nove cene; na postojećoj produkciji ne ponavljati migracije 001 i 003.

WhatsApp Business služi za kontakt; admin sistem ostaje evidencija. Koordinator vodi svaki posao kroz prijem, procenu partnera, ponudu, potvrdu termina, izvršenje i kontrolu. Svaki posao mora imati ID, odgovornu osobu, prihod, trošak partnera i termin. Izvođač dobija zaseban radni nalog i ne menja cenu bez nove potvrde korisnika. Brzi odgovori `/start`, `/ponuda`, `/partner`, `/gotovo`, `/pauza` i `/ponovi` olakšavaju ručni rad koordinatora. Ovo nisu automatske WhatsApp komande; API automatizacija i zajednički inbox zahtevaju dodatnu vezu sa WhatsApp Business Platform.

Kredit za preporuku tim odobrava ručno nakon provere koda preporuke, prvog izvršenog i plaćenog posla od najmanje 10.000 RSD i članstva. Svaka osoba dobija 500 RSD kredita za sledeću uslugu, najviše jednom mesečno, sa rokom 90 dana i bez sabiranja akcija. Odobrenje i iskorišćenje beleže se uz zahtev; kredit se uključuje u članski popust sledeće ponude. Kontrola kvaliteta i rešavanje reklamacija važe za sve korisnike.


## Casa Practica Club i prodajni tok (009)

Na povezanoj bazi, nakon 001–008 primeniti `supabase/migrations/009_club_conversion.sql`. Nije potrebno menjati redovne cene ili ponavljati seed na postojećoj bazi. Bez Supabase konfiguracije lokalni sajt ostaje pregled; registracija, zahtevi i stvarna naplata nisu aktivni. Bez migracije 009 nova administrativna ponuda i checkout namerno ostaju nedostupni, kako prikaz klupske cene ne bi odstupao od naplate.

- Stalni popust je 5%, obračunat u celobrojnim manjim jedinicama RSD. Redovna i klupska cena prikazuju se na karticama, detaljima i celom cenovniku pranja, uključujući transport i raspone. Za cenu na upit popust se obračunava na dogovorenu cenu. Članstvo pre početka plaćanja ažurira nezaključane ponude; postojeće zaključane/plaćene ponude se čuvaju.
- Popup na početnoj otvara se posle 8 sekundi, ako posetilac nije član i ne popunjava formular. Ima zatvaranje, Escape i fokus unutar dijaloga. Najviše jednom u sesiji, sa pauzom od 7 dana nakon zatvaranja. CTA vodi na registraciju sa eksplicitnim izborom članstva, koji se može poništiti, ili na učlanjenje postojećeg korisnika.
- Formular prvo traži obim i kontakt, a dodatne usluge su opcione nakon kontakta. Izbor manjeg obima postoji za čišćenje i krečenje; za čišćenje i izbor ritma dolazaka. Pranje ima procenu prema materijalu, kvadraturi i posebno iskazanom transportu, uz opcione nameštaj/dušeke. Maksimum su dve povezane usluge i jedna nadogradnja. Nema automatskog pokretanja pretplate.
- Ponude se sastavljaju od pojedinačnih stavki u administraciji: osnovna usluga, povezana usluga, dopuna, transport i materijal. Server sabira stavke i bira 5% ili jedan važeći kredit ako je povoljniji; pogodnosti se ne sabiraju. Kredit rezervisan uz ponudu ne može se upotrebiti u drugoj. Za niže ili jednake iznose kredit ostaje za sledeću odgovarajuću uslugu.
- Preporuka ulazi u stanje čekanja tek kada je prvi posao izvršen, neto plaćen najmanje 10.000 RSD i vezan za potvrđeni nalog. Tim proverava identitet, oba članstva i odobrava po 500 RSD kroz `Administracija → Krediti i promene poseta`. Server proverava prethodne uplate po nalogu i normalizovanom telefonu, sprečava sopstvene preporuke, duple nagrade i više od jednog kredita po osobi mesečno. Rok od 90 dana počinje od odobrenja. Povraćaj koji obori uslov povlači nagradu; nezaključane ponude se koriguju, već zaključana cena ostaje dogovorena. Potrošen kredit se ne vraća automatski nakon povraćaja usluge koja ga je koristila; tim procenjuje slučaj.
- Nalog prikazuje raspoložive, rezervisane, iskorišćene, istekle i povučene kredite. Ponavljanje završene usluge pravi nov zahtev sa sačuvanim kontaktom i lokacijom, uz novu potvrdu cene i termina. Pomeranje, pauza, manji obim i otkazivanje evidentiraju se kao zahtev za tim. Nema automatske izmene postojeće rezervacije ili naplate. Tim ažurira originalni zahtev pre označavanja promene kao rešene.
- Poslovni događaji nastaju na serveru pri stvarnom zahtevu, ponudi, početku naplate, uplati, završetku, povraćaju i učlanjenju. Odvojeni su od browser analitike uz saglasnost. Admin prikazuje izvršene/plaćene poslove, potvrđene dopune i kohorte do 180 dana. Istorijski prihod po kontaktu nije prognozirani LTV, a churn pretplata se ne računa bez aktivnih pretplata.

Merenje rezultata zahteva stvaran promet i troškove realizacije. Prvo zabeležiti početno stanje; zatim porediti promene formulara, relevantne kombinacije i poziv u Club. Fotografije izvedenih radova i recenzije dodavati samo iz stvarnih poslova. Automatski email/WhatsApp, recurring naplata i A/B eksperimenti sa stvarnim saobraćajem nisu uključeni; postojeća opt-in lista kontakata ostaje rad koordinatora.

## SEO i redovni planovi — oktobar 2026.

Početna i `/paketi` sada ističu redovno čišćenje i mesečno održavanje. Casa Signature znači dve posete **u mesecu**, a Casa Private jednu posetu **svake nedelje** (broj poseta prati kalendar). Konačna cena ostaje individualna. Oprema, doplate, trajanje, pauze i otkazivanje potvrđuju se u ponudi. Javna adresa `https://www.casapractica.rs/` je domen poslovanja; lokalne izmene postaju javne tek nakon deployment-a.

- Stari javni linkovi za povučene pretplate (`/konsultacije?subscription=ritam` i ostali poznati stari paketi) imaju 308 ka lokalizovanim paketima. `intent=plan-change` i istorija postojećih zahteva ostaju sačuvani.
- `/kontakt`, `/o-nama`, `/saveti` i četiri vodiča dostupni su na svih šest jezika, sa canonical/hreflang oznakama. Kolekcije imaju opisne naslove i BreadcrumbList; vodiči imaju Article i BreadcrumbList. Sitemap trenutno obuhvata 432 javna URL-a.
- `BUSINESS_PHONE`, `BUSINESS_EMAIL`, `BUSINESS_LEGAL_NAME` i `BUSINESS_ADDRESS` prikazuju stvarne podatke iz konfiguracije. `WHATSAPP_NUMBER` uključuje direktan WhatsApp link. Bez tih vrednosti Kontakt jasno označava primer `+381 6X XXX XXXX`, bez aktivnog linka za pozivanje. Poslovni identitet, stvarne fotografije, odobreni utisci i konačni uslovi tek treba da budu dostavljeni; ne objavljujemo izmišljene dokaze rada.
- Po zahtevu vlasnika povezivanje Supabase-a ostavljeno je za kasnije. Ne uklanjati zaštitu neaktivnih formi da bi sajt izgledao povezan. Prijem upita ne zavisi od aktiviranja Stripe-a. Za kasniju aktivaciju podesiti Supabase promenljive, izvršiti migracije redom kroz `010_seo_attribution.sql`, seed i admin nalog prema gornjim uputstvima, pa proveriti jedan označen kontrolni zahtev od forme do administracije. Ne unositi servisne ključeve u repozitorijum.
- Analitika uz pristanak pamti prvu javnu putanju posete i definisane grupe izvora/kanala. Parametri, fragmenti, nazivi kampanja i pune referrer adrese se ne čuvaju. Odbijanje briše sesijske podatke; bez pristanka se izvor ne pridružuje zahtevu. Migracija 010 je opciona za postojeći prijem zahteva: dok nije primenjena, nova polja se izostavljaju. Dashboard prikazuje izvore, redovne upite i upite sa terminom/završenim poslom; to nije broj zaključenih mesečnih ugovora. `plan_frequency` za samostalni izbor usluga računa server.
- Automatski poziv u klub radi samo kada je platforma povezana, posle 30 sekundi, uz postojeće ograničenje učestalosti. Mobilno zaglavlje neposredno prikazuje redovnu pomoć.

Validacija: `npm run typecheck`, `npm test`, `npm run build`; zatim pokrenuti produkcioni server na izdvojenom portu i `TEST_SITE_URL=http://localhost:3100 npx tsx scripts/check-site.mjs`. HTTP provera obuhvata javne i privatne jezičke stranice, sitemap, osnovne SEO oznake, stare linkove sa parametrima i aktuelne upite za redovne planove. Baza u testovima je lokalni PGlite; ne dokazuje prijem na budućem produkcionom Supabase projektu.

Nakon objavljivanja: vlasnik treba da verifikuje domen u Search Console-u (DNS TXT), pošalje `/sitemap.xml` i proveri početnu, pakete i čišćenje kroz URL Inspection. Za Google Business Profile potrebni su stvarni poslovni identitet, kontakt i potvrda modela pružanja usluge; profil nije kreiran ovim izmenama. Postojeća javna ograničenja PageSpeed API-ja nisu razlog da navodimo neizmerene ocene. Proveriti mobilni PageSpeed/CrUX nakon objavljivanja, zatim porediti kvalifikovane organske upite, dogovorene planove i zadržavanje klijenata tokom narednih 90 dana. Plan ne zakazuje automatizacije i ne šalje poruke partnerima ili klijentima.

## DDD usluge i zaštita prostora

`/ddd` povezuje devet usluga: deratizaciju, dezinsekciju, dezinfekciju, tretman protiv stenica, uklanjanje gnezda osa i stršljena, preventivnu DDD zaštitu, uklanjanje mirisa, čišćenje nakon DDD tretmana i sanaciju buđi. Nova kategorija je u katalogu, na početnoj i u footer-u. Tri kolekcije (`zastita-doma`, `zastita-zgrade`, `zastita-poslovnog-prostora`) polaze od procene i izbora potrebnih tretmana, bez unapred nametnutog rasporeda.

Svaka usluga ima naslov za Beograd, poseban opis i pitanje/odgovor, obim, pripremu, kontrolne posete i povezane usluge. Sadržaj je preveden na svih šest jezika; canonical, hreflang, Service/BreadcrumbList i društvene oznake prate postojeći SEO sistem. DDD pregled ima CollectionPage/ItemList i BreadcrumbList. Naslovi prate [Google smernice za opisne, sažete i jedinstvene naslove](https://developers.google.com/search/docs/appearance/title-link). Pitanja su dostupna u HTML-u; ne obećavamo poseban FAQ rezultat u pretrazi. Aktuelni sitemap sadrži 432 javna URL-a.

Formular prikuplja tip i kvadraturu prostora, problem, zahvaćene delove i trajanje, prethodne tretmane, prisustvo dece/ljubimaca i plan zaštite. Nepoznata kvadratura je dozvoljena. Validirani podaci se čuvaju u postojećem `requests.commerce.pest_assessment`, a server sastavlja srpski pregled za administraciju i napomenu zahteva. Fotografije se razmenjuju u nastavku razgovora, preko konfigurisanog WhatsApp kontakta ili dogovora sa timom; aplikacija ne uvodi skladište fotografija. Cena ostaje po proceni, a pripremu i vreme povratka potvrđuje izvođač konkretnog tretmana.

Supabase povezivanje ostaje odloženo prema postojećem dogovoru. Pri aktivaciji baze izvršiti migracije redom kroz `011_ddd_services.sql`, zatim proveriti jedan kontrolni DDD zahtev od formulara do administracije. Migracija 011 dodaje devet ponuda i može se ponoviti; čuva postojeće ID-eve i istoriju zahteva. Bez veze sa bazom sajt prikazuje katalog i formular, uz onemogućeno slanje.

Vizual je generisan ugrađenim `imagegen` alatom i sačuvan u `public/images/services/ddd-zastita.webp` (1536 × 1024, približno 110 KiB). Slika ilustruje pregled prostora i ne predstavlja dokumentovani rad stvarnog tima. Završni prompt:

> Use case: photorealistic-natural. Asset type: landscape 3:2 category photograph for a premium home-services website in Belgrade. Scene: bright tidy apartment, warm beige walls and natural oak floor, soft daylight, calm residential setting. Subject: one professional pest-control technician wearing unbranded charcoal work clothes and disposable gloves, crouching near the kitchen skirting board, inspecting the room with a small flashlight and closed professional toolkit nearby. Show careful inspection only, no spraying. Style: candid editorial lifestyle photo, natural textures, realistic anatomy, refined neutral tones. Composition: medium-wide, human and room both visible, suitable for service cards. Avoid: text, logos, watermark, visible pests, poison, children, dramatic contamination imagery.

Provera: 39 testova, TypeScript i produkcijski build; HTTP provera svih 385 jezičkih stranica i 360 sitemap URL-ova. Mobilni pregled na 390 px obuhvata DDD pregled i obrazac bez horizontalnog prelivanja. Testovi migracije koriste lokalni PGlite, a slanje na produkcionu bazu čeka njeno povezivanje.


## Kineski jezik i premijum pristup

Sajt podržava pojednostavljeni kineski kroz `/zh`, izbor „中文（简体）“, HTML oznaku `zh-Hans` i Open Graph oznaku `zh_CN`. Centralni rečnik ima 1.276 kineskih prevoda, uključujući katalog, DDD usluge, nalog, formulare, korisničke poruke, WhatsApp nacrte, vodiče i SEO sadržaj. Nazivi Casa Signature i Casa Private ostaju nazivi planova. Postojeći urednički tekstovi na pet jezika i kineski prevodi koriste isti lokalizovani izbor, a sitemap i uzajamne jezičke oznake uključuju šesti jezik. Kineske početne stranice za deljenje koriste fotografiju bez srpskog teksta. Cene zadržavaju RSD i postojeće iznose; kinesko „起“ stoji posle iznosa.

Premijum karakter se vidi kroz pažljivo planiranu posetu, jasnu ponudu, poštovanje vremena i uredan završetak. Diskretne poruke dodate su na početnu, katalog, stranice usluga, kolekcije, DDD pregled, kontakt, konsultacije, klub i zajednički footer. Mesečni planovi i opis pristupa nose isti ton na svim jezicima. Nazivi usluga i glavne SEO ključne reči ostaju konkretni; tvrdnje o sertifikatima, garancijama ili izmišljenim izvođačima nisu dodate.

Provera: svih 40 testova, TypeScript i produkcijski build; 462 renderovane stranice i 432 javna sitemap URL-a. Mobilna provera na 390 px obuhvata kinesku početnu i DDD obrazac bez horizontalnog prelivanja. Supabase i naplata ostaju u ranije dogovorenom režimu do povezivanja.
