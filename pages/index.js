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
  const saveItineraryToStorage = (updatedItinerary) => {
    try {
      if (updatedItinerary) {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedItinerary));
      } else {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    } catch (e) {
      console.warn('Failed to save itinerary to localStorage:', e);
    }
  };

  // Toggle Theme Handler
  const handleToggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch (e) {
      console.warn('Failed to save theme to localStorage:', e);
    }
  };

  // Reset/Start New Trip Handler
  const handleNewTrip = () => {
    setItinerary(null);
    setStatus('idle');
    setErrorType(null);
    setErrorMessage('');
    setActiveDayIndex(0);
    setExpandedStops({});
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch (e) {}
  };

  // API Submission Handler with In-Flight Cancellation
  const handlePlanTrip = async (descriptionText) => {
    // 1. Cancel previous in-flight request if present
    if (activeAbortControllerRef.current) {
      activeAbortControllerRef.current.abort();
    }

    // 2. Instantiate new AbortController
    const controller = new AbortController();
    activeAbortControllerRef.current = controller;

    // 3. Update state machine to loading
    setStatus('loading');
    setErrorType(null);
    setErrorMessage('');
    setLastSubmittedPrompt(descriptionText);

    try {
      const res = await fetch('/api/plan-trip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description: descriptionText }),
        signal: controller.signal,
      });

      const json = await res.json();

      if (!res.ok) {
        throw {
          status: res.status,
          errorType: json.error || 'network',
          message: json.message || 'Failed to generate itinerary',
        };
      }

      // Success
      setItinerary(json.trip);
      saveItineraryToStorage(json.trip);
      setActiveDayIndex(0);
      setExpandedStops({});
      setStatus('success');
    } catch (err) {
      // Ignore AbortError caused by rapid user re-submission
      if (err.name === 'AbortError') {
        return;
      }

      const type = err.errorType || 'network';
      const msg = err.message || 'An unexpected error occurred. Please try again.';

      setErrorType(type);
      setErrorMessage(msg);
      setStatus('error');
    } finally {
      if (activeAbortControllerRef.current === controller) {
        activeAbortControllerRef.current = null;
      }
    }
  };

  // Retry handler using last prompt
  const handleRetry = () => {
    if (lastSubmittedPrompt) {
      handlePlanTrip(lastSubmittedPrompt);
    }
  };

  // Local State Mutation: Toggle expand stop description
  const handleToggleExpandStop = (stopId) => {
    setExpandedStops((prev) => ({
      ...prev,
      [stopId]: !prev[stopId],
    }));
  };

  // Local State Mutation: Remove stop
  const handleRemoveStop = (dayNumber, stopId) => {
    if (!itinerary) return;

    const updatedDays = itinerary.days.map((day) => {
      if (day.day_number === dayNumber) {
        return {
          ...day,
          stops: day.stops.filter((s) => s.id !== stopId),
        };
      }
      return day;
    });

    const updatedItinerary = {
      ...itinerary,
      days: updatedDays,
    };

    setItinerary(updatedItinerary);
    saveItineraryToStorage(updatedItinerary);
  };

  // Local State Mutation: Reorder stop (up or down)
  const handleReorderStop = (dayNumber, stopId, direction) => {
    if (!itinerary) return;

    const updatedDays = itinerary.days.map((day) => {
      if (day.day_number !== dayNumber) return day;

      const stops = [...day.stops];
      const index = stops.findIndex((s) => s.id === stopId);
      if (index === -1) return day;

      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= stops.length) return day;

      // Swap stops
      const temp = stops[index];
      stops[index] = stops[targetIndex];
      stops[targetIndex] = temp;

      return {
        ...day,
        stops,
      };
    });

    const updatedItinerary = {
      ...itinerary,
      days: updatedDays,
    };

    setItinerary(updatedItinerary);
    saveItineraryToStorage(updatedItinerary);
  };

  return (
    <>
      <Head>
        <title>TripPlanner AI | Plan Your Dream Journey</title>
        <meta name="description" content="AI-powered interactive day-by-day travel itinerary builder built with Next.js and Groq API" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div style={{ maxWidth: '840px', margin: '0 auto', padding: '0 1.25rem 4rem 1.25rem' }}>
        <Navbar
          theme={theme}
          onToggleTheme={handleToggleTheme}
        />

        <main>
          <TripForm
            onSubmit={handlePlanTrip}
            isLoading={status === 'loading'}
            hasExistingItinerary={Boolean(itinerary)}
            onNewTrip={handleNewTrip}
          />

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
