import React from 'react';
import styles from '@/styles/Navbar.module.css';

export default function Navbar({ theme, onToggleTheme }) {
  return (
    <header className={styles.navbar}>
      <div className={styles.topRow}>
        <div className={styles.brandLogo}>
          <span>✈️</span> TripPlanner<span className={styles.logoBadge}>AI</span>
        </div>
        <div className={styles.controlsGroup}>
          <button
            className={styles.themeToggle}
            onClick={onToggleTheme}
            aria-label="Toggle dark mode"
          >
            {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>
      </div>

      <h1 className={styles.title}>Plan your dream journey</h1>
      <p className={styles.subtitle}>
        Turn any travel request into a structured day-by-day itinerary you can customize, trim, and reorder.
      </p>
    </header>
  );
}
