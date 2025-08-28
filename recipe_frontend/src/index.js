import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import './styles/layout.css';
import App from './App';
import { AuthProvider } from './context/AuthContext';

/**
 * PUBLIC_INTERFACE
 * Root entrypoint that renders the application.
 * Wraps the entire app with BrowserRouter so that Link/NavLink and route components
 * have access to the routing context.
 */
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
