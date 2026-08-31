import React from 'react';
import styles from '@/styles/StopItem.module.css';

const TYPE_CONFIG = {
  activity: { label: 'Activity', icon: '🎯', className: styles.typeActivity },
  food: { label: 'Food', icon: '🍽️', className: styles.typeFood },
  transport: { label: 'Transport', icon: '🚗', className: styles.typeTransport },
  lodging: { label: 'Lodging', icon: '🏨', className: styles.typeLodging },
};

export default function StopItem({
  stop,
  isFirst,
  isLast,
  isExpanded,
  onToggleExpand,
  onRemove,
  onMoveUp,
  onMoveDown,
}) {
  const typeKey = (stop.type || 'activity').toLowerCase();
  const config = TYPE_CONFIG[typeKey] || {
    label: stop.type || 'Stop',
    icon: '📍',
    className: styles.typeDefault,
  };

  const hasDescription = Boolean(stop.description && stop.description.trim());

  const handleCardClick = (e) => {
    // Prevent toggle when clicking action buttons
    if (e.target.closest('button')) return;
    if (hasDescription) {
      onToggleExpand(stop.id);
    }
  };

  return (
    <div
      className={`${styles.stopCard} ${hasDescription ? styles.clickableCard : ''}`}
      onClick={handleCardClick}
    >
      <div className={styles.stopHeader}>
        <div className={styles.leftGroup}>
          <span className={`${styles.typeBadge} ${config.className}`}>
            <span>{config.icon}</span>
            <span>{config.label}</span>
          </span>
          <div className={styles.stopMeta}>
            <h4 className={styles.stopName}>
              {stop.name}
            </h4>
            <span className={styles.stopTime}>⏰ {stop.time}</span>
          </div>
        </div>

        <div className={styles.actionsGroup}>
          <button
            className={styles.iconBtn}
            onClick={() => onMoveUp(stop.id)}
            disabled={isFirst}
            title="Move stop up"
            aria-label="Move stop up"
          >
            ▲
          </button>
          <button
            className={styles.iconBtn}
            onClick={() => onMoveDown(stop.id)}
            disabled={isLast}
            title="Move stop down"
            aria-label="Move stop down"
          >
            ▼
          </button>
          {hasDescription && (
            <button
              className={`${styles.iconBtn} ${isExpanded ? styles.activeInfoBtn : ''}`}
              onClick={() => onToggleExpand(stop.id)}
              title={isExpanded ? 'Hide description' : 'View description'}
              aria-label={isExpanded ? 'Hide description' : 'View description'}
            >
              ℹ️
            </button>
          )}
          <button
            className={`${styles.iconBtn} ${styles.removeBtn}`}
            onClick={() => onRemove(stop.id)}
            title="Remove stop"
            aria-label="Remove stop"
          >
            ✕
          </button>
        </div>
      </div>

      {isExpanded && hasDescription && (
        <div className={styles.descriptionContainer}>
          {stop.description}
        </div>
      )}
    </div>
  );
}
