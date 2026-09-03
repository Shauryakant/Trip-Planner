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

  const firstUpTime = stops.length > 0 && stops[0].time ? `first up at ${stops[0].time}` : null;

  return (
    <div className={styles.dayCard}>
      <div className={styles.header}>
        <div className={styles.headerLabel}>TODAY'S ROUTE</div>
        <div className={styles.titleRow}>
          <h3 className={styles.dayTitle}>{day.title}</h3>
        </div>
        <div className={styles.stopCountMeta}>
          {stops.length} {stops.length === 1 ? 'stop' : 'stops'} {firstUpTime ? `· ${firstUpTime}` : ''}
        </div>
      </div>

      {stops.length === 0 ? (
        <div className={styles.emptyDay}>
          No stops remaining for this day.
        </div>
      ) : (
        <div className={styles.stopsList}>
          {stops.map((stop, index) => (
            <StopItem
              key={stop.id}
              stop={stop}
              indexNumber={index + 1}
              isFirst={index === 0}
              isLast={index === stops.length - 1}
              isExpanded={Boolean(expandedStops[stop.id])}
              onToggleExpand={onToggleExpand}
              onRemove={(id) => onRemoveStop(day.day_number, id)}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
            />
          ))}
        </div>
      )}
    </div>
  );
}
