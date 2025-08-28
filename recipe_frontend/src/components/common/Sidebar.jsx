import React from 'react';
import { Link } from 'react-router-dom';

/**
 * PUBLIC_INTERFACE
 * Sidebar component for categories and quick access links.
 */
export default function Sidebar() {
  const categories = ['Breakfast', 'Lunch', 'Dinner', 'Desserts', 'Vegetarian', 'Quick & Easy'];

  return (
    <div className="sidebar">
      <div className="sidebar-section">
        <h3 className="sidebar-title">Categories</h3>
        <ul className="sidebar-list">
          {categories.map((c) => (
            <li key={c}>
              <Link className="sidebar-link" to={`/search?category=${encodeURIComponent(c)}`}>{c}</Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="sidebar-section">
        <h3 className="sidebar-title">Quick Links</h3>
        <ul className="sidebar-list">
          <li><Link className="sidebar-link" to="/search?filter=popular">Popular</Link></li>
          <li><Link className="sidebar-link" to="/search?filter=healthy">Healthy</Link></li>
          <li><Link className="sidebar-link" to="/search?filter=budget">Budget</Link></li>
        </ul>
      </div>
    </div>
  );
}
