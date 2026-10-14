"use client";
import { createContext, useContext } from "react";
import type { BusinessDetails } from "@/lib/business";
import { useTranslation } from "./locale-provider";

const ContactContext = createContext<BusinessDetails | null>(null);
export function BusinessProvider({
  value,
  children,
}: {
  value: BusinessDetails;
  children: React.ReactNode;
}) {
  return (
    <ContactContext.Provider value={value}>{children}</ContactContext.Provider>
  );
}
export function BusinessContact({
  placeholder = false,
}: {
  placeholder?: boolean;
}) {
  const contact = useContext(ContactContext);
  const t = useTranslation();
  if (!contact) return null;
  const available = contact.phoneHref || contact.email || contact.whatsappHref;
  if (!available && !placeholder) return null;
  return (
    <div className="business-contact">
      {contact.phoneHref && <a href={contact.phoneHref}>{contact.phone}</a>}
      {contact.email && <a href={`mailto:${contact.email}`}>{contact.email}</a>}
      {contact.whatsappHref && (
        <a href={contact.whatsappHref} target="_blank" rel="noreferrer">
          WhatsApp
        </a>
      )}
      {!available && (
        <p className="fine-print">
          {t("Privremeni kontakt — primer broja, nije za pozive:")} <span>+381 6X XXX XXXX</span>
        </p>
      )}
    </div>
  );
}
