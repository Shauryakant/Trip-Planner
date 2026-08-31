import React, { useState } from 'react';
import styles from '@/styles/TripForm.module.css';

export default function TripForm({ onSubmit, isLoading }) {
  const [description, setDescription] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!description.trim() || isLoading) return;
    onSubmit(description);
  };

  return (
    <div className={styles.formContainer}>
      <form onSubmit={handleSubmit} className={styles.formGroup}>
        <label htmlFor="trip-description" className={styles.label}>
          <span>✈️</span> Where would you like to travel?
        </label>
        <textarea
          id="trip-description"
          className={styles.textarea}
          placeholder="Describe your ideal trip (e.g. 4 days in Tokyo focusing on ramen, electronics in Akihabara, historic shrines, and nightlife in Shinjuku)..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isLoading}
          rows={4}
        />
        <div className={styles.actionsRow}>
          <span className={styles.helperText}>
            Provide destinations, duration, interests, or style of travel.
          </span>
          <button
            type="submit"
            className={styles.submitBtn}
            disabled={isLoading || !description.trim()}
          >
            {isLoading ? (
              <>
                <span className={styles.spinner} />
                Building Itinerary...
              </>
            ) : (
              <>
                Generate Itinerary ✨
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
