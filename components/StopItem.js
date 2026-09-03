import React from 'react';
import styles from '@/styles/StopItem.module.css';

const TYPE_CONFIG = {
  activity: { label: 'Activity', icon: '🎯', badgeClass: styles.typeActivity, accentColor: 'var(--type-activity-accent)' },
  food: { label: 'Food', icon: '🍽️', badgeClass: styles.typeFood, accentColor: 'var(--type-food-accent)' },
  transport: { label: 'Transport', icon: '🚗', badgeClass: styles.typeTransport, accentColor: 'var(--type-transport-accent)' },
  lodging: { label: 'Rest', icon: '🏨', badgeClass: styles.typeLodging, accentColor: 'var(--type-lodging-accent)' },
};

export default function StopItem({
  stop,
  indexNumber,
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
    badgeClass: styles.typeDefault,
    accentColor: 'var(--type-default-accent)',
  };

  const hasDescription = Boolean(stop.description && stop.description.trim());
  const flowDelay = `${(indexNumber - 1) * 0.07}s`;

  return (
    <div
      className={styles.stopTimelineWrapper}
      style={{
        '--flow-delay': flowDelay,
        '--type-accent': config.accentColor,
      }}
    >
      {/* Left Time Column with Connected Timeline Node & Flow Line */}
      <div className={styles.timelineColumn}>
        <span className={styles.timeText}>{stop.time || 'Flexible'}</span>
        <div className={styles.timelineDotNode} />
        <div className={styles.timelineFlowLine} />
      </div>

      {/* Main Stop Card */}
      <div className={styles.stopCard}>
        <div className={styles.cardHeader}>
          <span className={`${styles.typeBadge} ${config.badgeClass}`}>
            <span>{config.icon}</span>
            <span>{config.label}</span>
          </span>
          <span className={styles.stopIndexTag}>Stop {indexNumber}</span>
        </div>

        <h4 className={styles.stopName}>{stop.name}</h4>

        {isExpanded && hasDescription && (
          <p className={styles.stopDescription}>{stop.description}</p>
        )}

        {/* Action Controls Bar */}
        <div className={styles.actionsGroup}>
          <button
            className={styles.iconBtn}
            onClick={() => onMoveUp(stop.id)}
            disabled={isFirst}
            title="Move stop earlier"
          >
            ▲ Move Up
          </button>
          <button
            className={styles.iconBtn}
            onClick={() => onMoveDown(stop.id)}
            disabled={isLast}
            title="Move stop later"
          >
            ▼ Move Down
          </button>
          {hasDescription && (
            <button
              className={`${styles.iconBtn} ${isExpanded ? styles.activeInfoBtn : ''}`}
              onClick={() => onToggleExpand(stop.id)}
              title={isExpanded ? 'Hide details' : 'View details'}
            >
              {isExpanded ? 'ℹ️ Hide Details' : 'ℹ️ View Details'}
            </button>
          )}
          <button
            className={`${styles.iconBtn} ${styles.removeBtn}`}
            onClick={() => onRemove(stop.id)}
            title="Remove stop"
          >
            ✕ Remove
          </button>
        </div>
      </div>
    </div>
  );
}
