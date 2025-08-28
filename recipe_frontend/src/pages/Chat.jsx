/**
 * PUBLIC_INTERFACE
 * Standalone Chat page that uses ChatWidget and its own ChatService instance.
 * Renders full-width within the MainLayout content area.
 */
import React, { useMemo } from "react";
import ChatWidget from "../components/chat/ChatWidget";
import { createChatService } from "../services/chatService";

export default function Chat() {
  // Create a per-page ChatService instance
  const chatService = useMemo(() => createChatService(), []);

  return (
    <div className="page">
      <h1>Chat Assistant</h1>
      <p>Ask the AI for cooking help and meal planning.</p>
      <div style={{ marginTop: 12 }}>
        <ChatWidget service={chatService} />
      </div>
    </div>
  );
}
