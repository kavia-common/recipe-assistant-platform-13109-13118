//
// ChatService (REST version for Perplexity):
// This implementation posts user messages to a secure proxy endpoint that talks to Perplexity.
// The API key must be handled server-side. Frontend never hardcodes the key.
//
// Events:
// - status: "idle" | "connecting" | "open" | "closing" | "closed" | "error"
//   We simulate "open" for UX purposes when ready to send/receive.
// - message: emits payloads compatible with ChatWidget:
//    { type: "assistant_delta", text } and { type: "assistant_done" } or
//    { type: "assistant_message", text }
// - error: emits Error objects
//
// Note: For true streaming, your backend proxy can implement Server-Sent Events (SSE) or chunked
// transfer and transform Perplexity response into small deltas. Here we implement a simple approach:
// we request a full answer then emit it as a single assistant_message. Optionally, we simulate chunking.
//

import { PERPLEXITY_PROXY_URL } from "../config";

/**
 * PUBLIC_INTERFACE
 * Create a ChatService instance that communicates via HTTPS REST to a Perplexity proxy endpoint.
 * Consumers should keep a single instance per UI scope.
 *
 * Usage:
 *   const chat = createChatService();
 *   chat.connect(); // sets status to "open"
 *   chat.onMessage((msg) => { ... });
 *   chat.sendUserMessage("Hello");
 *   chat.disconnect();
 */
export function createChatService(_unusedPath = null) {
  let status = "idle"; // idle | connecting | open | closing | closed | error

  // Event subscribers
  const listeners = {
    open: new Set(),
    close: new Set(),
    error: new Set(),
    message: new Set(),
    status: new Set(),
  };

  function emit(type, payload) {
    const subs = listeners[type];
    if (!subs) return;
    subs.forEach((cb) => {
      try {
        cb(payload);
      } catch {
        // ignore subscriber errors to avoid crashing UI
      }
    });
  }

  function setStatus(next) {
    if (status === next) return;
    status = next;
    emit("status", next);
  }

  // PUBLIC_INTERFACE
  function connect() {
    /**
     * Since this is REST-based, there is no persistent socket. We mark the service as "open"
     * so the ChatWidget can indicate readiness. If a backend health check is needed, add it here.
     */
    setStatus("connecting");
    // Simulate quick ready
    setTimeout(() => {
      setStatus("open");
      emit("open");
    }, 0);
  }

  // PUBLIC_INTERFACE
  function disconnect() {
    /**
     * No persistent connection. We mark as closed for UI symmetry.
     */
    setStatus("closing");
    setTimeout(() => {
      setStatus("closed");
      emit("close");
    }, 0);
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

  async function postToPerplexity(prompt, options = {}) {
    /**
     * Calls a secure proxy endpoint that integrates with Perplexity.
     * The proxy should:
     * - Read Perplexity API key from server-side env (never expose to client).
     * - Call Perplexity REST API and return either a final text or stream chunks.
     *
     * Expected proxy request body (example):
     * { prompt: string, model?: string, system?: string, stream?: boolean }
     *
     * Expected proxy response (non-streaming simple mode):
     * { text: string } or { choices: [{ text: string }]} — adapt as needed.
     */
    const body = {
      prompt: String(prompt),
      model: options.model || "llama-3.1-sonar-small-128k-chat",
      stream: false, // simple mode; enable true if your proxy supports streaming
      system: options.system || "You are a helpful cooking assistant.",
    };

    const resp = await fetch(PERPLEXITY_PROXY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Do NOT attach API keys here. The server-side proxy must handle secrets securely.
      },
      body: JSON.stringify(body),
      credentials: "include", // if your proxy requires cookies/session
    });

    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      const err = new Error(`Perplexity request failed (${resp.status}) ${text}`);
      err.status = resp.status;
      throw err;
    }

    // Try to parse JSON structure and extract text
    const data = await resp.json().catch(() => ({}));
    // Common shapes: { text } or { choices: [{ text }]} or { answer }
    const answer =
      data.text ??
      data.answer ??
      data.choices?.[0]?.text ??
      data.choices?.[0]?.message?.content ??
      "";

    return String(answer || "");
  }

  // PUBLIC_INTERFACE
  async function sendUserMessage(text, metadata = {}) {
    /**
     * Sends user prompt to the Perplexity proxy and emits assistant response.
     * Error handling emits error event and sets status to "error" momentarily.
     */
    const prompt = (text || "").trim();
    if (!prompt) return;

    // Ensure "open" status for UX; connect if still idle
    if (status === "idle" || status === "closed") connect();

    try {
      const resultText = await postToPerplexity(prompt, metadata);

      // Emit single final message by default
      emit("message", { type: "assistant_message", text: resultText });

      // If simulated streaming preferred, uncomment:
      // for (const chunk of chunkString(resultText, 40)) {
      //   emit("message", { type: "assistant_delta", text: chunk });
      //   await new Promise(r => setTimeout(r, 20));
      // }
      // emit("message", { type: "assistant_done" });
    } catch (e) {
      setStatus("error");
      emit("error", e);
      // Keep the UI functional; revert to open after brief moment to allow retry
      setTimeout(() => setStatus("open"), 500);
      // Also forward a user-visible error message into the assistant stream if desired
      emit("message", {
        type: "assistant_message",
        text:
          "Sorry, I couldn't reach the AI service. Please try again in a moment.",
      });
    }
  }

  // Helper for simulated streaming (unused by default)
  function chunkString(str, size) {
    const chunks = [];
    for (let i = 0; i < str.length; i += size) {
      chunks.push(str.slice(i, i + size));
    }
    return chunks;
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
    // sendRaw is a no-op in REST mode to preserve API shape
    sendRaw: () => {},
    sendUserMessage,
    getStatus,
  };
}

export default { createChatService };
