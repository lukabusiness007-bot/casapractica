-- Round the original indicative catalog prices. Preserve administrator edits.
-- Quotes, payments and subscription prices are not affected.
update public.services as service
set price = proposed.price
from (values
('pranje-tepiha',94667,90000),
('servis-klime',833333,850000),
('montaza-polica',1160000,1150000),
('vodoinstalaterske-intervencije',970000,950000),
('elektricarske-intervencije',873333,850000),
('pametni-uredjaji',880000,900000),
('nega-garderobe',86667,90000),
('elektroinstalacije',2040000,2050000),
('montaza-i-servis-roletni',1120000,1100000),
('pametna-zvona-kamere-i-brave',1840000,1850000)
) as proposed(slug,previous_price,price)
where service.slug = proposed.slug and service.price = proposed.previous_price;
