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

// PUBLIC_INTERFACE
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "/api";
/**
 * PUBLIC_INTERFACE
 * Base URL for HTTP API requests. Defaults to '/api' for same-origin setups.
 * Set REACT_APP_API_BASE_URL in environment to override, e.g. "https://api.example.com".
 */

// PUBLIC_INTERFACE
export const WS_BASE_URL =
  process.env.REACT_APP_WS_BASE_URL || null;
/**
 * PUBLIC_INTERFACE
 * Base URL for WebSocket connections (e.g., "wss://api.example.com").
 * If not set, you can derive it at usage time from window.location to match current origin.
 */

// Helper that derives a websocket URL from current location if WS_BASE_URL is not defined.
// PUBLIC_INTERFACE
export function resolveWebSocketUrl(path = "/ws") {
  /** Derive a WebSocket URL using WS_BASE_URL or current window location as a fallback. */
  if (WS_BASE_URL) {
    // Ensure single slash join between base and path
    return `${WS_BASE_URL.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
  }
  if (typeof window !== "undefined" && window.location) {
    const isSecure = window.location.protocol === "https:";
    const scheme = isSecure ? "wss" : "ws";
    return `${scheme}://${window.location.host}${path}`;
  }
  // Last-resort fallback
  return path;
}
