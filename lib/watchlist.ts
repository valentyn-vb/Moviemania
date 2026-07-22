"use client";

import { useSyncExternalStore } from "react";

// Client-only watchlist store backed by localStorage, exposed through
// useSyncExternalStore so components stay in sync and SSR hydration is clean
// (the server snapshot is always empty; the real value is read after mount).

const KEY = "movieIds";
const EMPTY: number[] = [];
const listeners = new Set<() => void>();

let cachedRaw: string | null = null;
let cachedIds: number[] = EMPTY;

function readSnapshot(): number[] {
  if (typeof window === "undefined") return EMPTY;
  let raw: string | null;
  try {
    raw = window.localStorage.getItem(KEY);
  } catch {
    return EMPTY;
  }
  // Return a stable reference unless the stored value actually changed,
  // otherwise useSyncExternalStore would loop.
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    try {
      cachedIds = raw ? (JSON.parse(raw) as number[]) : EMPTY;
    } catch {
      cachedIds = EMPTY;
    }
  }
  return cachedIds;
}

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  window.addEventListener("storage", callback); // cross-tab updates
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}

function getServerSnapshot(): number[] {
  return EMPTY;
}

/** Reactive list of watchlisted movie ids. */
export function useWatchlist(): number[] {
  return useSyncExternalStore(subscribe, readSnapshot, getServerSnapshot);
}

/** One-shot read (call inside an effect / handler, never during render). */
export function getWatchlistIds(): number[] {
  return readSnapshot();
}

/** Toggles the id and notifies subscribers. */
export function toggleWatchlist(id: number): void {
  const ids = readSnapshot();
  const numId = Number(id);
  const next = ids.includes(numId) ? ids.filter((x) => x !== numId) : [...ids, numId];
  const raw = JSON.stringify(next);
  window.localStorage.setItem(KEY, raw);
  cachedRaw = raw;
  cachedIds = next;
  listeners.forEach((listener) => listener());
}
