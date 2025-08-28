/**
 * ChatWidget: a minimal, modern chat UI component using ChatService.
 * Offers:
 * - Message list (user/assistant)
 * - Input with send button
 * - Quick prefill prompts
 * - Connection indicators and retry on errors
 *
 * Props:
 * - service: required ChatService instance (from createChatService)
 * - initialMessages?: array of messages { role: 'user'|'assistant'|'system', content: string }
 * - placeholder?: input placeholder
 * - compact?: boolean to reduce paddings for floating dock
 *
 * PUBLIC_INTERFACE
 */
import React, { useEffect, useMemo, useRef, useState } from "react";
import "../../styles/chat.css";

export default function ChatWidget({
  service,
  initialMessages = [],
  placeholder = "Ask the cooking assistant anything...",
  compact = false,
}) {
  const [messages, setMessages] = useState(() => normalize(initialMessages));
  const [input, setInput] = useState("");
  const [status, setStatus] = useState(service?.getStatus?.() || "idle");
  const [error, setError] = useState("");

  const listRef = useRef(null);
  const assistantBufferRef = useRef(""); // buffer for streaming assistant messages

  // Subscribe to service events
  useEffect(() => {
    if (!service) return;
    const offStatus = service.onStatus((s) => {
      setStatus(s);
      if (s === "open") setError("");
    });
    const offError = service.onError((e) => {
      const msg = e?.message || "WebSocket error";
      setError(msg);
    });
    const offMessage = service.onMessage((payload) => {
      // Accept schema:
      // - { type: 'assistant_message', text: '...' }  -> final message
      // - { type: 'assistant_delta', text: '...' }    -> streaming delta
      // - { type: 'assistant_done' }                  -> end of stream
      // - { type: 'error', message: '...' }
      // - string/plain -> append as assistant message
      if (typeof payload === "string") {
        appendAssistant(payload);
        return;
      }
      switch (payload?.type) {
        case "assistant_message":
          flushAssistantBuffer();
          appendAssistant(String(payload.text ?? ""));
          break;
        case "assistant_delta":
          appendAssistantDelta(String(payload.text ?? ""));
          break;
        case "assistant_done":
          flushAssistantBuffer();
          break;
        case "error":
          setError(payload?.message || "Chat error");
          break;
        default:
          // Unknown payload; attempt to stringify
          appendAssistant(safeStringify(payload));
          break;
      }
    });

    // Optional: auto-connect here for better responsiveness
    service.connect?.();

    return () => {
      offStatus && offStatus();
      offError && offError();
      offMessage && offMessage();
    };
  }, [service]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, status]);

  function normalize(list) {
    if (!Array.isArray(list)) return [];
    return list.map((m, idx) => ({
      id: m.id || `m-${idx}-${Date.now()}`,
      role: m.role || "assistant",
      content: String(m.content ?? ""),
    }));
  }

  function safeStringify(obj) {
    try {
      return JSON.stringify(obj);
    } catch {
      return String(obj);
    }
  }

  function appendAssistantDelta(text) {
    // If last message is assistant and "streaming", append delta; else create buffer
    assistantBufferRef.current += text;
    setMessages((prev) => {
      const next = [...prev];
      const last = next[next.length - 1];
      if (last && last.role === "assistant" && last._streaming) {
        last.content = (last.content || "") + text;
      } else {
        next.push({
          id: `a-${Date.now()}`,
          role: "assistant",
          content: text,
          _streaming: true,
        });
      }
      return next;
    });
  }

  function flushAssistantBuffer() {
    assistantBufferRef.current = "";
    setMessages((prev) => {
      if (prev.length === 0) return prev;
      const next = [...prev];
      const last = next[next.length - 1];
      if (last && last.role === "assistant" && last._streaming) {
        delete last._streaming;
      }
      return next;
    });
  }

  function appendAssistant(text) {
    setMessages((prev) => [
      ...prev,
      { id: `a-${Date.now()}`, role: "assistant", content: text },
    ]);
  }

  function appendUser(text) {
    setMessages((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, role: "user", content: text },
    ]);
  }

  function send() {
    const text = input.trim();
    if (!text) return;
    setInput("");
    appendUser(text);
    try {
      service?.sendUserMessage?.(text, { ts: Date.now() });
    } catch (e) {
      setError(e?.message || "Failed to send");
    }
  }

  function prefillAndSend(text) {
    setInput(text);
    // allow user to edit or send right away; here we send immediately for speed:
    setTimeout(() => {
      send();
    }, 0);
  }

  const isSending = useMemo(() => status === "connecting" || status === "closing", [status]);

  return (
    <div className={`chat-root ${compact ? "chat-compact" : ""}`}>
      <div className="chat-header">
        <div className="chat-title">AI Cooking Assistant</div>
        <div className={`chat-status ${status}`}>
          {status === "open" && "● Connected"}
          {status === "connecting" && "… Connecting"}
          {status === "closed" && "○ Disconnected"}
          {status === "error" && "⚠ Error"}
          {status === "closing" && "… Closing"}
          {status === "idle" && "○ Idle"}
        </div>
        <div className="chat-actions">
          <button
            className="chat-btn ghost"
            onClick={() => service?.connect?.()}
            title="Reconnect"
          >
            ↻
          </button>
          <button
            className="chat-btn ghost"
            onClick={() => service?.disconnect?.()}
            title="Disconnect"
          >
            ⨯
          </button>
        </div>
      </div>

      {error && (
        <div className="chat-banner">
          {error}
        </div>
      )}

      <div className="chat-list" ref={listRef} role="log" aria-live="polite">
        {messages.map((m) => (
          <div key={m.id} className={`chat-msg ${m.role}`}>
            <div className="chat-avatar">{m.role === "user" ? "🧑" : "🤖"}</div>
            <div className="chat-bubble">
              {m.content}
            </div>
          </div>
        ))}
        {messages.length === 0 && (
          <div className="chat-empty">
            Ask for meal ideas, substitutions, or step-by-step cooking help.
          </div>
        )}
      </div>

      <div className="chat-prefills">
        <button className="chat-chip" onClick={() => prefillAndSend("Suggest a 3-day vegetarian meal plan.")}>Vegetarian plan</button>
        <button className="chat-chip" onClick={() => prefillAndSend("What can I make with chicken, rice, and broccoli?")}>What to cook</button>
        <button className="chat-chip" onClick={() => prefillAndSend("How do I properly sear a steak?")}>Cooking tip</button>
      </div>

      <div className="chat-input-row">
        <input
          className="chat-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          aria-label="Type your message"
        />
        <button className="chat-send" onClick={send} disabled={isSending || !input.trim()}>
          Send
        </button>
      </div>
    </div>
  );
}
