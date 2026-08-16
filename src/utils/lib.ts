import { clsx, type ClassValue } from "clsx";
import { intlFormatDistance, differenceInDays } from "date-fns";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    currencyDisplay: "symbol",
  }).format(price);
}

export function formatDistance(date: Date | string): string {
  const diffInDays = differenceInDays(new Date(date), new Date());

  if (diffInDays >= 8) {
    return `Publicado el ${new Intl.DateTimeFormat("es-CO").format(new Date(date))}`;
  }

  return intlFormatDistance(date, new Date(), { locale: "es-CO" });
}
