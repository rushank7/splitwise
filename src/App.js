import React, { useState, useEffect } from 'react';
import './App.css';
import Groups from './components/Groups';
import Expenses from './components/Expenses';
import LandingPage from './components/LandingPage';
import Auth from './components/Auth/Auth';
import { api } from './services/api';

function App() {
  const [showApp, setShowApp] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is already authenticated
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      // TODO: Fetch user data
    }
  }, []);

  const handleAuthSuccess = (authData) => {
    setIsAuthenticated(true);
    setUser(authData.user);
    setShowApp(true);
  };

  const handleLogout = () => {
    api.logout();
    setIsAuthenticated(false);
    setUser(null);
    setShowApp(false);
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-content">
          <h1>ExpenseSplit</h1>
          {showApp && (
            <div className="header-actions">
              <span className="user-name">{user?.name}</span>
              <button 
                className="logout-btn"
                onClick={handleLogout}
              >
                Logout
              </button>
              <button 
                className="back-btn"
                onClick={() => setShowApp(false)}
              >
                ← Back to Home
              </button>
            </div>
          )}
        </div>
      </header>
      <main className="App-main">
        {showApp ? (
          isAuthenticated ? (
            <>
              <Groups />
              <Expenses />
            </>
          ) : (
            <Auth onAuthSuccess={handleAuthSuccess} />
          )
        ) : (
          <LandingPage onGetStarted={() => setShowApp(true)} />
        )}
      </main>
    </div>
  );
}

export default App;
