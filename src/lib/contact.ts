/**
 * Contact links derived from the admin-editable site phone, mirroring the
 * Footer's normalisation so every "contact us" CTA points at the same number.
 * Lebanese local numbers (≤ 8 digits) get the +961 country code.
 */
export const DEFAULT_CONTACT_PHONE = "+961 81 348 184";

export function toInternationalDigits(phone: string): string {
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("0")) digits = digits.slice(1);
  if (digits.length > 0 && digits.length <= 8) digits = `961${digits}`;
  return digits;
}

export function getContactLinks(contactPhone?: string | null) {
  const phone = contactPhone?.trim() || DEFAULT_CONTACT_PHONE;
  const digits = toInternationalDigits(phone);
  return {
    phone,
    whatsappHref: `https://wa.me/${digits}`,
    telHref: `tel:+${digits}`,
  };
}
