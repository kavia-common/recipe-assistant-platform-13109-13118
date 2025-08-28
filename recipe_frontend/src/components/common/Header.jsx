import React from 'react';
import { NavLink } from 'react-router-dom';

/**
 * PUBLIC_INTERFACE
 * Header component with primary navigation.
 */
export default function Header() {
  return (
    <header className="app-header">
      <div className="brand">
        <span className="brand-mark">🍳</span>
        <span className="brand-name">Recipe Assistant</span>
      </div>
      <nav className="nav">
        <NavLink to="/" className="nav-link">Home</NavLink>
        <NavLink to="/search" className="nav-link">Search</NavLink>
        <NavLink to="/favorites" className="nav-link">Favorites</NavLink>
        <NavLink to="/chat" className="nav-link">Chat</NavLink>
        <NavLink to="/auth" className="nav-link nav-cta">Login/Register</NavLink>
      </nav>
    </header>
  );
}
