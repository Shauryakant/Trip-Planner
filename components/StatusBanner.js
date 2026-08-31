import React from 'react';
import styles from '@/styles/StatusBanner.module.css';

const ERROR_DETAILS = {
  malformed: {
    title: 'Malformed AI Output',
    defaultMsg: 'The AI model returned unparseable JSON text. Click retry to regenerate.',
    icon: '⚠️',
  },
  wrong_shape: {
    title: 'Invalid Itinerary Structure',
    defaultMsg: 'The response was missing required fields like days or stops. Click retry to try again.',
    icon: '🚫',
  },
  empty: {
    title: 'Empty AI Response',
    defaultMsg: 'The AI returned an empty response. Please check your prompt and try again.',
    icon: '📭',
  },
  timeout: {
    title: 'Request Timed Out',
    defaultMsg: 'The request took too long (over 25s) to complete. Please try again.',
    icon: '⏱️',
  },
  network: {
    title: 'Network / API Error',
    defaultMsg: 'Could not connect to the server or Groq API key is missing/invalid.',
    icon: '🔌',
  },
};

export default function StatusBanner({ errorType, errorMessage, onRetry }) {
  if (!errorType) return null;

  const errorInfo = ERROR_DETAILS[errorType] || {
    title: 'An Error Occurred',
    defaultMsg: errorMessage || 'Something went wrong while planning your trip.',
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
