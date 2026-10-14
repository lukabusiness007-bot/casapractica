"use client";
import { createContext, useContext } from "react";
import type { BusinessDetails } from "@/lib/business";
import { useLocale } from "./locale-provider";
import { seoCopy } from "@/lib/seo-copy";

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
  const copy = seoCopy(useLocale());
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
          {copy.contactPlaceholder} <span>+381 6X XXX XXXX</span>
        </p>
      )}
    </div>
  );
}
