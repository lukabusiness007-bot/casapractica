-- Adopt the owner's doubled washing price list for the catalog starting price.
-- Preserve custom admin prices, quotes, payments and all other service prices.
update public.services
set price = 98000
where slug = 'pranje-tepiha'
  and (price is null or price in (94667, 90000));
