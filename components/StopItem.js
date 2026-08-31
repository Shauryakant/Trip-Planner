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

  return (
    <div className={styles.stopCard}>
      <div className={styles.stopHeader}>
        <div className={styles.leftGroup}>
          <span className={`${styles.typeBadge} ${config.className}`}>
            <span>{config.icon}</span>
            <span>{config.label}</span>
          </span>
          <div className={styles.stopMeta}>
            <h4 className={styles.stopName}>{stop.name}</h4>
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
          {stop.description && (
            <button
              className={styles.iconBtn}
              onClick={() => onToggleExpand(stop.id)}
              title={isExpanded ? 'Collapse details' : 'Expand details'}
              aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
            >
              {isExpanded ? '▲' : 'ℹ️'}
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

      {isExpanded && stop.description && (
        <div className={styles.descriptionContainer}>
          {stop.description}
        </div>
      )}
    </div>
  );
}
