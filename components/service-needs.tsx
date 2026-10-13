import {
  ArrowUpRight,
  House,
  PaintRoller,
  Sparkles,
  Wrench,
} from "lucide-react";
import { getTranslator } from "@/lib/i18n/server";
import Link from "./localized-link";

export async function ServiceNeeds() {
  const t = await getTranslator();
  const needs = [
    {
      title: "Želim čist dom",
      text: "Čišćenje, tepisi i nameštaj",
      href: "/usluge#everyday",
      Icon: Sparkles,
    },
    {
      title: "Treba mi popravka",
      text: "Montaže i sitni poslovi u domu",
      href: "/usluge?potreba=popravke#katalog",
      Icon: Wrench,
    },
    {
      title: "Useljavam se",
      text: "Više usluga u jednoj ponudi",
      href: "/kolekcije/useljenje",
      Icon: House,
    },
    {
      title: "Renoviram",
      text: "Krečenje i dogovor oko obima",
      href: "/usluge/krecenje",
      Icon: PaintRoller,
    },
  ];
  return (
    <nav
      className="service-needs container"
      aria-label={t("Izaberite prema potrebi")}
    >
      {needs.map(({ title, text, href, Icon }) => (
        <Link href={href} key={title}>
          <Icon size={23} strokeWidth={1.4} />
          <span>
            <strong>{t(title)}</strong>
            <small>{t(text)}</small>
          </span>
          <ArrowUpRight size={16} />
        </Link>
      ))}
    </nav>
  );
}
