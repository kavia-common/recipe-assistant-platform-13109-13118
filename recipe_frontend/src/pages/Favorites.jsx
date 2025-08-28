import React, { useContext, useEffect, useMemo, useState } from "react";
import { FavoritesContext } from "../context/FavoritesContext";
import RecipeService from "../services/recipeService";
import RecipeGrid from "../components/recipes/RecipeGrid";

/**
 * PUBLIC_INTERFACE
 * Favorites page lists the user's saved recipes.
 * When favorites are only IDs, it fetches the full recipe details via RecipeService.
 */
export default function Favorites() {
  const { favorites, loading: favLoading, error: favError, refreshFavorites } = useContext(FavoritesContext);
  const [recipes, setRecipes] = useState([]);
  const [loadingRecipes, setLoadingRecipes] = useState(false);
  const [error, setError] = useState("");

  const favoriteIds = useMemo(() => Array.from(favorites || new Set()), [favorites]);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoadingRecipes(true);
      setError("");
      try {
        // Fetch recipe details for each favorite id in parallel (could be optimized with batch API)
        const results = await Promise.all(
          favoriteIds.map((id) =>
            RecipeService.getRecipeById(id)
              .then((res) => res?.data)
              .catch(() => null)
          )
        );
        if (!mounted) return;
        setRecipes(results.filter(Boolean));
      } catch (e) {
        if (!mounted) return;
        const msg = e?.response?.data?.message || e?.message || "Failed to load favorite recipes.";
        setError(msg);
      } finally {
        if (mounted) setLoadingRecipes(false);
      }
    };

    if (favoriteIds.length > 0) {
      load();
    } else {
      setRecipes([]);
    }

    return () => {
      mounted = false;
    };
  }, [favoriteIds]);

  useEffect(() => {
    // On first visit, ensure server sync attempted once
    refreshFavorites().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isLoading = favLoading || loadingRecipes;

  return (
    <div className="page">
      <h1>Favorites</h1>
      <p>Your saved recipes all in one place.</p>

      {isLoading && <div className="badge" style={{ marginTop: 8 }}>Loading favorites…</div>}
      {(favError || error) && (
        <div className="badge" style={{ background: "#fde68a", marginTop: 8 }}>
          {favError || error}
        </div>
      )}

      {!isLoading && recipes.length === 0 && (
        <div style={styles.emptyBox}>
          <div style={{ fontSize: 18, marginBottom: 6 }}>No favorites yet</div>
          <div style={{ color: "#6b7280" }}>Browse recipes and tap the heart to save them here.</div>
        </div>
      )}

      {!isLoading && recipes.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <RecipeGrid recipes={recipes} emptyMessage="No favorites yet." />
        </div>
      )}
    </div>
  );
}

const styles = {
  emptyBox: {
    marginTop: 12,
    padding: 16,
    border: "1px dashed var(--border)",
    borderRadius: 12,
    background: "#fafafa",
  },
};
