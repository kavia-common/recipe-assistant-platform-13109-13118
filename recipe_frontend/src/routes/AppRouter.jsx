import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import Login from '../pages/Login';
import Register from '../pages/Register';

// Simple route stubs
const Home = () => <div className="page"><h1>Home</h1><p>Discover trending recipes and suggestions.</p></div>;
const Search = () => <div className="page"><h1>Search</h1><p>Find recipes by ingredients, cuisine, or difficulty.</p></div>;
const RecipeDetails = () => <div className="page"><h1>Recipe Details</h1><p>View detailed steps, ingredients, and tips.</p></div>;
const FavoritesPage = () => <div className="page"><h1>Favorites</h1><p>Manage your saved recipes.</p></div>;
const Chat = () => <div className="page"><h1>Chat Assistant</h1><p>Ask the AI for cooking help and meal planning.</p></div>;

// PUBLIC_INTERFACE
export default function AppRouter() {
  /** Defines application routes using react-router-dom v6. Assumes a Router is provided higher in the tree. */
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/search" element={<Search />} />
      <Route path="/recipe/:id" element={<RecipeDetails />} />
      <Route
        path="/favorites"
        element={
          <ProtectedRoute>
            <FavoritesPage />
          </ProtectedRoute>
        }
      />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/chat" element={<Chat />} />
      <Route path="*" element={<Home />} />
    </Routes>
  );
}
