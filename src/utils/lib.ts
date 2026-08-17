import { clsx, type ClassValue } from "clsx";
import { intlFormatDistance, differenceInDays } from "date-fns";
import { twMerge } from "tailwind-merge";
import type { Timestamp } from "firebase/firestore";
import type { Property } from "../types";

// React Query's persisted cache round-trips Timestamps through JSON, which
// can leave them as plain {seconds, nanoseconds} instead of real Timestamp
// instances — accept either shape so callers never crash on .toDate().
export function toDate(timestamp: Timestamp): Date {
  if (typeof timestamp.toDate === "function") return timestamp.toDate();
  const { seconds, nanoseconds } = timestamp as unknown as {
    seconds: number;
    nanoseconds: number;
  };
  return new Date(seconds * 1000 + nanoseconds / 1e6);
}

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

export function formatParking(parking: Property["parking"]): string | null {
  if (!parking || parking.type === "sin_parqueadero") return null;
  const typeLabel = parking.type === "publico" ? "público" : "privado";
  if (!parking.spots) return `Parqueadero ${typeLabel}`;
  return `${parking.spots} parqueadero${parking.spots > 1 ? "s" : ""} (${typeLabel})`;
}

export function formatDistance(date: Date | string): string {
  const diffInDays = differenceInDays(new Date(date), new Date());

  if (diffInDays >= 8) {
    return `Publicado el ${new Intl.DateTimeFormat("es-CO").format(new Date(date))}`;
  }

  return intlFormatDistance(date, new Date(), { locale: "es-CO" });
}
