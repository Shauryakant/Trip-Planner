import React from 'react';
import DayCard from './DayCard';
import styles from '@/styles/Itinerary.module.css';

export default function Itinerary({
  trip,
  activeDayIndex,
  onSelectDay,
  expandedStops,
  onToggleExpand,
  onRemoveStop,
  onReorderStop,
}) {
  if (!trip || !Array.isArray(trip.days) || trip.days.length === 0) {
    return null;
  }

  const days = trip.days;
  const currentDay = days[activeDayIndex] || days[0];

  const totalStops = days.reduce((sum, d) => sum + (d.stops ? d.stops.length : 0), 0);

  return (
    <div className={styles.container}>
      <div className={styles.headerCard}>
        <div>
          <h2 className={styles.tripTitle}>{trip.trip_title}</h2>
        </div>
        <div className={styles.tripStats}>
          <span className={styles.statBadge}>
            📅 {days.length} {days.length === 1 ? 'Day' : 'Days'}
          </span>
          <span className={styles.statBadge}>
            📍 {totalStops} Total Stops
          </span>
        </div>
      </div>

      {/* Horizontal Day Tabs */}
      <div className={styles.tabsContainer} role="tablist">
        {days.map((day, idx) => {
          const isActive = idx === activeDayIndex;
          const stopCount = day.stops ? day.stops.length : 0;
          return (
            <button
              key={day.day_number || idx}
              role="tab"
              aria-selected={isActive}
              className={`${styles.tabBtn} ${isActive ? styles.activeTab : ''}`}
              onClick={() => onSelectDay(idx)}
            >
              <span>Day {day.day_number || idx + 1}</span>
              <span className={styles.tabStopBadge}>{stopCount}</span>
            </button>
          );
        })}
      </div>

      {/* Active Day Content */}
      <DayCard
        day={currentDay}
        expandedStops={expandedStops}
        onToggleExpand={onToggleExpand}
        onRemoveStop={onRemoveStop}
        onReorderStop={onReorderStop}
      />
    </div>
  );
}
