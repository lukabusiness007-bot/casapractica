import Image from "next/image";
import { getTranslator } from "@/lib/i18n/server";
import { growthReady } from "@/lib/data";
import { authClient } from "@/lib/supabase";
export async function TrustStandard() {
  const t = await getTranslator();
  let proof: {
    id: string;
    kind: string;
    title: string;
    description: string;
    image: string | null;
  }[] = [];
  if (await growthReady()) {
    const { data, error } = await (await authClient())
      .from("showcase")
      .select("*")
      .eq("active", true)
      .order("created_at", { ascending: false })
      .limit(6);
    if (error) throw new Error("Prikaz radova trenutno nije dostupan.");
    proof = data || [];
  }
  return (
    <section className="trust-standard container">
      <div className="center-heading">
        <span className="eyebrow">{t("CASA STANDARD")}</span>
        <h2>{t("Poverenje u svakom detalju.")}</h2>
      </div>
      <div className="trust-grid">
        {[
          {
            title: "Pre dolaska",
            text: "Dogovaramo obim, cenu, potrebne delove i način pristupa domu.",
          },
          {
            title: "Tokom posete",
            text: "Pažljivo štitimo prostor i radimo prema dogovorenoj listi zadataka.",
          },
          {
            title: "Posle posete",
            text: "Ostavljamo prostor urednim i proveravamo da li je dogovoreni posao završen.",
          },
        ].map((item) => (
          <article key={item.title}>
            <h3>{t(item.title)}</h3>
            <p>{t(item.text)}</p>
          </article>
        ))}
      </div>
      {proof.length > 0 && (
        <div className="proof-grid">
          {proof.map((item) => (
            <article key={item.id}>
              {item.image && (
                <div className="proof-image">
                  <Image
                    src={item.image}
                    width={800}
                    height={600}
                    unoptimized={!item.image.startsWith("/images/")}
                    sizes="(max-width:760px) 100vw, 33vw"
                    alt={item.title}
                  />
                </div>
              )}
              <span className="eyebrow">
                {item.kind === "team" ? t("Naš tim") : t("Naši radovi")}
              </span>
              <h3>{t(item.title)}</h3>
              <p>{t(item.description)}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
