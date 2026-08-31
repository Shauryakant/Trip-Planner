import React from 'react';
import styles from '@/styles/StatusBanner.module.css';

const ERROR_DETAILS = {
  insufficient_input: {
    title: 'Need a Bit More Detail',
    defaultMsg: 'Please describe your trip with a bit more detail — a destination and how many days works well.',
    icon: '✏️',
  },
  malformed: {
    title: 'Malformed AI Output',
    defaultMsg: 'The AI model returned unparseable JSON text. Click try again to regenerate.',
    icon: '⚠️',
  },
  wrong_shape: {
    title: 'Invalid Itinerary Structure',
    defaultMsg: 'The response was missing required fields. Please include details like a destination or duration.',
    icon: '🚫',
  },
  empty: {
    title: 'Empty Input',
    defaultMsg: 'Trip description cannot be empty or under 3 characters.',
    icon: '📭',
  },
  timeout: {
    title: 'Request Timed Out',
    defaultMsg: 'The request took too long (over 25s) to complete. Please try again.',
    icon: '⏱️',
  },
  network: {
    title: 'Network / API Error',
    defaultMsg: 'Could not connect to the trip planning service. Please check your connection and GROQ_API_KEY in .env.local.',
    icon: '🔌',
  },
};

export default function StatusBanner({ errorType, errorMessage, onRetry }) {
  if (!errorType) return null;

  const errorInfo = ERROR_DETAILS[errorType] || {
    title: 'An Error Occurred',
    defaultMsg: 'Something went wrong while planning your trip. Please try again.',
    icon: '⚡',
  };

  return (
    <div className={styles.banner} role="alert">
      <div className={styles.content}>
        <span className={styles.icon}>{errorInfo.icon}</span>
        <div>
          <div className={styles.title}>{errorInfo.title}</div>
          <div className={styles.message}>
            {errorMessage || errorInfo.defaultMsg}
          </div>
        </div>
      </div>
      {onRetry && (
        <button className={styles.retryBtn} onClick={onRetry}>
          Try again 🔄
        </button>
      )}
    </div>
  );
}
