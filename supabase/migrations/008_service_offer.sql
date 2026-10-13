-- Retire services without deleting request, quote or payment history.
begin;

update public.services set active = false
where slug in ('nega-garderobe', 'sveza-posteljina', 'organizacija-doma', 'licna-nabavka', 'dom-na-cuvanju', 'pakovanje-i-raspakivanje', 'dom-spreman-za-goste', 'mlin-za-otpatke', 'elektroinstalacije', 'punjaci-za-elektricna-vozila', 'ugradnja-zvucnih-sistema', 'mrezna-dijagnostika-i-bezbednost', 'vertikalne-baste', 'popravka-i-podesavanje-oluka', 'usmeravanje-i-sakupljanje-kisnice', 'zamena-i-zastita-oluka');

update public.services
set name = 'Iznošenje smeća, šuta i nameštaja',
    tagline = 'Oslobodite prostor. Mi nosimo teret.',
    description = 'Iznosimo smeće, šut u vrećama i stari nameštaj iz stana ili kuće. Navedite količinu, dimenzije većih predmeta, sprat i dostupnost lifta. Iznošenje, odvoz i odgovarajuće zbrinjavanje dogovaramo pre dolaska.',
    image = '/images/services/iznosenje-smeca-v2.webp'
where slug = 'iznosenje-smeca';

insert into public.services (id,slug,name,tagline,description,image,price,active,sort_order) values
('ca5a0000-0000-4000-8000-000000000301','ciscenje-doma','Čišćenje doma','Čist prostor. Lakša svakodnevica.','Čistimo podove, dostupne površine, kuhinju i kupatilo u vašem stanu ili kući. Redovno ili detaljno čišćenje, pranje prozora i obim posla dogovaramo prema površini i stanju prostora, pre dolaska.','/images/services/ciscenje-doma.webp',null,true,19),
('ca5a0000-0000-4000-8000-000000000302','krecenje','Krečenje','Sveži zidovi. Novi osećaj doma.','Pripremamo zidove i plafone, štitimo podove i nameštaj i krečimo dogovorene površine. Kvadraturu, stanje zidova, nijansu, broj slojeva i materijal potvrđujemo pre rada, uz sređivanje prostora nakon završetka.','/images/services/krecenje.webp',null,true,20)
on conflict do nothing;

commit;
