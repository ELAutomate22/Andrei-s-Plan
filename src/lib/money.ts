import type { Currency } from "./types";

export const currencies: Currency[] = ["GBP", "EUR"];

export function currencyOf(value?: Currency, fallback: Currency = "GBP"): Currency {
  return value === "EUR" || value === "GBP" ? value : fallback;
}

export function currencySymbol(currency: Currency): "£" | "€" {
  return currency === "EUR" ? "€" : "£";
}

export function formatMoney(amount: number, currency: Currency): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
