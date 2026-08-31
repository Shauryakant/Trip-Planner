import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Navbar from '@/components/Navbar';
import TripForm from '@/components/TripForm';
import StatusBanner from '@/components/StatusBanner';
import Itinerary from '@/components/Itinerary';
import EmptyState from '@/components/EmptyState';

const LOCAL_STORAGE_KEY = 'trip_planner_itinerary';
const THEME_STORAGE_KEY = 'trip_planner_theme';

export default function Home() {
  // Request lifecycle state machine: 'idle' | 'loading' | 'success' | 'error'
  const [status, setStatus] = useState('idle');
  const [errorType, setErrorType] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [lastSubmittedPrompt, setLastSubmittedPrompt] = useState('');

  // Local state for trip itinerary and active tab
  const [itinerary, setItinerary] = useState(null);
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [expandedStops, setExpandedStops] = useState({});

  // Dark mode theme state
  const [theme, setTheme] = useState('light');

  // AbortController reference for in-flight request cancellation
  const activeAbortControllerRef = useRef(null);

  // Rehydrate theme and saved itinerary on client mount
  useEffect(() => {
    // Theme rehydration
    try {
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme === 'dark' || savedTheme === 'light') {
        setTheme(savedTheme);
        document.documentElement.setAttribute('data-theme', savedTheme);
      } else {
        const currentAttr = document.documentElement.getAttribute('data-theme');
        if (currentAttr) setTheme(currentAttr);
      }
    } catch (e) {
      console.warn('Failed to read theme from localStorage:', e);
    }

    // Itinerary rehydration
    try {
      const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        if (parsed && Array.isArray(parsed.days) && parsed.days.length > 0) {
          setItinerary(parsed);
          setStatus('success');
        }
      }
    } catch (e) {
      console.warn('Failed to rehydrate itinerary from localStorage:', e);
    }
  }, []);

  // Sync itinerary changes to localStorage
  useEffect(() => {
    if (!itinerary) return;
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(itinerary));
    } catch (e) {
      console.warn('Failed to save itinerary to localStorage:', e);
    }
  }, [itinerary]);

  // Handle Theme Toggle
  const handleToggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch (e) {
      console.warn('Failed to save theme to localStorage:', e);
    }
  };

  // Main submission handler with AbortController pattern
  const handlePlanTrip = async (description) => {
    setLastSubmittedPrompt(description);

    // Abort previous in-flight request if user submits again
    if (activeAbortControllerRef.current) {
      activeAbortControllerRef.current.abort();
    }

    const controller = new AbortController();
    activeAbortControllerRef.current = controller;

    setStatus('loading');
    setErrorType(null);
    setErrorMessage('');

    try {
      const res = await fetch('/api/plan-trip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description }),
        signal: controller.signal,
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus('error');
        setErrorType(data.error || 'network');
        setErrorMessage(data.message || 'Failed to generate trip plan.');
        return;
      }

      if (data.trip) {
        setItinerary(data.trip);
        setActiveDayIndex(0);
        setStatus('success');
        // Auto-expand first stop of day 1 for immediate context
        if (data.trip.days?.[0]?.stops?.[0]?.id) {
          setExpandedStops({ [data.trip.days[0].stops[0].id]: true });
        }
      } else {
        setStatus('error');
        setErrorType('wrong_shape');
        setErrorMessage('Server returned success response without trip data.');
      }
    } catch (err) {
      // Ignore AbortError caused by rapid user submissions
      if (err.name === 'AbortError') {
        return;
      }
      setStatus('error');
      setErrorType('network');
      setErrorMessage(err.message || 'Network request failed.');
    } finally {
      if (activeAbortControllerRef.current === controller) {
        activeAbortControllerRef.current = null;
      }
    }
  };

  // Retry action for StatusBanner
  const handleRetry = () => {
    if (lastSubmittedPrompt) {
      handlePlanTrip(lastSubmittedPrompt);
    }
  };

  // Local state mutation: Toggle stop expanded state
  const handleToggleExpandStop = (stopId) => {
    setExpandedStops((prev) => ({
      ...prev,
      [stopId]: !prev[stopId],
    }));
  };

  // Local state mutation: Remove stop from a specific day
  const handleRemoveStop = (dayNumber, stopId) => {
    setItinerary((prev) => {
      if (!prev) return prev;
      const updatedDays = prev.days.map((day) => {
        if (day.day_number !== dayNumber) return day;
        return {
          ...day,
          stops: day.stops.filter((s) => s.id !== stopId),
        };
      });
      return { ...prev, days: updatedDays };
    });
  };

  // Local state mutation: Reorder stops within a day (Up/Down) using stable IDs
  const handleReorderStop = (dayNumber, stopId, direction) => {
    setItinerary((prev) => {
      if (!prev) return prev;
      const updatedDays = prev.days.map((day) => {
        if (day.day_number !== dayNumber) return day;

        const stops = [...day.stops];
        const index = stops.findIndex((s) => s.id === stopId);
        if (index === -1) return day;

        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= stops.length) return day;

        // Swap array positions
        const temp = stops[index];
        stops[index] = stops[targetIndex];
        stops[targetIndex] = temp;

        return { ...day, stops };
      });
      return { ...prev, days: updatedDays };
    });
  };

  return (
    <>
      <Head>
        <title>Trip Planner AI | Day-by-Day Travel Itineraries</title>
        <meta name="description" content="AI-powered interactive travel itinerary planner built with Next.js and Groq API" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div style={{ maxWidth: '840px', margin: '0 auto', padding: '0 1.25rem 4rem 1.25rem' }}>
        <Navbar theme={theme} onToggleTheme={handleToggleTheme} />

        <main>
          <TripForm onSubmit={handlePlanTrip} isLoading={status === 'loading'} />

          <StatusBanner
            errorType={errorType}
            errorMessage={errorMessage}
            onRetry={handleRetry}
          />

          {itinerary && (status === 'success' || status === 'loading') ? (
            <Itinerary
              trip={itinerary}
              activeDayIndex={activeDayIndex}
              onSelectDay={setActiveDayIndex}
              expandedStops={expandedStops}
              onToggleExpand={handleToggleExpandStop}
              onRemoveStop={handleRemoveStop}
              onReorderStop={handleReorderStop}
            />
          ) : (
            status === 'idle' && <EmptyState />
          )}
        </main>
      </div>
    </>
  );
}
