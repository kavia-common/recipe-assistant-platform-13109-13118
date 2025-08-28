import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import RecipeService from "../services/recipeService";
import RecipeGrid from "../components/recipes/RecipeGrid";

/**
 * PUBLIC_INTERFACE
 * Home page shows featured and latest recipes, with optional category filtering.
 *
 * Query params:
 * - category: filter recipes by category
 */
export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get("category") || "";

  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [latest, setLatest] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [catRes, featRes, latestRes] = await Promise.all([
        RecipeService.getCategories(),
        RecipeService.getRecipes({ limit: 8, sort: "featured", category: category || undefined }),
        RecipeService.getRecipes({ limit: 12, sort: "latest", category: category || undefined }),
      ]);
      setCategories(catRes?.data || []);
      setFeatured(featRes?.data?.items || featRes?.data || []);
      setLatest(latestRes?.data?.items || latestRes?.data || []);
    } catch (e) {
      const message =
        e?.response?.data?.message || e?.message || "Failed to load recipes.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  const onCategoryChange = (e) => {
    const value = e.target.value;
    const next = new URLSearchParams(searchParams);
    if (value) next.set("category", value);
    else next.delete("category");
    setSearchParams(next);
  };

  const selectedLabel = useMemo(() => category || "All categories", [category]);

  return (
    <div className="page">
      <h1>Discover Recipes</h1>
      <p>Explore featured picks and the latest additions{category ? ` in ${category}` : ""}.</p>

      <div style={styles.controls}>
        <label htmlFor="category">Category</label>
        <select id="category" value={category} onChange={onCategoryChange} style={styles.select}>
          <option value="">All</option>
          {categories.map((c) => (
            <option key={c.id || c} value={c.name || c}>
              {c.name || c}
            </option>
          ))}
        </select>
        <Link className="btn" to={`/search${category ? `?category=${encodeURIComponent(category)}` : ""}`}>
          Search in {selectedLabel}
        </Link>
      </div>

      {loading && <div className="badge">Loading recipes…</div>}
      {error && (
        <div className="badge" style={{ background: "#fde68a", marginTop: 8 }}>
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          <section style={styles.section}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.h2}>Featured</h2>
              <Link to={`/search?sort=featured${category ? `&category=${encodeURIComponent(category)}` : ""}`}>View all</Link>
            </div>
            <RecipeGrid recipes={featured} emptyMessage="No featured recipes." />
          </section>

          <section style={styles.section}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.h2}>Latest</h2>
              <Link to={`/search?sort=latest${category ? `&category=${encodeURIComponent(category)}` : ""}`}>View all</Link>
            </div>
            <RecipeGrid recipes={latest} emptyMessage="No recent recipes." />
          </section>
        </>
      )}
    </div>
  );
}

const styles = {
  controls: {
    display: "flex",
    gap: 10,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 16,
  },
  select: {
    padding: "8px 10px",
    borderRadius: 10,
    border: "1px solid var(--border)",
  },
  section: { marginTop: 16 },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 8,
  },
  h2: { margin: 0, fontSize: 18, color: "var(--secondary)" },
};
