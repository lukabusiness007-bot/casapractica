-- Adopt the owner's doubled washing price list for the catalog starting price.
-- Replace this service's starting price; quotes, payments and other services stay intact.
update public.services
set price = 98000
where slug = 'pranje-tepiha';
