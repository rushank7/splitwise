import React from 'react';
import './LandingPage.css';

function LandingPage({ onGetStarted }) {
  return (
    <div className="landing-page">
      <div className="hero-section">
        <div className="emoji-container">
          <span className="emoji">💰</span>
          <span className="emoji">🤝</span>
          <span className="emoji">✨</span>
        </div>
        <h1>Split expenses with friends</h1>
        <p className="subtitle">Keep track of shared expenses and balances with housemates, trips, groups, friends, and family.</p>
        <button className="get-started-btn" onClick={onGetStarted}>
          Get Started →
        </button>
      </div>

      <div className="features-section">
        <div className="feature-card">
          <span className="feature-emoji">🏠</span>
          <h3>Shared Living</h3>
          <p>Split rent, utilities, and daily expenses with roommates</p>
        </div>
        <div className="feature-card">
          <span className="feature-emoji">✈️</span>
          <h3>Group Trips</h3>
          <p>Track vacation expenses and split costs fairly</p>
        </div>
        <div className="feature-card">
          <span className="feature-emoji">📊</span>
          <h3>Smart Splitting</h3>
          <p>Automatically calculate who owes what</p>
        </div>
      </div>
    </div>
  );
}

export default LandingPage; 