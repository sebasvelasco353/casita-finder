import { QueryClient } from "@tanstack/react-query";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { Timestamp } from "firebase/firestore";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      retry: 1,
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 60 * 24, // 24h, must be >= persister maxAge
    },
  },
});

// JSON.stringify calls Timestamp.prototype.toJSON() before the replacer ever
// sees the value, so by the time we'd check `instanceof Timestamp` it's
// already {seconds, nanoseconds} — detect by shape instead, and rebuild a
// real Timestamp on the way back so PropertyCard's .toDate() etc. don't
// crash on data rehydrated from localStorage.
function isSerializedTimestamp(
  value: unknown,
): value is { seconds: number; nanoseconds: number } {
  return (
    !!value &&
    typeof value === "object" &&
    typeof (value as Record<string, unknown>).seconds === "number" &&
    typeof (value as Record<string, unknown>).nanoseconds === "number"
  );
}

export const persister = createAsyncStoragePersister({
  storage: window.localStorage,
  deserialize: (raw) =>
    JSON.parse(raw, (_key, value) =>
      isSerializedTimestamp(value)
        ? new Timestamp(value.seconds, value.nanoseconds)
        : value,
    ),
});
