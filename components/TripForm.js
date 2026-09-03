import React, { useState } from 'react';
import styles from '@/styles/TripForm.module.css';

const SAMPLE_PRESETS = [
  {
    label: '🇮🇹 3 Days in Rome',
    prompt: '3 days in Rome exploring Colosseum history, authentic pasta in Trastevere, Vatican museums, and gelaterias',
  },
  {
    label: '🇯🇵 4 Days in Kyoto',
    prompt: '4 days in Kyoto focusing on Fushimi Inari shrine, bamboo groves in Arashiyama, matcha tea houses, and traditional ryokan lodging',
  },
  {
    label: '🇬🇷 5 Days in Santorini',
    prompt: '5 days in Santorini featuring Oia sunset views, red beach relaxation, local winery tours, and coastal seafood dining',
  },
  {
    label: '🇨🇭 4 Days in Swiss Alps',
    prompt: '4 days in Swiss Alps exploring scenic train routes, mountain hiking, fondue dining, and alpine village lodging',
  },
];

export default function TripForm({ onSubmit, isLoading, hasExistingItinerary, onNewTrip }) {
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

  const handleReset = () => {
    setDescription('');
    if (onNewTrip) onNewTrip();
  };

  return (
    <div className={styles.formContainer}>
      <form onSubmit={handleSubmit} className={styles.formGroup}>
        <label htmlFor="trip-description" className={styles.label}>
          {hasExistingItinerary ? 'Plan another trip or modify prompt' : 'Where would you like to travel?'}
        </label>
        <textarea
          id="trip-description"
          className={styles.textarea}
          placeholder="Describe your ideal trip (e.g. 4 days in Kyoto focusing on shrines, bamboo groves, matcha tea, and traditional ryokans)..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isLoading}
          rows={3}
        />

        <div className={styles.presetSection}>
          <span className={styles.presetLabel}>💡 Try an inspiring sample prompt:</span>
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
            Specify duration, interests, or travel pace.
          </span>

          <div className={styles.buttonsGroup}>
            {hasExistingItinerary && (
              <button
                type="button"
                className={styles.resetBtn}
                onClick={handleReset}
                disabled={isLoading}
                title="Clear input and start a new trip"
              >
                + New trip
              </button>
            )}
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
                  ✦ Build my itinerary
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
