export function businessDetails(
  env: Record<string, string | undefined> = process.env,
) {
  const phone = env.BUSINESS_PHONE?.trim() || "";
  const digits = phone.replace(/[\s()+-]/g, "");
  const email = env.BUSINESS_EMAIL?.trim() || "";
  const whatsapp = (env.WHATSAPP_NUMBER || "").replace(/[\s()+-]/g, "");
  return {
    legalName: env.BUSINESS_LEGAL_NAME?.trim() || "",
    address: env.BUSINESS_ADDRESS?.trim() || "",
    phone: /^\d{8,15}$/.test(digits) ? phone : "",
    phoneHref: /^\d{8,15}$/.test(digits) ? `tel:+${digits}` : null,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : "",
    whatsappHref: /^\d{8,15}$/.test(whatsapp)
      ? `https://wa.me/${whatsapp}`
      : null,
  };
}
export type BusinessDetails = ReturnType<typeof businessDetails>;
