import React from "react";
import RecipeCard from "./RecipeCard";

/**
 * PUBLIC_INTERFACE
 * RecipeGrid renders a responsive grid of RecipeCard items.
 *
 * Props:
 * - recipes: array of recipe objects
 * - emptyMessage?: string shown when no recipes
 */
export default function RecipeGrid({ recipes = [], emptyMessage = "No recipes found." }) {
  if (!recipes || recipes.length === 0) {
    return <div style={styles.empty}>{emptyMessage}</div>;
  }

  return (
    <div style={styles.grid} role="list">
      {recipes.map((r) => (
        <div key={r.id} style={styles.item} role="listitem">
          <RecipeCard recipe={r} />
        </div>
      ))}
    </div>
  );
}

const styles = {
  grid: {
    display: "grid",
    gap: 16,
    gridTemplateColumns: "repeat(12, minmax(0, 1fr))",
  },
  item: {
    gridColumn: "span 3",
  },
  empty: {
    padding: 16,
    color: "#6b7280",
    border: "1px dashed var(--border)",
    borderRadius: 12,
    background: "#fafafa",
  },
};

// Responsive adjustments via inline style media queries are not supported;
// rely on container CSS. Optionally, consumers can wrap with CSS classes.
// For simplicity, this grid assumes a 4-column layout on large screens.
// On smaller screens, CSS in layout.css collapses grid to single column wrapper.
