import React from 'react';
import styles from '@/styles/EmptyState.module.css';

export default function EmptyState() {
  return (
    <div className={styles.container}>
      <div className={styles.illustration}>🧳</div>
      <h2 className={styles.heading}>No Trip Planned Yet</h2>
      <p className={styles.text}>
        Enter a destination, duration, and travel preferences above to generate a custom structured day-by-day itinerary.
      </p>
      <div className={styles.featuresList}>
        <span className={styles.featureChip}>🎯 Interactive Stop Cards</span>
        <span className={styles.featureChip}>↕️ Easy Reordering</span>
        <span className={styles.featureChip}>❌ Customizable Stops</span>
        <span className={styles.featureChip}>🌙 Dark Mode Support</span>
      </div>
    </div>
  );
}
