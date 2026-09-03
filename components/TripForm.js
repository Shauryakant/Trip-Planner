import React, { useState } from 'react';
import styles from '@/styles/TripForm.module.css';

const SAMPLE_PRESETS = [
  {
    label: '🇯🇵 4 Days in Tokyo',
    prompt: '4 days in Tokyo focusing on authentic ramen spots, electronics in Akihabara, historic shrines in Asakusa, and nightlife in Shinjuku',
  },
  {
    label: '🇫🇷 3 Days in Paris',
    prompt: '3 days in Paris exploring bakery breakfasts, art museums like the Louvre and Musée d\'Orsay, Eiffel Tower views, and walking along the Seine',
  },
  {
    label: '🏝️ 5 Days in Bali',
    prompt: '5 days in Bali featuring beach resort lodging, morning surf lessons, waterfall hikes in Ubud, local warung dining, and temple visits',
  },
  {
    label: '🏙️ 2 Days in NYC',
    prompt: '2 days in NYC: Broadway show, Central Park walk, pizza spots in Brooklyn, and Statue of Liberty',
  },
];

export default function TripForm({ onSubmit, isLoading }) {
  const [description, setDescription] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!description.trim() || isLoading) return;
    onSubmit(description);
  };

  const handleSelectPreset = (promptText) => {
    if (isLoading) return;
    setDescription(promptText);
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

        <div className={styles.presetSection}>
          <span className={styles.presetLabel}>💡 Try a sample prompt:</span>
          <div className={styles.presetGrid}>
            {SAMPLE_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                className={styles.presetChip}
                onClick={() => handleSelectPreset(preset.prompt)}
                disabled={isLoading}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

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
