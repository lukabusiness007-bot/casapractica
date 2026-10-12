-- Indicative prices for standard jobs; fill only previously unpriced services.
-- Existing admin prices, quotes and payments remain intact.
update public.services as service
set price = proposed.price
from (values
('pranje-tepiha',94667),
('ugradnja-tv-a',1100000),
('servis-klime',833333),
('kacenje-slika-i-ogledala',800000),
('montaza-polica',1160000),
('postavljanje-garnisni',1000000),
('sklapanje-namestaja',1300000),
('podesavanje-vrata-i-fioka',600000),
('obnova-silikona',700000),
('vodoinstalaterske-intervencije',970000),
('elektricarske-intervencije',873333),
('odrzavanje-filtera',1000000),
('podesavanje-wifi-mreze',300000),
('pametni-uredjaji',880000),
('nega-garderobe',86667),
('pakovanje-i-raspakivanje',1600000),
('elektroinstalacije',2040000),
('odgusenje-odvoda',1000000),
('bojleri-pumpe-i-cevi',1350000),
('montaza-i-servis-roletni',1120000),
('popravka-vrata-i-prozora',950000),
('zaptivanje-i-komarnici',1000000),
('pametna-zvona-kamere-i-brave',1840000),
('ciscenje-oluka',4000000)
) as proposed(slug,price)
where service.slug = proposed.slug and service.price is null;
