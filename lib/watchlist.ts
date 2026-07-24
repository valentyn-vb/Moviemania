"use client";

import { useSyncExternalStore } from "react";
import type { MediaType, WatchlistItem } from "./types";

// Client-only watchlist store backed by localStorage, exposed through
// useSyncExternalStore so components stay in sync and SSR hydration is clean
// (the server snapshot is always empty; the real value is read after mount).
//
// Items are { id, mediaType } so the list holds both movies and TV shows —
// their TMDB ids are not unique across media, so membership is keyed on the pair.

const KEY = "watchlist";
const EMPTY: WatchlistItem[] = [];
const listeners = new Set<() => void>();

let cachedRaw: string | null = null;
let cachedItems: WatchlistItem[] = EMPTY;

function readSnapshot(): WatchlistItem[] {
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
      cachedItems = raw ? (JSON.parse(raw) as WatchlistItem[]) : EMPTY;
    } catch {
      cachedItems = EMPTY;
    }
  }
  return cachedItems;
}

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  window.addEventListener("storage", callback); // cross-tab updates
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}

function getServerSnapshot(): WatchlistItem[] {
  return EMPTY;
}

/** Reactive list of watchlisted items (movies and tv shows). */
export function useWatchlist(): WatchlistItem[] {
  return useSyncExternalStore(subscribe, readSnapshot, getServerSnapshot);
}

/** One-shot read (call inside an effect / handler, never during render). */
export function getWatchlistItems(): WatchlistItem[] {
  return readSnapshot();
}

/** Whether a given title is in a watchlist snapshot. */
export function isInWatchlist(
  items: WatchlistItem[],
  id: number,
  mediaType: MediaType
): boolean {
  return items.some((item) => item.id === id && item.mediaType === mediaType);
}

/** Toggles the (id, mediaType) pair and notifies subscribers. */
export function toggleWatchlist(id: number, mediaType: MediaType): void {
  const items = readSnapshot();
  const next = isInWatchlist(items, id, mediaType)
    ? items.filter((item) => !(item.id === id && item.mediaType === mediaType))
    : [...items, { id, mediaType }];
  const raw = JSON.stringify(next);
  window.localStorage.setItem(KEY, raw);
  cachedRaw = raw;
  cachedItems = next;
  listeners.forEach((listener) => listener());
}
