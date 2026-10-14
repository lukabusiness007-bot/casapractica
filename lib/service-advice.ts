import type { Locale } from "./i18n/routing";
import { localized, seoCopy } from "./seo-copy";
export function serviceAdvice(slug: string, locale: Locale) {
  const l = (values: Parameters<typeof localized>[1]) =>
    localized(locale, values);
  const copy = seoCopy(locale);
  const advice: Record<string, string[]> = {
    "ciscenje-doma": [
      l([
        "Navedite kvadraturu, broj kupatila, stanje stana i prioritete. Redovno održavanje dostupnih površina razlikuje se od uklanjanja naslaga i zaprljanja. Prozore, rernu i frižider iznutra dogovaramo kao posebno navedene zadatke; cenu potvrđujemo prema tom obimu.",
        "Provide area, bathroom count, apartment condition and priorities. Regular care of accessible surfaces differs from removing deposits and heavy dirt. Windows, oven and fridge interiors are separately listed tasks; pricing follows the agreed scope.",
        "Укажите площадь, число ванных, состояние и приоритеты. Регулярный уход отличается от удаления налета и сильных загрязнений. Окна, духовку и холодильник изнутри согласуем отдельно; цена зависит от объема.",
        "Fläche, Bäder, Zustand und Prioritäten nennen. Laufende Pflege unterscheidet sich von der Entfernung starker Ablagerungen. Fenster, Ofen und Kühlschrank innen werden gesondert vereinbart; der Preis folgt dem Umfang.",
        "Alan, banyo sayısı, durum ve öncelikleri belirtin. Düzenli bakım yoğun kir temizliğinden farklıdır. Camlar, fırın ve buzdolabı içi ayrı belirlenir; fiyat kapsama göre onaylanır.",
      ]),
      l([
        "Dogovorite ko obezbeđuje usisivač i sredstva, pristup vodi i struji i delove stana koje ne treba dirati. Trajanje zavisi od površine i liste poslova. Za dve posete mesečno ili nedeljni ritam prvo potvrđujemo početno stanje, zatim pripremamo mesečnu ponudu.",
        "Agree who provides the vacuum and supplies, water and electricity access, and areas to leave untouched. Duration depends on area and the checklist. For two monthly visits or weekly care, we first confirm the starting condition and then prepare the monthly quote.",
        "Согласуйте пылесос, средства, воду, электричество и зоны, которые нельзя трогать. Длительность зависит от площади и задач. Для двух визитов в месяц или недельного графика сначала уточним состояние, затем месячную цену.",
        "Staubsauger, Mittel, Wasser, Strom und ausgeschlossene Bereiche klären. Die Dauer hängt von Fläche und Liste ab. Für zwei monatliche oder wöchentliche Besuche prüfen wir zuerst den Zustand und erstellen das Angebot.",
        "Süpürge, ürünler, su, elektrik ve dokunulmaması gereken alanları belirleyin. Süre alana ve listeye bağlıdır. Ayda iki veya haftalık ziyaret için önce başlangıç durumu, sonra aylık teklif belirlenir.",
      ]),
    ],
    "servis-klime": [
      l([
        "Redovan servis i pregled kvara nisu isti posao. Navedite model, kapacitet, poslednji servis i simptome. Početna cena odnosi se na standardni obim iznad; dubinsko pranje, popravke, delovi i dopuna rashladnog sredstva zahtevaju zasebnu procenu i ponudu.",
        "Regular service and fault diagnosis are different jobs. Provide model, capacity, last service and symptoms. The starting price covers the standard scope above; deep washing, repairs, parts and refrigerant top-ups need separate assessment and quotation.",
        "Регулярный сервис и диагностика — разные задачи. Укажите модель, мощность, последний сервис и симптомы. Начальная цена относится к указанному объему; глубокая мойка, ремонт, детали и хладагент оцениваются отдельно.",
        "Wartung und Fehlerdiagnose sind unterschiedliche Arbeiten. Modell, Leistung, letzten Service und Symptome angeben. Der Startpreis gilt für den genannten Umfang; Tiefenreinigung, Reparatur, Teile und Kältemittel separat anbieten lassen.",
        "Düzenli servis ve arıza teşhisi farklı işlerdir. Model, kapasite, son servis ve belirtileri yazın. Başlangıç fiyatı belirtilen kapsam içindir; detaylı yıkama, onarım, parça ve gaz ayrı değerlendirilir.",
      ]),
      l([
        "Opišite pristup unutrašnjoj i spoljnoj jedinici, visinu i mogućnost parkiranja. Trajanje i potrebnu opremu potvrđuje tim. Servis klime je sezonski dodatak mesečnom planu, sa zasebnim obračunom; ne podrazumeva servis svakog meseca.",
        "Describe access to indoor and outdoor units, height and parking. The team confirms duration and equipment. AC service is a seasonal addition to a monthly plan with separate pricing, not a monthly AC service commitment.",
        "Опишите доступ к блокам, высоту и парковку. Время и оборудование подтвердит команда. Сервис кондиционера — сезонное дополнение к месячному плану с отдельной ценой, а не обязательный ежемесячный сервис.",
        "Zugang zu beiden Einheiten, Höhe und Parken beschreiben. Dauer und Ausstattung bestätigt das Team. Klimaservice ist ein separat berechneter Saisonbaustein, keine monatliche Wartungszusage.",
        "İç ve dış üniteye erişimi, yüksekliği ve park imkanını açıklayın. Süre ve ekipmanı ekip belirler. Klima servisi aylık planın ayrıca ücretlendirilen mevsimlik ekidir; her ay servis anlamına gelmez.",
      ]),
    ],
    "ugradnja-tv-a": [
      l([
        "Pošaljite dimenzije i težinu TV-a, vrstu zida i podatke o nosaču. Proveravamo kompatibilnost i dogovaramo položaj. Nosač, dodatna pričvršćenja, složen zid i skrivanje kablova u zidu posebno navodimo u ponudi, umesto da ih pretpostavimo u početnoj ceni.",
        "Provide TV size and weight, wall type and bracket details. We check compatibility and agree positioning. Brackets, extra fixings, difficult walls and in-wall cable concealment are quoted separately rather than assumed in the starting price.",
        "Укажите размер и вес ТВ, тип стены и кронштейн. Проверим совместимость и расположение. Кронштейн, крепления, сложная стена и скрытая проводка указываются отдельно в предложении.",
        "TV-Größe, Gewicht, Wandart und Halterung angeben. Kompatibilität und Position werden geprüft. Halterung, zusätzliche Befestigung, schwierige Wände und versteckte Kabel separat ausweisen.",
        "TV boyutu, ağırlığı, duvar türü ve askı bilgisini verin. Uyumluluk ve konum kontrol edilir. Askı, ek bağlantılar, zor duvar ve duvar içi kablo ayrı teklif edilir.",
      ]),
      l([
        "Oslobodite pristup zidu i navedite postojeće utičnice i uređaje koje povezujemo. Trajanje zavisi od podloge i povezivanja. Montažu možete dogovoriti uz druge kompatibilne poslove; konačan iznos treba da pokaže rad, dolazak i materijal.",
        "Clear wall access and indicate sockets and devices to connect. Duration depends on the wall and connections. Installation can be coordinated with compatible tasks; the final quote should show labor, travel and materials.",
        "Освободите стену, укажите розетки и устройства. Время зависит от стены и подключения. Монтаж можно совместить с подходящими задачами; итог должен показывать работу, выезд и материалы.",
        "Wandzugang freimachen und Steckdosen sowie Geräte nennen. Dauer hängt von Wand und Anschlüssen ab. Passende Arbeiten können gebündelt werden; Arbeit, Anfahrt und Material im Angebot ausweisen.",
        "Duvar erişimini açın, prizleri ve bağlanacak cihazları belirtin. Süre duvara ve bağlantılara bağlıdır. Uygun işler birlikte planlanabilir; teklif işçilik, ulaşım ve malzemeyi göstermelidir.",
      ]),
    ],
    "sklapanje-namestaja": [
      l([
        "Navedite proizvođača, model, broj elemenata i da li su uputstvo i svi delovi dostupni. Početna cena važi za standardni obim naveden iznad. Ormari, kreveti, kuhinje, nedostajući delovi i pričvršćivanje za zid zahtevaju posebnu potvrdu obima.",
        "Provide maker, model, item count and availability of instructions and parts. The starting price covers the standard scope above. Wardrobes, beds, kitchens, missing parts and wall anchoring need separate scope confirmation.",
        "Укажите производителя, модель, число элементов, инструкцию и комплектность. Начальная цена — за указанный объем. Шкафы, кровати, кухни, недостающие части и крепление к стене согласуются отдельно.",
        "Hersteller, Modell, Anzahl, Anleitung und Teile nennen. Der Startpreis gilt für den Standardumfang. Schränke, Betten, Küchen, fehlende Teile und Wandverankerung benötigen gesonderte Bestätigung.",
        "Üretici, model, parça sayısı, kılavuz ve eksiksizliği belirtin. Başlangıç fiyatı standart kapsam içindir. Dolap, yatak, mutfak, eksik parçalar ve duvara sabitleme ayrıca onaylanır.",
      ]),
      l([
        "Pripremite dovoljno mesta za raspakivanje i sklapanje. Unapred dogovorite iznošenje ambalaže i pristup liftu. Vreme rada zavisi od konstrukcije i broja komada; više komada i montaže možemo organizovati kroz jednu preglednu ponudu.",
        "Prepare space for unpacking and assembly. Agree packaging removal and lift access in advance. Work time depends on construction and item count; several items and installations can be coordinated in one itemized quote.",
        "Подготовьте место для распаковки и сборки. Заранее согласуйте упаковку и лифт. Время зависит от конструкции и количества; несколько предметов и монтаж можно объединить в одном предложении.",
        "Platz zum Auspacken und Aufbau schaffen. Verpackungsentsorgung und Aufzug vorab klären. Dauer hängt von Konstruktion und Anzahl ab; mehrere Stücke lassen sich gemeinsam anbieten.",
        "Açma ve kurulum için yer hazırlayın. Ambalaj çıkarma ve asansörü önceden belirleyin. Süre yapıya ve sayıya bağlıdır; birden fazla ürün tek teklifte planlanabilir.",
      ]),
    ],
    krecenje: [
      l([
        "Za procenu navedite površinu zidova i plafona, stanje podloge, nijansu i broj slojeva. Kvadratura poda nije isto što i površina za krečenje. Priprema, gletovanje, sanacija oštećenja i vrsta boje utiču na obim i cenu; stavke potvrđujemo posebno.",
        "Provide wall and ceiling area, surface condition, color and coats. Floor area is not painting area. Preparation, plastering, repairs and paint type affect scope and price; items are agreed separately.",
        "Укажите площадь стен и потолка, состояние, цвет и слои. Площадь пола не равна площади покраски. Подготовка, шпаклевка, ремонт и краска влияют на цену; позиции согласуются отдельно.",
        "Wand- und Deckenfläche, Zustand, Farbton und Anstriche nennen. Bodenfläche ist nicht Malerfläche. Vorbereitung, Spachteln, Schäden und Farbe beeinflussen Umfang und Preis.",
        "Duvar ve tavan alanı, yüzey durumu, renk ve kat sayısını belirtin. Zemin alanı boyanacak alan değildir. Hazırlık, macun, onarım ve boya kapsam ve fiyatı etkiler.",
      ]),
      l([
        "Dogovaramo pomeranje ili zaštitu nameštaja, materijal, radno vreme zgrade i sređivanje po završetku. Rok zavisi od pripreme i sušenja slojeva. Krečenje je zaseban posao u okviru brige o domu; nije automatski uključeno u mesečno čišćenje.",
        "Agree furniture movement or protection, materials, building work hours and cleanup. Timing depends on preparation and drying. Painting is a separately quoted home-care task, not automatically included in monthly cleaning.",
        "Согласуем мебель, защиту, материалы, часы работ и уборку. Срок зависит от подготовки и высыхания. Покраска — отдельная задача, не включенная автоматически в месячную уборку.",
        "Möbel, Schutz, Material, Hausarbeitszeiten und Aufräumen vereinbaren. Dauer hängt von Vorbereitung und Trocknung ab. Malerarbeiten sind nicht automatisch in der Monatsreinigung enthalten.",
        "Mobilya taşıma veya koruma, malzeme, bina çalışma saatleri ve toparlama belirlenir. Süre hazırlık ve kurumaya bağlıdır. Boya aylık temizliğe otomatik dahil değildir.",
      ]),
    ],
  };
  const text = advice[slug];
  if (!text) return null;
  return {
    title: copy.planDetails[1][0],
    preparationTitle: copy.accessTitle,
    text,
    copy,
  };
}
export function collectionHeading(id: string, locale: Locale) {
  const titles: Record<string, Parameters<typeof localized>[1]> = {
    "filmsko-vece": [
      "Montaža TV-a i priprema kućnog bioskopa",
      "TV mounting and home cinema setup",
      "Монтаж ТВ и настройка домашнего кинотеатра",
      "TV-Montage und Heimkinoeinrichtung",
      "TV montajı ve ev sineması hazırlığı",
    ],
    "povratak-kuci": [
      "Čišćenje doma pred povratak",
      "Home cleaning before your return",
      "Уборка дома к вашему возвращению",
      "Hausreinigung vor Ihrer Rückkehr",
      "Dönüşünüz öncesi ev temizliği",
    ],
    "gosti-stizu": [
      "Čišćenje stana pre dolaska gostiju",
      "Apartment cleaning before guests arrive",
      "Уборка квартиры перед приездом гостей",
      "Wohnungsreinigung vor dem Gästeempfang",
      "Misafirler gelmeden ev temizliği",
    ],
    "nova-sezona": [
      "Sezonsko čišćenje i održavanje doma",
      "Seasonal cleaning and home maintenance",
      "Сезонная уборка и обслуживание дома",
      "Saisonale Reinigung und Hauswartung",
      "Mevsimlik temizlik ve ev bakımı",
    ],
    useljenje: [
      "Priprema stana za useljenje",
      "Preparing an apartment for moving in",
      "Подготовка квартиры к заселению",
      "Wohnung für den Einzug vorbereiten",
      "Taşınma öncesi ev hazırlığı",
    ],
  };
  return titles[id] ? localized(locale, titles[id]) : null;
}
