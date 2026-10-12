# casa practica

Premium platforma za usluge u domu u Beogradu. Next.js 16, React, TypeScript, Tailwind CSS, Supabase Auth/PostgreSQL i Stripe Checkout.

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

1. Kreirajte Supabase projekat. U SQL editoru izvršite `supabase/migrations/001_initial.sql`, a zatim `supabase/seed.sql`. Za novu bazu izvršite i `supabase/migrations/002_premium_catalog.sql` i `supabase/migrations/003_growth.sql`, pa seed. Na postojećoj bazi izvršite samo novu migraciju `002_premium_catalog.sql`: dodaje katalog i uslugu Moja Casa bez brisanja zahteva, cena, vidljivosti ili sadržaja koji je administrator menjao.
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

## Fotografije

Lokalno sačuvane fotografije enterijera sa Unsplash-a, korišćene kao ilustracija doma (ne kao fotografije izvođača ili potvrda obavljenih radova):

- hero: `photo-1600210492486-724fe5c67fb0`
- tepih: `photo-1600166898405-da9535204843`
- kuhinja: `photo-1556912172-45b7abe8b7e1`
- dnevna soba: `photo-1600607687920-4e2a09cf159d`
- lampa: `photo-1507473885765-e6ed057f782c`
- enterijer / klima: `photo-1616486338812-3dadae4b4ace`
- klub: `photo-1616486029423-aaa4789e8c9a`

Dizajn prati referencu https://getcasa.com/: video hero, serifni naslovi, krem kartice i maslinast footer. Fontovi Diatype i Litteratur su u `public/fonts/`, a Inter kroz `next/font` služi kao rezerva za jezičke skupove. Ikonice kuće, alata i sata iz reference su u `public/images/casa/`. Video u `components/hero-video.tsx` učitava se sa originalnog Casa CDN-a; lokalni `public/images/hero.jpg` služi kao poster i zamena kada je uključeno smanjeno kretanje. Video ima dugme za pauzu. Izbor usluge u `components/service-explorer.tsx` podržava miš, dodir i tastaturu.

## Jezici, identitet i SEO

- Zaglavlje koristi znak kuće i naziv casa practica, usklađen sa Casa referencom. Ikonica i Open Graph slika prate isti identitet. Raniji vektorski grb ostaje sačuvan u `public/brand/crest.svg`.
- Srpski zadržava postojeće adrese. Engleski, ruski, nemački i turski koriste `/en`, `/ru`, `/de`, `/tr`. Izbor jezika zadržava stranicu, query i anchor. Jezici se renderuju na serveru, bez zavisnosti od JavaScript prevoda.
- `lib/i18n/messages.json` sadrži prevode sadržaja, kataloga, obrazaca, naloga i poznatih API poruka. Novi ili izmenjeni tekstovi iz administracije treba da dobiju prevode u ovom rečniku; nepoznat sadržaj ostaje na izvornom jeziku. Lične beleške, nazivi korisnica i konkretne ponude tima se ne prevode automatski. Administracija ostaje na srpskom.
- Svaka javna stranica ima zaseban naslov/opis, svoj canonical i uzajamne `hreflang` oznake sa `x-default`. Sitemap obuhvata početnu, katalog, klub i aktivne usluge na svih pet jezika. Ne navodimo izmišljene recenzije, cene, adresu ili radno vreme.
- `Organization`, `WebSite`, `WebPage`, `Service` i `BreadcrumbList` JSON-LD opisuju stvarni sadržaj. Open Graph slika koristi novi identitet. Fotografije koriste responsive `next/image`, a fontovi uključuju ćirilicu.
- Nalozi, prijava, registracija, administracija i radne verzije pravnih tekstova imaju `noindex`. Lokalno i Vercel Preview okruženje imaju `noindex` i blokadu u `robots.txt`. Vercel Production automatski koristi domen projekta; za prilagođeni konačni HTTPS domen opciono podesite `NEXT_PUBLIC_SITE_URL` i ponovo izgradite aplikaciju; canonical, sitemap i pravila indeksiranja tada koriste taj domen. Za preview deployment zadržite neprodukcioni URL. Ne unosite izmišljeni domen.
- U Supabase allowlist dodajte produkcioni `/auth/callback` sa parametrima za podržane jezike i oporavak lozinke. Posle registracije, oporavka lozinke i novog Stripe Checkout-a povratak zadržava izabrani jezik. Ranije otvorene Stripe sesije zadržavaju prethodno definisani povratni URL.
- Kada domen bude izabran i sajt objavljen, verifikujte Google Search Console i podnesite `/sitemap.xml`. To nije urađeno lokalnim izmenama. Uslovi/privatnost ostaju jasno označeni radni tekstovi.

Dodatna provera renderovanog HTML-a (pokrenite lokalni server pre provere):

```sh
TEST_SITE_URL=http://localhost:3000 node scripts/check-site.mjs
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
