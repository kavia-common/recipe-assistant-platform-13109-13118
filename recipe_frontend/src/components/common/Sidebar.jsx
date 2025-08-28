import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import RecipeService from '../../services/recipeService';

/**
 * PUBLIC_INTERFACE
 * Sidebar component for categories and quick access links.
 * Fetches categories from the API and links to /search with category filter.
 */
export default function Sidebar() {
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    RecipeService.getCategories()
      .then((res) => {
        if (!mounted) return;
        const list = res?.data || [];
        setCategories(list);
      })
      .catch((e) => {
        const msg = e?.response?.data?.message || e?.message || "Failed to load categories";
        setError(msg);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="sidebar">
      <div className="sidebar-section">
        <h3 className="sidebar-title">Categories</h3>
        {error && <div className="badge" style={{ background: "#fde68a", marginBottom: 8 }}>{error}</div>}
        <ul className="sidebar-list">
          {categories.map((c) => {
            const label = c?.name || c;
            return (
              <li key={c?.id || label}>
                <Link className="sidebar-link" to={`/search?category=${encodeURIComponent(label)}`}>{label}</Link>
              </li>
            );
          })}
          {categories.length === 0 && !error && (
            <>
              {['Breakfast', 'Lunch', 'Dinner', 'Desserts'].map((fallback) => (
                <li key={fallback}>
                  <Link className="sidebar-link" to={`/search?category=${encodeURIComponent(fallback)}`}>{fallback}</Link>
                </li>
              ))}
            </>
          )}
        </ul>
      </div>

      <div className="sidebar-section">
        <h3 className="sidebar-title">Quick Links</h3>
        <ul className="sidebar-list">
          <li><Link className="sidebar-link" to="/search?sort=popular">Popular</Link></li>
          <li><Link className="sidebar-link" to="/search?sort=rating">Top Rated</Link></li>
          <li><Link className="sidebar-link" to="/search?sort=latest">Latest</Link></li>
        </ul>
      </div>
    </div>
  );
}
