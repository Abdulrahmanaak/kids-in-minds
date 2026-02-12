"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "atfaluna-favorites";

type FavoriteItem = {
  youtubeVideoId: string;
  title: string;
  thumbnailUrl: string | null;
  channelName: string | null;
  addedAt: string;
};

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setFavorites(JSON.parse(stored));
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    }
  }, [favorites, loaded]);

  const addFavorite = useCallback(
    (item: Omit<FavoriteItem, "addedAt">) => {
      setFavorites((prev) => {
        if (prev.some((f) => f.youtubeVideoId === item.youtubeVideoId)) return prev;
        return [{ ...item, addedAt: new Date().toISOString() }, ...prev];
      });
    },
    []
  );

  const removeFavorite = useCallback((youtubeVideoId: string) => {
    setFavorites((prev) => prev.filter((f) => f.youtubeVideoId !== youtubeVideoId));
  }, []);

  const isFavorite = useCallback(
    (youtubeVideoId: string) => favorites.some((f) => f.youtubeVideoId === youtubeVideoId),
    [favorites]
  );

  return { favorites, addFavorite, removeFavorite, isFavorite, loaded };
}
