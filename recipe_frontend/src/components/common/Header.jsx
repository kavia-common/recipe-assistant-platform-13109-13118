import React, { useContext } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

/**
 * PUBLIC_INTERFACE
 * Header component with primary navigation.
 * Shows login/register when unauthenticated, and user status + logout when authenticated.
 */
export default function Header() {
  const { isAuthenticated, user, logout } = useContext(AuthContext);

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

        {!isAuthenticated ? (
          <>
            <NavLink to="/login" className="nav-link">Login</NavLink>
            <NavLink to="/register" className="nav-link nav-cta">Register</NavLink>
          </>
        ) : (
          <>
            <span className="badge" title={user?.email || "Authenticated"}>
              ✓ Signed in{user?.name ? ` as ${user.name}` : ""}
            </span>
            <button onClick={logout} style={{ marginLeft: 8 }}>Logout</button>
          </>
        )}
      </nav>
    </header>
  );
}
