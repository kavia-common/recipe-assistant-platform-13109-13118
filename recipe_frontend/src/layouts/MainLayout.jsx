import React from 'react';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import Footer from '../components/common/Footer';

/**
 * PUBLIC_INTERFACE
 * MainLayout wraps the application with header, sidebar, footer, and a main content area.
 * Children are routed content provided by AppRouter.
 */
export default function MainLayout({ children }) {
  return (
    <div className="layout-root">
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
    </div>
  );
}
