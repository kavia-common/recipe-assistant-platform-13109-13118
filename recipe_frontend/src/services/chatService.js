//
// ChatService: manages a single WebSocket connection to the chatbot backend.
// Uses REACT_APP_WS_BASE_URL (via resolveWebSocketUrl) and attaches Authorization if token exists.
// Provides a small event emitter API to subscribe to connection state and messages.
//

import { resolveWebSocketUrl } from "../config";
import { getToken } from "../utils/http";

/**
 * PUBLIC_INTERFACE
 * Create a ChatService instance that manages a WebSocket connection to a given path.
 * Consumers should keep a single instance per UI scope (e.g., app-level or page).
 *
 * Usage:
 *   const chat = createChatService();
 *   chat.connect(); // or will auto-connect on first send()
 *   chat.onMessage((msg) => { ... });
 *   chat.sendUserMessage("Hello");
 *   chat.disconnect();
 */
export function createChatService(path = "/ws/chat") {
  let socket = null;
  let status = "idle"; // idle | connecting | open | closing | closed | error
  let reconnectAttempts = 0;
  let reconnectTimer = null;
  let manualClose = false;

  // Event subscribers
  const listeners = {
    open: new Set(),
    close: new Set(),
    error: new Set(),
    message: new Set(), // receives parsed message objects or raw strings
    status: new Set(), // receives status changes
  };

  function emit(type, payload) {
    const subs = listeners[type];
    if (!subs) return;
    subs.forEach((cb) => {
      try {
        cb(payload);
      } catch {
        // ignore subscriber errors
      }
    });
  }

  function setStatus(next) {
    if (status === next) return;
    status = next;
    emit("status", next);
  }

  function buildUrl() {
    // Build full ws URL, append auth token if present
    const base = resolveWebSocketUrl(path);
    const token = getToken();
    if (token) {
      const u = new URL(base, typeof window !== "undefined" ? window.location.href : "http://localhost");
      u.searchParams.set("token", token); // fallback method if Authorization header not supported by WS server
      return u.toString();
    }
    return base;
  }

  function connect() {
    if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
      return;
    }
    manualClose = false;
    setStatus("connecting");
    const url = buildUrl();

    // Some servers support token in query. If your server supports headers via subprotocols,
    // adapt here. Browsers can't set arbitrary headers on WebSocket handshake.
    socket = new WebSocket(url);

    socket.onopen = () => {
      setStatus("open");
      reconnectAttempts = 0;
      emit("open");
    };

    socket.onmessage = (event) => {
      let payload = event.data;
      try {
        // Try parse JSON, fallback to string
        const parsed = JSON.parse(event.data);
        payload = parsed;
      } catch {
        // keep as string
      }
      emit("message", payload);
    };

    socket.onerror = (err) => {
      setStatus("error");
      emit("error", err);
    };

    socket.onclose = () => {
      emit("close");
      setStatus("closed");
      // Try reconnect unless manually closed
      if (!manualClose) scheduleReconnect();
    };
  }

  function scheduleReconnect() {
    // Exponential backoff capped to 5s
    if (reconnectTimer) return;
    const delay = Math.min(5000, 500 * Math.pow(2, reconnectAttempts++));
    reconnectTimer = setTimeout(() => {
      reconnectTimer = null;
      connect();
    }, delay);
  }

  function disconnect() {
    manualClose = true;
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    if (socket) {
      try {
        setStatus("closing");
        socket.close();
      } catch {
        // ignore
      }
      socket = null;
      setStatus("closed");
    }
  }

  // PUBLIC_INTERFACE
  function onOpen(cb) {
    /** Subscribe to open events. Returns an unsubscribe function. */
    listeners.open.add(cb);
    return () => listeners.open.delete(cb);
  }
  // PUBLIC_INTERFACE
  function onClose(cb) {
    /** Subscribe to close events. Returns an unsubscribe function. */
    listeners.close.add(cb);
    return () => listeners.close.delete(cb);
  }
  // PUBLIC_INTERFACE
  function onError(cb) {
    /** Subscribe to error events. Returns an unsubscribe function. */
    listeners.error.add(cb);
    return () => listeners.error.delete(cb);
  }
  // PUBLIC_INTERFACE
  function onMessage(cb) {
    /** Subscribe to message events. Returns an unsubscribe function. */
    listeners.message.add(cb);
    return () => listeners.message.delete(cb);
  }
  // PUBLIC_INTERFACE
  function onStatus(cb) {
    /** Subscribe to status changes. Returns an unsubscribe function. */
    listeners.status.add(cb);
    return () => listeners.status.delete(cb);
  }

  // PUBLIC_INTERFACE
  function sendRaw(data) {
    /** Send a raw string/JSON-serializable object over the socket. Auto-connects if needed. */
    if (!socket || socket.readyState === WebSocket.CLOSED) {
      connect();
    }
    const payload = typeof data === "string" ? data : JSON.stringify(data);
    // Queue if not open yet
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(payload);
    } else {
      // Wait for open, then send once
      const unsub = onOpen(() => {
        try {
          socket && socket.send(payload);
        } finally {
          unsub();
        }
      });
    }
  }

  // PUBLIC_INTERFACE
  function sendUserMessage(text, metadata = {}) {
    /**
     * Send a user message following a common schema { type: "user_message", text, ... }.
     * Adjust shape to your backend needs.
     */
    if (!text || !text.trim()) return;
    sendRaw({ type: "user_message", text: String(text), ...metadata });
  }

  // PUBLIC_INTERFACE
  function getStatus() {
    /** Get current connection status. */
    return status;
  }

  return {
    connect,
    disconnect,
    onOpen,
    onClose,
    onError,
    onMessage,
    onStatus,
    sendRaw,
    sendUserMessage,
    getStatus,
  };
}

export default { createChatService };
