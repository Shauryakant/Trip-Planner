import React from 'react';
import styles from '@/styles/Navbar.module.css';

export default function Navbar({ theme, onToggleTheme }) {
  return (
    <header className={styles.navbar}>
      <div className={styles.brand}>
        <span className={styles.logoIcon}>🗺️</span>
        <div>
          <h1 className={styles.title}>TripPlanner AI</h1>
          <div className={styles.subtitle}>Structured Day-by-Day Travel Itineraries</div>
        </div>
      </div>
      <button
        className={styles.themeToggle}
        onClick={onToggleTheme}
        aria-label="Toggle dark mode"
      >
        {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
      </button>
    </header>
  );
}
