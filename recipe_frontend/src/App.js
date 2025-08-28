import React from 'react';
import './App.css';
import './styles/layout.css';
import AppRouter from './routes/AppRouter';
import MainLayout from './layouts/MainLayout';

// PUBLIC_INTERFACE
function App() {
  /** Root application that renders the MainLayout with routed content. */
  return (
    <div className="App">
      <MainLayout>
        <AppRouter />
      </MainLayout>
    </div>
  );
}

export default App;
