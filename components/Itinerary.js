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

  // Calculate statistics across all days
  let totalStops = 0;
  const categoryCounts = { food: 0, activity: 0, transport: 0, lodging: 0 };

  days.forEach((day) => {
    if (Array.isArray(day.stops)) {
      totalStops += day.stops.length;
      day.stops.forEach((stop) => {
        const type = (stop.type || 'activity').toLowerCase();
        if (categoryCounts[type] !== undefined) {
          categoryCounts[type]++;
        } else {
          categoryCounts.activity++;
        }
      });
    }
  });

  return (
    <div className={styles.container}>
      {/* Dashboard Header Card */}
      <div className={styles.dashboardCard}>
        <div className={styles.dashboardHeader}>
          <div>
            <div className={styles.dashboardTag}>VOYAGE OVERVIEW</div>
            <h2 className={styles.tripTitle}>{trip.trip_title}</h2>
          </div>
        </div>

        {/* Dashboard Quick Stats Row */}
        <div className={styles.dashboardStatsRow}>
          <span className={`${styles.statPill} ${styles.highlightPill}`}>
            📅 {days.length} {days.length === 1 ? 'Day' : 'Days'}
          </span>
          <span className={`${styles.statPill} ${styles.highlightPill}`}>
            📍 {totalStops} Total Stops
          </span>
          {categoryCounts.food > 0 && (
            <span className={styles.statPill}>🍽️ {categoryCounts.food} Food</span>
          )}
          {categoryCounts.activity > 0 && (
            <span className={styles.statPill}>🎯 {categoryCounts.activity} Activities</span>
          )}
          {categoryCounts.transport > 0 && (
            <span className={styles.statPill}>🚗 {categoryCounts.transport} Transport</span>
          )}
          {categoryCounts.lodging > 0 && (
            <span className={styles.statPill}>🏨 {categoryCounts.lodging} Rest</span>
          )}
        </div>
      </div>

      {/* Horizontal Day Tabs */}
      <div className={styles.tabsContainer} role="tablist">
        {days.map((day, idx) => {
          const isActive = idx === activeDayIndex;
          const dayNum = day.day_number || idx + 1;
          const dayTitle = day.title || `Day ${dayNum}`;

          return (
            <button
              key={day.day_number || idx}
              role="tab"
              aria-selected={isActive}
              className={`${styles.tabBtn} ${isActive ? styles.activeTab : ''}`}
              onClick={() => onSelectDay(idx)}
            >
              <span className={styles.tabDayNumber}>DAY {dayNum}</span>
              <span className={styles.tabDayTitle}>{dayTitle.replace(/^Day\s*\d+[:\s-]*/i, '')}</span>
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
