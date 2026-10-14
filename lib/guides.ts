import { localized, seoCopy } from "./seo-copy";
import { guideSlugs } from "./guide-routing";
import type { Locale } from "./i18n/routing";
export function guides(locale: Locale) {
  const l = (values: Parameters<typeof localized>[1]) =>
    localized(locale, values);
  const copy = seoCopy(locale);
  const entries = [
    {
      title: l([
        "Koliko košta redovno čišćenje stana u Beogradu?",
        "How much does regular apartment cleaning cost in Belgrade?",
        "Сколько стоит регулярная уборка квартиры в Белграде?",
        "Was kostet regelmäßige Wohnungsreinigung in Belgrad?",
        "Belgrad’da düzenli ev temizliği ne kadar?",
      ]),
      intro: l([
        "Uporedite ukupan obim i mesečnu ponudu, a ne samo cenu jednog sata. Površina, stanje stana, oprema i broj dolazaka utiču na računicu.",
        "Compare the total scope and monthly quote, not just an hourly rate. Area, condition, equipment and visit frequency all affect the calculation.",
        "Сравнивайте полный объем и месячную цену, а не только час работы. Площадь, состояние квартиры, оборудование и частота влияют на расчет.",
        "Gesamtumfang und Monatsangebot vergleichen, nicht nur den Stundensatz. Fläche, Zustand, Ausstattung und Häufigkeit beeinflussen die Rechnung.",
        "Yalnızca saat ücretini değil, toplam kapsamı ve aylık teklifi karşılaştırın. Alan, evin durumu, ekipman ve ziyaret sıklığı maliyeti etkiler.",
      ]),
      sections: [
        [copy.planDetails[1][0], copy.planDetails[1][1]],
        [
          l([
            "Šta navesti za tačnu ponudu",
            "What to include for an accurate quote",
            "Что указать для точного предложения",
            "Angaben für ein passendes Angebot",
            "Doğru teklif için belirtilecekler",
          ]),
          l([
            "Navedite kvadraturu, broj kupatila, prioritete i željeni broj poseta. Recite da li je stan već redovno održavan, ima li ljubimaca i da li želite prozore ili uređaje iznutra. Za istu kvadraturu različiti zadaci mogu tražiti drugačije vreme i opremu.",
            "Provide floor area, bathroom count, priorities and desired visits. Say whether the apartment is already maintained, has pets, and whether windows or appliance interiors are needed. The same area can require different time and equipment depending on tasks.",
            "Укажите площадь, число ванных, приоритеты и желаемые визиты. Сообщите о текущем уходе, питомцах, окнах и приборах изнутри. Одинаковая площадь может требовать разного времени и оборудования.",
            "Fläche, Zahl der Bäder, Prioritäten und Besuchszahl nennen. Bestehende Pflege, Haustiere, Fenster und Geräte innen angeben. Gleiche Fläche kann je nach Aufgaben unterschiedliche Zeit und Ausstattung benötigen.",
            "Alanı, banyo sayısını, öncelikleri ve ziyaret sayısını belirtin. Düzenli bakım, evcil hayvan, camlar ve cihaz içlerini açıklayın. Aynı alan farklı işlere göre farklı süre ve ekipman gerektirebilir.",
          ]),
        ],
        [
          l([
            "Kako porediti dve ponude",
            "How to compare two quotes",
            "Как сравнить два предложения",
            "Zwei Angebote vergleichen",
            "İki teklif nasıl karşılaştırılır",
          ]),
          l([
            "Proverite da li obe ponude imaju isti broj poseta, trajanje, listu prostorija, sredstva i dolazak. Razlikujte dve posete mesečno od dolaska na svakih četrnaest dana, a nedeljni plan proverite i za mesece sa pet termina. Tražite ukupan iznos i zasebno iskazane doplate; Casa konačnu cenu potvrđuje prema vašem stanu.",
            "Check the same number of visits, duration, rooms, supplies and travel. Two monthly visits differ from every fourteen days; weekly plans also need clarity for months with five dates. Ask for the total and itemized extras. Casa confirms the final price for your home.",
            "Сверьте число визитов, время, комнаты, средства и выезд. Два визита в месяц отличаются от каждых четырнадцати дней; уточните недельный план в месяцы с пятью датами. Запросите итог и доплаты. Casa подтверждает цену для вашей квартиры.",
            "Besuchszahl, Dauer, Räume, Mittel und Anfahrt vergleichen. Zwei Besuche monatlich sind nicht alle vierzehn Tage; Wochenpläne auch für Monate mit fünf Terminen klären. Gesamtpreis und Extras verlangen. Casa bestätigt den Preis für Ihre Wohnung.",
            "Ziyaret sayısı, süre, odalar, ürünler ve ulaşımı karşılaştırın. Ayda iki ziyaret, on dört günde bir ile aynı değildir; beş tarihli ayları haftalık planda kontrol edin. Toplamı ve ek ücretleri isteyin. Casa fiyatı evinize göre onaylar.",
          ]),
        ],
      ],
    },
    {
      title: l([
        "Nedeljno ili dvonedeljno čišćenje: kako izabrati?",
        "Weekly or fortnightly cleaning: how to choose?",
        "Еженедельная уборка или раз в две недели: что выбрать?",
        "Wöchentliche oder zweiwöchentliche Reinigung?",
        "Haftalık mı, iki haftada bir temizlik mi?",
      ]),
      intro: l([
        "Učestalost birajte prema korišćenju stana i poslovima koje želite da prepustite timu. Češći dolazak nije zamena za jasno definisan obim.",
        "Choose frequency based on home use and tasks you want to delegate. More frequent visits still need a clearly defined scope.",
        "Выбирайте частоту по использованию квартиры и задачам для команды. Частые визиты не заменяют четкий объем.",
        "Häufigkeit nach Nutzung und gewünschten Aufgaben wählen. Häufigere Besuche brauchen dennoch einen klaren Umfang.",
        "Sıklığı evin kullanımına ve devredilecek işlere göre seçin. Sık ziyaretlerde de kapsam açık olmalıdır.",
      ]),
      sections: [
        [
          copy.planChoices[1].title,
          l([
            "Nedeljni ritam ima smisla kada se kuhinja i kupatilo često koriste ili vam je potrebno kontinuirano održavanje podova i površina. Dogovorite stalni termin, prioritete i šta ostaje vaš deo između dolazaka. Broj poseta u obračunskom periodu navodi se u ponudi.",
            "Weekly care can suit frequently used kitchens and bathrooms or ongoing floor and surface maintenance. Agree a regular date, priorities and your tasks between visits. The quote states the visit count for each billing period.",
            "Недельный график подходит при частом использовании кухни и ванной или постоянном уходе за полами и поверхностями. Согласуйте время, приоритеты и ваши задачи между визитами. Число визитов за период указывается в предложении.",
            "Wöchentliche Pflege eignet sich für häufig genutzte Küchen und Bäder sowie laufende Bodenpflege. Termin, Prioritäten und eigene Aufgaben dazwischen vereinbaren. Die Besuchszahl je Zeitraum steht im Angebot.",
            "Haftalık bakım sık kullanılan mutfak ve banyolar ile sürekli zemin bakımı için uygundur. Sabit tarih, öncelikler ve ziyaretler arasındaki görevler belirlenir. Dönemdeki ziyaret sayısı teklifte yazılır.",
          ]),
        ],
        [
          copy.planChoices[0].title,
          l([
            "Dve posete mesečno odgovaraju domu koji održavate i sami, uz povremenu pomoć za dužu listu zadataka. Prljavština i broj poslova mogu se razlikovati od nedeljnog ritma, pa ne pretpostavljajte isto trajanje posete. Termini se dogovaraju unutar meseca; to nije automatski raspored na svakih četrnaest dana.",
            "Two visits a month can suit homes you also maintain yourself. Dirt and task volume may differ from weekly care, so do not assume the same visit duration. Dates are agreed within the month; this is not automatically a fourteen-day schedule.",
            "Два визита в месяц подходят, если вы также поддерживаете порядок сами. Загрязнение и объем могут отличаться от недельного графика, поэтому длительность уточняется. Даты внутри месяца не означают автоматически каждые четырнадцать дней.",
            "Zwei Besuche monatlich passen, wenn Sie selbst mitpflegen. Verschmutzung und Aufgaben können sich vom Wochenrhythmus unterscheiden; Dauer nicht gleichsetzen. Termine im Monat sind nicht automatisch alle vierzehn Tage.",
            "Ayda iki ziyaret, evini kendisi de temizleyenler için uygundur. Kir ve iş miktarı haftalık bakımdan farklı olabilir; aynı süreyi varsaymayın. Ay içindeki tarihler otomatik olarak on dört günde bir değildir.",
          ]),
        ],
        [copy.planDetails[3][0], copy.planDetails[3][1]],
      ],
    },
    {
      title: l([
        "Šta ulazi u redovno, a šta u generalno čišćenje?",
        "What is included in regular versus deep cleaning?",
        "Чем регулярная уборка отличается от генеральной?",
        "Was unterscheidet Unterhalts- und Grundreinigung?",
        "Düzenli ve detaylı temizlik arasındaki fark nedir?",
      ]),
      intro: l([
        "Naziv usluge nije dovoljan da odredi obim. Lista zadataka pokazuje da li tražite održavanje već urednog stana ili detaljniji rad.",
        "A service name does not define scope. A checklist shows whether you need upkeep of a maintained home or more detailed work.",
        "Название услуги не определяет объем. Список задач покажет, нужен ли уход за чистой квартирой или более тщательная работа.",
        "Der Name definiert nicht den Umfang. Eine Aufgabenliste zeigt, ob laufende Pflege oder gründlichere Arbeit nötig ist.",
        "Hizmet adı kapsamı belirlemez. Liste, bakımlı evin düzenli temizliği mi daha ayrıntılı iş mi gerektiğini gösterir.",
      ]),
      sections: [
        [copy.planDetails[0][0], copy.planDetails[0][1]],
        [
          l([
            "Detaljnije čišćenje traži procenu",
            "Detailed cleaning needs an assessment",
            "Детальная уборка требует оценки",
            "Gründliche Reinigung benötigt eine Einschätzung",
            "Detaylı temizlik değerlendirme gerektirir",
          ]),
          l([
            "Naslage kamenca, masnoća, zapuštene površine i teško dostupni delovi mogu tražiti drugačiju opremu i više vremena. Prozori, unutrašnjost rerne i frižidera nisu automatski uključeni. Kod prašine posle radova posebno opišite stanje; tim potvrđuje da li traženi obim može da izvede.",
            "Limescale, grease, neglected surfaces and difficult areas can need different equipment and more time. Windows and oven or fridge interiors are not automatically included. Describe post-renovation dust separately; the team confirms whether it can deliver that scope.",
            "Известковый налет, жир, запущенные и труднодоступные поверхности могут требовать другого оборудования и времени. Окна, духовка и холодильник изнутри не включены автоматически. Пыль после ремонта опишите отдельно; команда подтвердит возможность работы.",
            "Kalk, Fett, vernachlässigte und schwer zugängliche Flächen benötigen eventuell andere Ausstattung und mehr Zeit. Fenster, Backofen und Kühlschrank innen sind nicht automatisch enthalten. Baustaub separat beschreiben; das Team bestätigt die Ausführbarkeit.",
            "Kireç, yağ, ihmal edilmiş ve zor erişilen yüzeyler farklı ekipman ve daha fazla süre gerektirebilir. Camlar, fırın ve buzdolabı içi otomatik dahil değildir. Tadilat tozunu ayrıca açıklayın; ekip uygun kapsamı onaylar.",
          ]),
        ],
        [
          l([
            "Priprema pre dolaska",
            "Prepare before the visit",
            "Подготовка к визиту",
            "Vorbereitung vor dem Besuch",
            "Ziyarete hazırlık",
          ]),
          l([
            "Dogovorite pristup vodi i struji, slobodne površine i stvari koje ne treba pomerati. Navedite osetljive materijale i posebna sredstva koja već koristite. Prvo usaglasite početno stanje i listu poslova, a zatim odlučite da li vam odgovaraju redovni dolasci.",
            "Agree access to water and electricity, clear surfaces and items that must stay in place. Mention delicate materials and special products already used. Agree the starting condition and checklist before choosing regular visits.",
            "Согласуйте воду и электричество, свободные поверхности и вещи, которые нельзя перемещать. Укажите деликатные материалы и специальные средства. Сначала уточните состояние и задачи, затем выбирайте регулярный график.",
            "Wasser, Strom, freie Flächen und unverrückbare Gegenstände klären. Empfindliche Materialien und besondere Mittel nennen. Erst Zustand und Liste abstimmen, dann regelmäßige Termine wählen.",
            "Su, elektrik, boş yüzeyler ve taşınmaması gereken eşyaları belirleyin. Hassas malzemeleri ve özel ürünleri bildirin. Önce durum ve işleri kararlaştırın, sonra düzenli ziyaret seçin.",
          ]),
        ],
      ],
    },
    {
      title: l([
        "Kako izgleda mesečni plan održavanja doma?",
        "What does a monthly home maintenance plan look like?",
        "Как устроен месячный план ухода за домом?",
        "Wie funktioniert ein monatlicher Hausserviceplan?",
        "Aylık ev bakım planı nasıl işler?",
      ]),
      intro: l([
        "Mesečni plan počinje vašom listom, a ne univerzalnim paketom. Čišćenje ima dogovoren ritam; sezonske radove i popravke potvrđujete posebno.",
        "A monthly plan starts with your checklist, not a universal package. Cleaning follows an agreed rhythm; seasonal tasks and repairs are approved separately.",
        "Месячный план начинается с вашего списка, а не универсального пакета. Уборка идет по графику; сезонные задачи и ремонт подтверждаются отдельно.",
        "Ein Monatsplan beginnt mit Ihrer Liste. Reinigung folgt dem vereinbarten Rhythmus; Saisonarbeiten und Reparaturen werden separat bestätigt.",
        "Aylık plan standart paketten değil sizin listenizden başlar. Temizlik belirlenen düzendedir; mevsimlik işler ve onarım ayrı onaylanır.",
      ]),
      sections: [
        [
          copy.approachTitle,
          l([
            "Navedite šta želite svake posete, šta povremeno, a šta samo kada se pojavi potreba. Razdvojite čišćenje podova i kupatila od servisa klime ili montaže polica. Koordinator predlaže organizaciju dolazaka; kompatibilne zadatke može objediniti, ali raspoloživost stručnog tima potvrđuje zasebno.",
            "List tasks for every visit, occasional tasks and work only when needed. Separate floor and bathroom cleaning from AC service or shelf installation. The coordinator proposes visits and may combine compatible tasks, while specialist availability is confirmed separately.",
            "Разделите задачи каждого визита, периодические и по необходимости. Отделите уборку полов и ванной от кондиционера или полок. Координатор предлагает график и объединение совместимых задач, а доступность специалистов подтверждает отдельно.",
            "Aufgaben je Besuch, gelegentliche und bedarfsabhängige Arbeiten trennen. Boden- und Badreinigung von Klimaservice oder Montage unterscheiden. Der Ansprechpartner plant und bündelt passende Aufgaben; Fachkräfte werden separat bestätigt.",
            "Her ziyarette, ara sıra ve gerektiğinde yapılacak işleri ayırın. Zemin ve banyo temizliğini klima servisi ve raf montajından ayırın. Koordinatör uygun işleri birleştirebilir; uzman ekip uygunluğu ayrıca onaylanır.",
          ]),
        ],
        [copy.planDetails[1][0], copy.planDetails[1][1]],
        [
          l([
            "Provera plana posle prve posete",
            "Review the plan after the first visit",
            "Проверка плана после первого визита",
            "Plan nach dem ersten Besuch prüfen",
            "İlk ziyaretten sonra planı kontrol edin",
          ]),
          l([
            "Proverite da li dogovorena lista i trajanje odgovaraju vašem domu. Novu učestalost, prioritete ili dodatnu uslugu usaglasite pre naredne posete. Zabeležite posebna uputstva za pristup i materijale. Kontinuitet znači manje ponavljanja dogovora, uz novu potvrdu kada se obim ili cena menjaju.",
            "Check whether the checklist and duration suit your home. Agree changed frequency, priorities or extras before the next visit. Record access and material instructions. Continuity reduces repeated explanations while scope or price changes still need a new agreement.",
            "Проверьте список и длительность для вашей квартиры. Новую частоту, приоритеты и допуслуги согласуйте до следующего визита. Зафиксируйте доступ и материалы. Постоянство уменьшает повторные объяснения, но изменения объема и цены требуют согласования.",
            "Prüfen, ob Liste und Dauer passen. Neue Häufigkeit, Prioritäten und Extras vor dem nächsten Besuch vereinbaren. Zugang und Materialien festhalten. Kontinuität spart Erklärungen; Umfangs- und Preisänderungen werden erneut bestätigt.",
            "Liste ve sürenin evinize uygunluğunu kontrol edin. Yeni sıklık, öncelik veya ek hizmeti sonraki ziyaretten önce belirleyin. Erişim ve malzeme talimatlarını kaydedin. Süreklilik açıklamaları azaltır; kapsam ve fiyat değişikliği yeniden onaylanır.",
          ]),
        ],
      ],
    },
  ];
  return entries.map((guide, index) => ({ ...guide, slug: guideSlugs[index] }));
}
