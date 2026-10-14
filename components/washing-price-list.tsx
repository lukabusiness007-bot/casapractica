import { ClubPrice } from "./club-price";
import Link from "./localized-link";
import { washingPriceList } from "@/lib/washing-pricing";
import { getLocale, getTranslator } from "@/lib/i18n/server";

export async function WashingPriceList({ upholsteryOnly = false }: { upholsteryOnly?: boolean } = {}) {
  const locale = await getLocale();
  const t = await getTranslator();
  return (
    <section className="washing-prices" id="cenovnik" aria-labelledby="washing-price-heading">
      <div className="washing-price-heading">
        <span className="eyebrow">{t("Cenovnik")}</span>
        <h2 id="washing-price-heading">{t(upholsteryOnly ? "Pranje sofa, fotelja i dušeka" : "Pranje i nega, po vašoj meri.")}</h2>
        <p>{t(upholsteryOnly ? "Cena zavisi od broja sedećih mesta ili tipa dušeka. Materijal, obim i konačan iznos potvrđujemo pre dolaska." : "Izaberite vrstu pranja i dodatne usluge. Transport je iskazan posebno.")}</p>
        <Link className="text-link" href="/klub#pristupi">{t("Besplatno članstvo donosi 5% popusta na ceo cenovnik")}</Link>
      </div>
      <div className="washing-price-grid">
        {(upholsteryOnly ? washingPriceList.filter(group => group.title === "Pranje nameštaja") : washingPriceList).map((group) => (
          <div className="washing-price-group" key={group.title}>
            <table>
              <caption>{t(group.title)}</caption>
              <thead className="sr-only"><tr><th scope="col">{t("Usluga")}</th><th scope="col">{t("Cena")}</th></tr></thead>
              <tbody>
                {group.items.map((item) => (
                  <tr key={item.name}>
                    <th scope="row">{t(item.name)}{item.detail && <small>{t(item.detail)}</small>}</th>
                    <td>{item.price === null ? <span>{t("Procena na licu mesta")}<small>{t("Članovi kluba: 5% popusta na dogovorenu cenu")}</small></span> : <ClubPrice price={item.price} maxPrice={item.maxPrice} unit={item.unit} locale={locale} t={t} />}</td>
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
