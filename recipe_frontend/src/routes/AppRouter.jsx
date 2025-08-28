import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Simple route stubs
const Home = () => <div className="page"><h1>Home</h1><p>Discover trending recipes and suggestions.</p></div>;
const Search = () => <div className="page"><h1>Search</h1><p>Find recipes by ingredients, cuisine, or difficulty.</p></div>;
const RecipeDetails = () => <div className="page"><h1>Recipe Details</h1><p>View detailed steps, ingredients, and tips.</p></div>;
const Favorites = () => <div className="page"><h1>Favorites</h1><p>Manage your saved recipes.</p></div>;
const Auth = () => <div className="page"><h1>Login / Register</h1><p>Access your account to sync favorites.</p></div>;
const Chat = () => <div className="page"><h1>Chat Assistant</h1><p>Ask the AI for cooking help and meal planning.</p></div>;

// PUBLIC_INTERFACE
export default function AppRouter() {
  /** Defines application routes using react-router-dom v6. */
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/recipe/:id" element={<RecipeDetails />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}
