import React from 'react';
import StopItem from './StopItem';
import styles from '@/styles/DayCard.module.css';

export default function DayCard({
  day,
  expandedStops,
  onToggleExpand,
  onRemoveStop,
  onReorderStop,
}) {
  const stops = day.stops || [];

  const handleMoveUp = (stopId) => {
    onReorderStop(day.day_number, stopId, 'up');
  };

  const handleMoveDown = (stopId) => {
    onReorderStop(day.day_number, stopId, 'down');
  };

  return (
    <div className={styles.dayCard}>
      <div className={styles.header}>
        <h3 className={styles.dayTitle}>{day.title}</h3>
        <span className={styles.stopCount}>
          {stops.length} {stops.length === 1 ? 'stop' : 'stops'}
        </span>
      </div>

      {stops.length === 0 ? (
        <div className={styles.emptyDay}>
          No stops remaining for this day.
        </div>
      ) : (
        stops.map((stop, index) => (
          <StopItem
            key={stop.id}
            stop={stop}
            isFirst={index === 0}
            isLast={index === stops.length - 1}
            isExpanded={Boolean(expandedStops[stop.id])}
            onToggleExpand={onToggleExpand}
            onRemove={(id) => onRemoveStop(day.day_number, id)}
            onMoveUp={handleMoveUp}
            onMoveDown={handleMoveDown}
          />
        ))
      )}
    </div>
  );
}
