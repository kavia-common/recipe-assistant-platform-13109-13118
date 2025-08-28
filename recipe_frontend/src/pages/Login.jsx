import React, { useContext, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

/**
 * PUBLIC_INTERFACE
 * Login page component providing an email/password form and handling auth flow.
 */
export default function Login() {
  const { login, loading, error, setError, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const [form, setForm] = useState({ email: "", password: "" });

  const onChange = (e) => {
    setError(null);
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const res = await login(form);
    if (res.success) {
      navigate(from, { replace: true });
    }
  };

  if (isAuthenticated) {
    // If already logged in, redirect to home
    navigate(from, { replace: true });
    return null;
  }

  return (
    <div className="page">
      <h1>Login</h1>
      <p>Access your account to sync favorites and preferences.</p>

      <form onSubmit={onSubmit} style={{ marginTop: 16, maxWidth: 420 }}>
        <div style={{ marginBottom: 12 }}>
          <label htmlFor="email" style={{ display: "block", marginBottom: 6 }}>
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={form.email}
            onChange={onChange}
            placeholder="you@example.com"
            style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #e5e7eb" }}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label htmlFor="password" style={{ display: "block", marginBottom: 6 }}>
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            value={form.password}
            onChange={onChange}
            placeholder="••••••••"
            style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #e5e7eb" }}
          />
        </div>

        {error && (
          <div className="badge" style={{ marginBottom: 12, background: "#fde68a" }}>
            {error}
          </div>
        )}

        <button type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Login"}
        </button>
      </form>

      <p style={{ marginTop: 16 }}>
        No account? <Link to="/register">Create one</Link>
      </p>
    </div>
  );
}
