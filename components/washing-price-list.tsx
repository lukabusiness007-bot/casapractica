import { money } from "@/lib/catalog";
import { washingPriceList } from "@/lib/washing-pricing";
import { getLocale, getTranslator } from "@/lib/i18n/server";

export async function WashingPriceList() {
  const locale = await getLocale();
  const t = await getTranslator();
  return (
    <section className="washing-prices" id="cenovnik" aria-labelledby="washing-price-heading">
      <div className="washing-price-heading">
        <span className="eyebrow">{t("Cenovnik")}</span>
        <h2 id="washing-price-heading">{t("Pranje i nega, po vašoj meri.")}</h2>
        <p>{t("Izaberite vrstu pranja i dodatne usluge. Transport je iskazan posebno.")}</p>
      </div>
      <div className="washing-price-grid">
        {washingPriceList.map((group) => (
          <div className="washing-price-group" key={group.title}>
            <table>
              <caption>{t(group.title)}</caption>
              <thead className="sr-only"><tr><th scope="col">{t("Usluga")}</th><th scope="col">{t("Cena")}</th></tr></thead>
              <tbody>
                {group.items.map((item) => (
                  <tr key={item.name}>
                    <th scope="row">{t(item.name)}{item.detail && <small>{t(item.detail)}</small>}</th>
                    <td>{item.price === null ? <span>{t("Procena na licu mesta")}</span> : <>
                      <strong>{item.maxPrice ? `${money(item.price, locale)} – ${money(item.maxPrice, locale)}` : money(item.price, locale)}</strong>
                      {item.unit && <small>{t(item.unit)}</small>}
                    </>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </section>
  );
}
