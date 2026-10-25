const APP_TIME_ZONE = "Asia/Dhaka";

const moneyWhole = new Intl.NumberFormat("en-BD", {
  style: "currency",
  currency: "BDT",
  maximumFractionDigits: 0,
});
const moneyFraction = new Intl.NumberFormat("en-BD", {
  style: "currency",
  currency: "BDT",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Format a Taka amount (a number from the API). 5000 -> "৳5,000", 2666.67 -> "৳2,666.67". */
export function formatMoney(amount: number): string {
  return Number.isInteger(amount) ? moneyWhole.format(amount) : moneyFraction.format(amount);
}

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: APP_TIME_ZONE,
});

export function formatDate(value: string | Date): string {
  return dateFormat.format(typeof value === "string" ? new Date(value) : value);
}

export function formatDateRange(start: string | Date, end: string | Date): string {
  return `${formatDate(start)} – ${formatDate(end)}`;
}
