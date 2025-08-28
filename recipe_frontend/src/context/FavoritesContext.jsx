import React, { createContext, useCallback, useEffect, useMemo, useState, useContext } from "react";
import FavoriteService from "../services/favoriteService";
import { AuthContext } from "./AuthContext";

/**
 * PUBLIC_INTERFACE
 * FavoritesContext provides the list of favorited recipe IDs for the current user,
 * and exposes methods to check/toggle a recipe as favorite. It syncs with backend
 * when the user is authenticated, and falls back to localStorage cache for quick UX.
 *
 * Storage:
 * - Local cache under localStorage key "fav_ids" (array of recipe IDs)
 *
 * API (conventional, implemented in favoriteService):
 * - GET /favorites -> [{ id, recipeId, ... }] or [{ id }]
 * - POST /favorites { recipeId } -> { id, recipeId }
 * - DELETE /favorites/:recipeId -> 204
 */
export const FavoritesContext = createContext({
  favorites: new Set(),
  loading: false,
  error: null,
  // Actions
  isFavorited: (_recipeId) => false,
  toggleFavorite: async (_recipeId) => {},
  refreshFavorites: async () => {},
});

const LOCAL_KEY = "fav_ids";

/**
 * PUBLIC_INTERFACE
 * FavoritesProvider wraps children to provide favorites state and actions.
 */
export function FavoritesProvider({ children }) {
  const { isAuthenticated } = useContext(AuthContext);
  const [favorites, setFavorites] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load cached favorites from localStorage (for optimistic UX on startup)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LOCAL_KEY);
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) {
          setFavorites(new Set(arr));
        }
      }
    } catch {
      // ignore storage errors
    }
    // We don't put isAuthenticated here to avoid double-initialization
    // Initial cache load should happen only once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync with backend when authentication state changes to true
  const refreshFavorites = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await FavoriteService.listFavorites();
      // Normalize response to a list of recipe IDs
      const ids = Array.isArray(data)
        ? data.map((it) => it.recipeId ?? it.id ?? it)
        : [];
      const setIds = new Set(ids.filter(Boolean));
      setFavorites(setIds);
      try {
        localStorage.setItem(LOCAL_KEY, JSON.stringify(Array.from(setIds)));
      } catch {
        // ignore storage error
      }
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || "Failed to load favorites.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      refreshFavorites();
    }
  }, [isAuthenticated, refreshFavorites]);

  const isFavorited = useCallback(
    (recipeId) => {
      const id = String(recipeId);
      return favorites.has(id) || favorites.has(Number(recipeId));
    },
    [favorites]
  );

  const toggleFavorite = useCallback(
    async (recipeId) => {
      const idStr = String(recipeId);
      const isFav = isFavorited(recipeId);

      // Optimistic update
      setFavorites((prev) => {
        const next = new Set(prev);
        if (isFav) {
          next.delete(idStr);
          next.delete(Number(recipeId));
        } else {
          next.add(idStr);
        }
        try {
          localStorage.setItem(LOCAL_KEY, JSON.stringify(Array.from(next)));
        } catch {
          // ignore
        }
        return next;
      });

      // Sync to backend if authenticated
      try {
        if (isAuthenticated) {
          if (isFav) {
            await FavoriteService.removeFavorite(recipeId);
          } else {
            await FavoriteService.addFavorite(recipeId);
          }
        }
      } catch (e) {
        // Revert on error
        setFavorites((prev) => {
          const revert = new Set(prev);
          if (isFav) {
            revert.add(idStr);
          } else {
            revert.delete(idStr);
            revert.delete(Number(recipeId));
          }
          try {
            localStorage.setItem(LOCAL_KEY, JSON.stringify(Array.from(revert)));
          } catch {
            // ignore
          }
          return revert;
        });
        throw e;
      }
    },
    [isAuthenticated, isFavorited]
  );

  const value = useMemo(
    () => ({
      favorites,
      loading,
      error,
      isFavorited,
      toggleFavorite,
      refreshFavorites,
    }),
    [favorites, loading, error, isFavorited, toggleFavorite, refreshFavorites]
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}
