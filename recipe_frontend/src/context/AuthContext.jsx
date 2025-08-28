import React, { createContext, useCallback, useEffect, useMemo, useState } from "react";
import http from "../utils/http";

/**
 * PUBLIC_INTERFACE
 * AuthContext provides authentication state and actions across the app.
 * It manages a JWT stored in localStorage and exposes login, register, and logout methods.
 *
 * Token storage:
 * - Stored under localStorage key "auth_token"
 * - A minimal "user" object is derived from backend responses if present.
 *
 * API endpoints (conventional; adjust to your backend):
 * - POST /auth/login { email, password } -> { token, user }
 * - POST /auth/register { name?, email, password } -> { token, user }
 */
export const AuthContext = createContext({
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  // Actions
  login: async (_credentials) => {},
  register: async (_payload) => {},
  logout: () => {},
  setError: (_e) => {},
});

const TOKEN_KEY = "auth_token";

/**
 * PUBLIC_INTERFACE
 * AuthProvider wraps children and provides authentication context.
 */
export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null); // minimal profile if backend returns it
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(TOKEN_KEY);
      if (stored) {
        setToken(stored);
        // Optionally fetch profile if needed:
        // fetchProfile();
      }
    } catch {
      // no-op if localStorage unavailable
    }
  }, []);

  // Persist token to localStorage whenever it changes
  useEffect(() => {
    try {
      if (token) {
        localStorage.setItem(TOKEN_KEY, token);
      } else {
        localStorage.removeItem(TOKEN_KEY);
      }
    } catch {
      // ignore storage errors (SSR/tests)
    }
  }, [token]);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    setError(null);
  }, []);

  const login = useCallback(async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await http.post("/auth/login", credentials);
      // Expect { token, user }
      if (data?.token) setToken(data.token);
      if (data?.user) setUser(data.user);
      return { success: true, data };
    } catch (e) {
      const message =
        e?.response?.data?.message ||
        e?.response?.data?.detail ||
        e?.message ||
        "Login failed";
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await http.post("/auth/register", payload);
      // Some backends may auto-login upon registration; handle both cases
      if (data?.token) setToken(data.token);
      if (data?.user) setUser(data.user);
      return { success: true, data };
    } catch (e) {
      const message =
        e?.response?.data?.message ||
        e?.response?.data?.detail ||
        e?.message ||
        "Registration failed";
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: !!token,
      loading,
      error,
      login,
      register,
      logout,
      setError,
    }),
    [user, token, loading, error, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
