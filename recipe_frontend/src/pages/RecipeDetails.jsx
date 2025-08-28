import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import RecipeService from "../services/recipeService";

/**
 * PUBLIC_INTERFACE
 * RecipeDetails displays a single recipe and its details.
 *
 * Path params:
 * - id: recipe identifier
 */
export default function RecipeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [recipe, setRecipe] = useState(null);
  const [fav, setFav] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await RecipeService.getRecipeById(id);
      setRecipe(res?.data);
    } catch (e) {
      const message = e?.response?.data?.message || e?.message || "Recipe not found.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!id) {
      navigate("/search");
      return;
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const toggleFav = () => {
    // This is a stubbed favorite toggle for UI feedback.
    // Integration with backend/user storage can be added later.
    setFav((v) => !v);
  };

  if (loading) return <div className="badge">Loading recipe…</div>;
  if (error) return <div className="badge" style={{ background: "#fde68a" }}>{error}</div>;
  if (!recipe) return null;

  const { title, image, ingredients, steps, nutrition, time, calories, category, rating, description } = recipe;

  return (
    <div className="page">
      <div style={styles.header}>
        <div style={styles.headerText}>
          <h1 style={{ margin: 0 }}>{title}</h1>
          <p style={{ color: "#6b7280", margin: "4px 0 10px" }}>{description || ""}</p>
          <div style={styles.meta}>
            {category && <span className="badge">{category}</span>}
            {typeof time !== "undefined" && <span className="badge">⏱ {time}m</span>}
            {typeof calories !== "undefined" && <span className="badge">🔥 {calories} kcal</span>}
            {typeof rating !== "undefined" && <span className="badge">★ {rating}</span>}
          </div>
        </div>
        <button onClick={toggleFav}>{fav ? "★ Favorited" : "☆ Add to Favorites"}</button>
      </div>

      <div style={styles.mediaWrap}>
        {image ? (
          <img src={image} alt={title} style={styles.image} />
        ) : (
          <div style={styles.placeholder}>No image available</div>
        )}
      </div>

      <div style={styles.columns}>
        <section style={styles.col}>
          <h2 style={styles.h2}>Ingredients</h2>
          {Array.isArray(ingredients) && ingredients.length > 0 ? (
            <ul style={styles.list}>
              {ingredients.map((it, idx) => (
                <li key={idx} style={styles.li}>{typeof it === "string" ? it : it?.text || JSON.stringify(it)}</li>
              ))}
            </ul>
          ) : (
            <p style={styles.muted}>No ingredients listed.</p>
          )}

          <h2 style={styles.h2}>Steps</h2>
          {Array.isArray(steps) && steps.length > 0 ? (
            <ol style={styles.ol}>
              {steps.map((s, idx) => (
                <li key={idx} style={styles.li}>{typeof s === "string" ? s : s?.text || JSON.stringify(s)}</li>
              ))}
            </ol>
          ) : (
            <p style={styles.muted}>No steps available.</p>
          )}
        </section>

        <aside style={styles.aside}>
          <h2 style={styles.h2}>Nutrition</h2>
          {nutrition ? (
            <div style={styles.nutrition}>
              {Object.entries(nutrition).map(([k, v]) => (
                <div key={k} style={styles.nutriRow}>
                  <span style={styles.nutriKey}>{k}</span>
                  <span style={styles.nutriVal}>{String(v)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p style={styles.muted}>Nutrition not provided.</p>
          )}
        </aside>
      </div>
    </div>
  );
}

const styles = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "flex-start",
  },
  headerText: { flex: 1 },
  meta: { display: "flex", gap: 8, flexWrap: "wrap" },
  mediaWrap: {
    marginTop: 14,
    borderRadius: 12,
    overflow: "hidden",
    border: "1px solid var(--border)",
    boxShadow: "var(--shadow)",
  },
  image: { width: "100%", height: "auto", display: "block", maxHeight: 420, objectFit: "cover" },
  placeholder: {
    display: "grid",
    placeItems: "center",
    height: 280,
    background: "#f3f4f6",
    color: "#6b7280",
  },
  columns: {
    marginTop: 18,
    display: "grid",
    gridTemplateColumns: "1fr 320px",
    gap: 16,
  },
  col: {
    paddingRight: 8,
  },
  aside: {
    border: "1px solid var(--border)",
    borderRadius: 12,
    padding: 12,
    height: "fit-content",
    boxShadow: "var(--shadow)",
  },
  h2: { marginTop: 0, fontSize: 18, color: "var(--secondary)" },
  list: { margin: 0, paddingLeft: 18 },
  ol: { margin: 0, paddingLeft: 18 },
  li: { marginBottom: 6 },
  muted: { color: "#6b7280" },
  nutrition: { display: "grid", gap: 6 },
  nutriRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "6px 8px",
    borderRadius: 8,
    background: "#f9fafb",
    border: "1px solid var(--border)",
  },
  nutriKey: { color: "#374151" },
  nutriVal: { color: "#111827", fontWeight: 600 },
};
