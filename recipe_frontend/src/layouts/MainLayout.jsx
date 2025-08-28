import React, { useMemo, useState } from 'react';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import Footer from '../components/common/Footer';
import ChatWidget from '../components/chat/ChatWidget';
import { createChatService } from '../services/chatService';
import { useLocation, Link } from 'react-router-dom';
import '../styles/chat.css';

/**
 * PUBLIC_INTERFACE
 * MainLayout wraps the application with header, sidebar, footer, and a main content area.
 * Children are routed content provided by AppRouter.
 *
 * Also provides a dockable/floating chat widget visible on all pages except the dedicated /chat page.
 * The floating widget uses a compact mode with a toggle button at bottom-right.
 */
export default function MainLayout({ children }) {
  const location = useLocation();
  const onChatPage = location.pathname === '/chat';

  // Single ChatService instance shared by floating widget to preserve context across pages
  const chatService = useMemo(() => createChatService('/ws/chat'), []);
  const [dockOpen, setDockOpen] = useState(false);

  return (
    <div className="layout-root" style={{ position: 'relative' }}>
      <Header />
      <div className="layout-body">
        <aside className="layout-sidebar">
          <Sidebar />
        </aside>
        <main className="layout-content" role="main">
          {children}
        </main>
      </div>
      <Footer />

      {/* Floating chat dock (hidden on /chat to avoid duplication) */}
      {!onChatPage && (
        <>
          {!dockOpen && (
            <button
              aria-label="Open chat"
              className="chat-fab"
              onClick={() => setDockOpen(true)}
              title="Chat with AI"
              style={fabStyle}
            >
              💬
            </button>
          )}
          {dockOpen && (
            <div style={dockStyle} aria-label="Chat dock" role="complementary">
              <div style={dockHeaderStyle}>
                <div style={{ fontWeight: 700 }}>Chat</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Link to="/chat" className="chat-btn ghost" title="Open full page" style={ghostBtnStyle}>
                    ⤢
                  </Link>
                  <button
                    className="chat-btn ghost"
                    onClick={() => setDockOpen(false)}
                    title="Close"
                    style={ghostBtnStyle}
                  >
                    ⨯
                  </button>
                </div>
              </div>
              <div style={{ padding: 10 }}>
                <ChatWidget service={chatService} compact />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Inline styles for the floating dock; kept local to avoid global CSS changes
const fabStyle = {
  position: 'fixed',
  right: 20,
  bottom: 20,
  width: 56,
  height: 56,
  borderRadius: 999,
  display: 'grid',
  placeItems: 'center',
  boxShadow: '0 10px 24px rgba(0,0,0,0.15)',
  zIndex: 50,
};

const dockStyle = {
  position: 'fixed',
  right: 16,
  bottom: 16,
  width: 360,
  maxWidth: 'calc(100vw - 32px)',
  background: '#fff',
  border: '1px solid var(--border)',
  borderRadius: 14,
  boxShadow: 'var(--shadow)',
  zIndex: 60,
  overflow: 'hidden',
};

const dockHeaderStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '10px 12px',
  borderBottom: '1px solid var(--border)',
  background: '#f9fafb',
};

const ghostBtnStyle = {
  background: 'transparent',
  color: '#374151',
  border: '1px solid #d1d5db',
  boxShadow: 'none',
  padding: '6px 10px',
  borderRadius: 8,
};
