import React from 'react';

/**
 * PUBLIC_INTERFACE
 * Footer component displayed across the app.
 */
export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="app-footer">
      <p>© {year} Recipe Assistant • Crafted with <span aria-label="love">❤️</span></p>
    </footer>
  );
}
