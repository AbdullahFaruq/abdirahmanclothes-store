/**
 * Manual payment details shown at checkout. Single source of truth — change a
 * value here and it updates the checkout page and the prefilled WhatsApp
 * message together.
 */
export const STORE_NAME = "Abdirahman Asad Store";

export const BANK_TRANSFER = {
  label: "Bank transfer",
  bank: "Salaam Bank",
  accountNumber: "33751737",
  accountName: "Abdirahman Asad Abdirahman",
} as const;

export const EVC_PLUS = {
  label: "EVC Plus",
  accountName: "Abdirahman Asad Abdirahman",
  /** Human-readable form, shown on the page. */
  displayNumber: "+252 615 06 31 26",
  /** Digits only — the form wa.me and tel: links require. */
  dialNumber: "252615063126",
} as const;

/** WhatsApp number orders are confirmed on. */
export const WHATSAPP_NUMBER = EVC_PLUS.dialNumber;

export type OrderLineSummary = {
  name: string;
  quantity: number;
  lineTotal: string;
};

/**
 * Builds the message that opens prefilled in WhatsApp. It carries the order so
 * the shopper never has to retype it, and covers both intents — confirming a
 * payment already sent, or asking about the order first.
 */
export function buildWhatsAppMessage(
  lines: OrderLineSummary[],
  total: string,
): string {
  const items = lines
    .map((line) => `• ${line.quantity} × ${line.name} — ${line.lineTotal}`)
    .join("\n");

  return [
    `Hello ${STORE_NAME},`,
    "",
    "I would like to order:",
    items,
    "",
    `Total: ${total}`,
    "",
    "I have sent the payment — please confirm my order.",
    "(If you need anything else from me, just let me know.)",
  ].join("\n");
}

export function whatsAppLink(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
