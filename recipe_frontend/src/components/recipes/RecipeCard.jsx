import React from "react";
import { Link } from "react-router-dom";

/**
 * PUBLIC_INTERFACE
 * RecipeCard renders a compact card for a recipe.
 *
 * Props:
 * - recipe: {
 *     id, title, image, category, time, calories, rating
 *   }
 */
export default function RecipeCard({ recipe }) {
  if (!recipe) return null;

  const {
    id,
    title,
    image,
    category,
    time,
    calories,
    rating,
    description,
  } = recipe;

  return (
    <div className="recipe-card" style={styles.card}>
      <Link to={`/recipe/${encodeURIComponent(id)}`} style={styles.link}>
        <div style={styles.imageWrap}>
          {image ? (
            <img
              src={image}
              alt={title}
              style={styles.image}
              loading="lazy"
            />
          ) : (
            <div style={styles.placeholder}>No Image</div>
          )}
          {category && <span style={styles.category}>{category}</span>}
        </div>
        <div style={styles.body}>
          <h3 style={styles.title}>{title}</h3>
          {description && (
            <p style={styles.desc}>
              {String(description).length > 90
                ? `${String(description).slice(0, 90)}…`
                : description}
            </p>
          )}
          <div style={styles.meta}>
            {typeof time !== "undefined" && (
              <span style={styles.metaItem}>⏱ {time}m</span>
            )}
            {typeof calories !== "undefined" && (
              <span style={styles.metaItem}>🔥 {calories} kcal</span>
            )}
            {typeof rating !== "undefined" && (
              <span style={styles.metaItem}>★ {rating}</span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}

const styles = {
  card: {
    border: "1px solid var(--border)",
    borderRadius: 12,
    overflow: "hidden",
    background: "#fff",
    boxShadow: "var(--shadow)",
    transition: "transform .08s ease, box-shadow .2s ease",
  },
  link: { color: "inherit", textDecoration: "none", display: "block" },
  imageWrap: { position: "relative", paddingTop: "56%", overflow: "hidden" },
  image: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  placeholder: {
    position: "absolute",
    inset: 0,
    display: "grid",
    placeItems: "center",
    background: "#f3f4f6",
    color: "#6b7280",
    fontSize: 12,
  },
  category: {
    position: "absolute",
    bottom: 8,
    left: 8,
    background: "rgba(0,0,0,.6)",
    color: "#fff",
    fontSize: 12,
    padding: "4px 8px",
    borderRadius: 8,
  },
  body: { padding: 12 },
  title: { margin: "0 0 8px", fontSize: 16, lineHeight: 1.3 },
  desc: {
    margin: "0 0 10px",
    fontSize: 13,
    color: "#6b7280",
    minHeight: 18,
  },
  meta: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    color: "#374151",
    fontSize: 12,
  },
  metaItem: {
    background: "#f3f4f6",
    borderRadius: 999,
    padding: "4px 8px",
  },
};
