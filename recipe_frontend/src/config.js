//
//
// Application configuration for API and WebSocket base URLs.
// Reads from process.env without writing/creating any .env files.
//
// How to configure (Create React App convention):
// - Define REACT_APP_API_BASE_URL and REACT_APP_WS_BASE_URL in your environment at build/run time.
//   Example for local development (bash):
//     REACT_APP_API_BASE_URL="http://localhost:8000" \
//     REACT_APP_WS_BASE_URL="ws://localhost:8000" \
//     npm start
//
// Production builds should set these variables in the environment used by the build system.
//
// Defaults:
// - API base defaults to same-origin '/api' to keep relative calls within the same host.
// - WS base defaults to null which signals the app to derive it from window.location if needed.
//
// Note: Do not hard-code secrets or credentials here.
//

/**
 * PUBLIC_INTERFACE
 * Base HTTP API URL. Defaults to "/api" for same-origin setups.
 * Set REACT_APP_API_BASE_URL in environment to override, e.g. "https://api.example.com".
 */
// PUBLIC_INTERFACE
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "/api";

/**
 * PUBLIC_INTERFACE
 * Base URL for WebSocket connections (e.g., "wss://api.example.com").
 * If not set, derive from window.location at usage time.
 */
// PUBLIC_INTERFACE
export const WS_BASE_URL = process.env.REACT_APP_WS_BASE_URL || null;

// Helper that derives a websocket URL from current location if WS_BASE_URL is not defined.
// PUBLIC_INTERFACE
export function resolveWebSocketUrl(path = "/ws") {
  /** Derive a WebSocket URL using WS_BASE_URL or current window location as a fallback. */
  if (WS_BASE_URL) {
    // Ensure single slash join between base and path
    return `${WS_BASE_URL.replace(/\/*$/, "")}/${path.replace(/^\/*/, "")}`;
  }
  if (typeof window !== "undefined" && window.location) {
    const isSecure = window.location.protocol === "https:";
    const scheme = isSecure ? "wss" : "ws";
    return `${scheme}://${window.location.host}${path}`;
  }
  // Last-resort fallback
  return path;
}

/**
 * PUBLIC_INTERFACE
 * Perplexity integration configuration.
 * IMPORTANT: Do NOT hardcode secrets in frontend. This should point to a secure proxy endpoint
 * in your backend such as "/api/ai/perplexity", where the server attaches the Perplexity API key.
 *
 * If you must change it, set REACT_APP_PERPLEXITY_PROXY_URL at build/run time.
 */
// PUBLIC_INTERFACE
export const PERPLEXITY_PROXY_URL =
  process.env.REACT_APP_PERPLEXITY_PROXY_URL || "/api/ai/perplexity";

/**
 * PUBLIC_INTERFACE
 * Resolve the absolute URL for the Perplexity proxy, accounting for relative paths and API_BASE_URL.
 * If PERPLEXITY_PROXY_URL is absolute (http/https), it is returned as-is.
 * If relative, it will be joined with API_BASE_URL if API_BASE_URL is absolute; otherwise
 * left relative so the browser uses same-origin which matches CRA proxy setups.
 */
// PUBLIC_INTERFACE
export function getPerplexityProxyUrl() {
  const url = PERPLEXITY_PROXY_URL;
  const isAbsolute = /^https?:\/\//i.test(url);
  if (isAbsolute) return url;

  // If API_BASE_URL is absolute, join base and relative path
  const base = API_BASE_URL;
  const baseIsAbsolute = /^https?:\/\//i.test(base);
  if (baseIsAbsolute) {
    const baseTrim = base.replace(/\/*$/, "");
    const pathTrim = url.replace(/^\/*/, "");
    return `${baseTrim}/${pathTrim}`;
  }

  // Both relative: keep as-is to allow same-origin or dev proxy to handle it
  return url;
}
