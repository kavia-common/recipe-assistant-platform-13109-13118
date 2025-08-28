import axios from "axios";
import { API_BASE_URL } from "../config";

/**
 * HTTP utility: a pre-configured Axios instance for API requests.
 *
 * Features:
 * - Base URL comes from src/config.js (REACT_APP_API_BASE_URL or default "/api").
 * - Attaches an Authorization: Bearer <token> header if a JWT is present.
 * - Central place to add request/response interceptors, logging, and error handling.
 *
 * Token retrieval strategy:
 * - By default we read from localStorage key "auth_token".
 * - You can customize getToken() to integrate with your auth flow (e.g., context, cookies).
 */

// PUBLIC_INTERFACE
export function getToken() {
  /** Retrieve the JWT token used for API authorization. Override this if your token source differs. */
  try {
    return localStorage.getItem("auth_token");
  } catch {
    // localStorage may not be available in some environments (SSR/tests)
    return null;
  }
}

// Create the Axios instance
const http = axios.create({
  baseURL: API_BASE_URL,
  // You can set a global timeout if desired:
  // timeout: 15000,
});

// REQUEST INTERCEPTOR: Attach Authorization header if token is present
http.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      // Ensure headers object exists
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // Optional: add request error logging here
    return Promise.reject(error);
  }
);

// RESPONSE INTERCEPTOR: Centralized error handling hook
http.interceptors.response.use(
  (response) => response,
  (error) => {
    // Example hooks:
    // - If 401/403, you may want to trigger a logout or token refresh flow.
    // - If network error, show a toast/notification.
    // Keep this lightweight; full UX handling should be done by callers.
    // if (error?.response?.status === 401) { /* handle unauthorized */ }
    return Promise.reject(error);
  }
);

// PUBLIC_INTERFACE
export default http;
/**
 * Default export is the configured axios instance.
 *
 * Usage examples:
 *   import http from "@/utils/http";
 *   const { data } = await http.get("/recipes", { params: { q: "pasta" } });
 *   const { data } = await http.post("/auth/login", credentials);
 *
 * For absolute URLs (external services), axios will ignore baseURL if the URL starts with http/https.
 */
