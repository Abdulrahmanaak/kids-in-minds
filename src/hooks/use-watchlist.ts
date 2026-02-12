"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "atfaluna-watchlist";

type WatchlistItem = {
  youtubeVideoId: string;
  title: string;
  thumbnailUrl: string | null;
  channelName: string | null;
  addedAt: string;
};

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setWatchlist(JSON.parse(stored));
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(watchlist));
    }
  }, [watchlist, loaded]);

  const addToWatchlist = useCallback(
    (item: Omit<WatchlistItem, "addedAt">) => {
      setWatchlist((prev) => {
        if (prev.some((w) => w.youtubeVideoId === item.youtubeVideoId)) return prev;
        return [{ ...item, addedAt: new Date().toISOString() }, ...prev];
      });
    },
    []
  );

  const removeFromWatchlist = useCallback((youtubeVideoId: string) => {
    setWatchlist((prev) => prev.filter((w) => w.youtubeVideoId !== youtubeVideoId));
  }, []);

  const isInWatchlist = useCallback(
    (youtubeVideoId: string) => watchlist.some((w) => w.youtubeVideoId === youtubeVideoId),
    [watchlist]
  );

  return { watchlist, addToWatchlist, removeFromWatchlist, isInWatchlist, loaded };
}
