import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import RecipeService from "../services/recipeService";
import RecipeGrid from "../components/recipes/RecipeGrid";
import SearchBar from "../components/recipes/SearchBar";

/**
 * PUBLIC_INTERFACE
 * Search page for filtering recipes by query and category with basic pagination.
 *
 * Query params:
 * - q: search query
 * - category: category filter
 * - page: page number (default 1)
 * - limit: page size (default 12)
 * - sort: optional sort
 */
export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const q = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const page = Number(searchParams.get("page") || "1");
  const limit = Number(searchParams.get("limit") || "12");
  const sort = searchParams.get("sort") || "";

  const [categories, setCategories] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load categories one time
  useEffect(() => {
    let mounted = true;
    RecipeService.getCategories()
      .then((res) => mounted && setCategories(res?.data || []))
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const params = { q: q || undefined, category: category || undefined, page, limit, sort: sort || undefined };
      const res = q
        ? await RecipeService.searchRecipes(params)
        : await RecipeService.getRecipes(params);

      const items = res?.data?.items || res?.data?.results || res?.data || [];
      setRecipes(Array.isArray(items) ? items : []);
      const t =
        typeof res?.data?.total === "number"
          ? res.data.total
          : Number(res?.headers?.["x-total-count"]) || items.length;
      setTotal(t);
    } catch (e) {
      const message =
        e?.response?.data?.message || e?.message || "Failed to fetch results.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, category, page, limit, sort]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil((total || 0) / (limit || 1))), [total, limit]);

  const onCategoryChange = (e) => {
    const value = e.target.value;
    const next = new URLSearchParams(searchParams);
    if (value) next.set("category", value);
    else next.delete("category");
    next.set("page", "1");
    navigate(`/search?${next.toString()}`);
  };

  const setPage = (p) => {
    const next = new URLSearchParams(searchParams);
    next.set("page", String(p));
    setSearchParams(next);
  };

  return (
    <div className="page">
      <h1>Search Recipes</h1>
      <p>Find dishes by name, ingredient, or category.</p>

      <SearchBar />

      <div style={styles.filters}>
        <label htmlFor="category">Category</label>
        <select id="category" value={category} onChange={onCategoryChange} style={styles.select}>
          <option value="">All</option>
          {categories.map((c) => (
            <option key={c.id || c} value={c.name || c}>
              {c.name || c}
            </option>
          ))}
        </select>
      </div>

      {loading && <div className="badge">Loading…</div>}
      {error && (
        <div className="badge" style={{ background: "#fde68a", marginTop: 8 }}>
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          <RecipeGrid recipes={recipes} emptyMessage="No matching recipes." />
          <div style={styles.pagination} aria-label="Pagination">
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1}>
              Previous
            </button>
            <span style={styles.pageInfo}>
              Page {page} of {totalPages}
            </span>
            <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page >= totalPages}>
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  filters: { display: "flex", alignItems: "center", gap: 10, marginBottom: 12 },
  select: {
    padding: "8px 10px",
    borderRadius: 10,
    border: "1px solid var(--border)",
  },
  pagination: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    justifyContent: "center",
    marginTop: 16,
  },
  pageInfo: { color: "#6b7280" },
};
