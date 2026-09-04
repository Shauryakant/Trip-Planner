# 🗺️ Trip Planner AI

An interactive, day-by-day travel itinerary builder built with Next.js (Pages Router, JavaScript), Groq AI native `json_schema` structured output, and pure CSS custom properties for dark mode and stop-type theming.

🌐 **Live Deployment**: [https://trip-planner-omega-ten.vercel.app/](https://trip-planner-omega-ten.vercel.app/)  
🐙 **GitHub Repository**: [https://github.com/Shauryakant/Trip-Planner](https://github.com/Shauryakant/Trip-Planner)

---

## 🎥 Video Explanation


<p align="center">
  <a href="https://youtu.be/XfXeIGaY-EA" target="_blank">
    <img
      src="https://img.youtube.com/vi/XfXeIGaY-EA/0.jpg"
      alt="Trip Planner AI Demo"
      width="700"
    />
  </a>
</p>


## 📖 Overview

**Trip Planner AI** turns a free-form travel request into a structured, interactive day-by-day itinerary. You describe where you want to go — destination, length, interests, pace — and the app sends that prompt to an LLM through a secure Next.js API route. The response is parsed as JSON, strictly validated against a custom runtime schema (`lib/schema.js`), and rendered as interactive UI components rather than a chat transcript.

The frontend lets you browse day tabs, click anywhere on stop cards to view descriptions, remove unwanted stops, and reorder stops locally using accessible controls. All user edits mutate local React state and never trigger unnecessary AI calls.

---

## ✨ Features

- **Free-Form Prompt Input**: Textarea input supporting any travel description, plus quick sample prompt presets (Rome, Kyoto, Santorini, Swiss Alps).
- **Inline Reset & New Trip**: Start fresh or reset your query directly inside the form card next to `✦ Build my itinerary`.
- **Minimal Early Guard**: Bypasses API invocation for empty or ultra-short (< 3 characters) descriptions.
- **Server-Side Groq `json_schema` Mode**: Calls Groq API using native `json_schema` mode to enforce JSON object shape and enum property types (`activity`, `food`, `transport`, `lodging`) at generation time.
- **Model-Based Input Adequacy Signal**: The system prompt instructs the model to return `{ "trip_title": "", "days": [] }` if an input is insufficient or non-travel related. The server validator catches `isDaysEmpty` early and returns a friendly `insufficient_input` banner rather than fabricating generic trips.
- **Request Lifecycle State Machine**: Handles `idle | loading | success | error` with explicit error classifications (`insufficient_input`, `malformed`, `wrong_shape`, `empty`, `timeout`, `network`).
- **In-Flight Request Cancellation (`AbortController`)**: If a user submits a new prompt while a request is pending, the previous request is immediately aborted so stale responses can never overwrite newer data.
- **Interactive Day-by-Day Itinerary**:
  - **Horizontal Day Tabs**: Switch between days with live stop count badges.
  - **Connected Vertical Timeline Flow**: Visual flow line and staggered slide-down entrance animations connecting stops in sequence.
  - **Click-to-Expand Stop Cards**: Click anywhere on a stop card (title, badge, time) or the `ℹ️` button to toggle detailed descriptions.
  - **Stop Removal**: Delete stops instantly with the `✕` button.
  - **Accessible Stop Reordering**: Reorder stops within a day using `▲ Move Up` and `▼ Move Down` buttons operating on stable UUIDs so expanded card states never scramble.
  - **Stop Type Visual Hierarchy**: Type-colored left border accents and badges for `activity` (🎯), `food` (🍽️), `transport` (🚗), and `lodging` (🏨).
- **Persistence & Dark Mode**:
  - Automatically saves itinerary state to `localStorage` key `trip_planner_itinerary`.
  - Dark mode toggle using `data-theme` attribute on `<html>` and CSS custom variables, with flash-of-unstyled-theme prevention script in `pages/_document.js`.
- **Mobile-Friendly**: Fully responsive down to mobile width (375px).

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (Pages Router, JavaScript — `pages/api/plan-trip.js`)
- **UI & State**: React Hooks (`useState`, `useReducer`, `useRef`, `useEffect`)
- **Styling**: Pure CSS with Custom Properties (variables) for design tokens & Dark Mode (no CSS framework)
- **AI Provider**: Groq API (`openai/gpt-oss-120b`, overridable via `GROQ_MODEL`)
- **Schema Validation**: Custom runtime schema validator in `lib/schema.js` with UUID auto-generation
- **Deployment**: Vercel Serverless Functions + Next.js static asset optimization

---

## 🏗️ Architecture

```
User Input → React Form → POST /api/plan-trip → Next.js Serverless API Route → Groq API (json_schema mode) → Markdown Fence Stripping + JSON Parsing → lib/schema.js Validation → React Local State → Interactive Itinerary UI
```

The `GROQ_API_KEY` lives exclusively in server-side environment variables (`GROQ_API_KEY`). The browser bundle never receives it. All AI requests proxy through `pages/api/plan-trip.js`, which validates model responses before sending clean data to the client.

---

## 🚀 Local Setup Instructions

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Shauryakant/Trip-Planner.git
   cd Trip-Planner
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env.local` file in the root directory:
   ```bash
   cp .env.local.example .env.local
   ```
   Add your Groq API key:
   ```env
   GROQ_API_KEY=gsk_your_groq_api_key_here
   ```
   *(Optional: Set `GROQ_MODEL=openai/gpt-oss-120b` or another Groq model).*

4. **Start the Development Server**:
   ```bash
   npm start
   ```
   *Note: Per assignment rules, `npm start` executes `next dev`.*
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛡️ Error Handling Taxonomy

| Error Code | Meaning / Trigger Condition | User Banner Copy |
| :--- | :--- | :--- |
| **`empty`** | Textarea is empty or under 3 characters. | *"Trip description cannot be empty or under 3 characters."* |
| **`insufficient_input`** | Prompt lacks destination/duration; model returned `{ "trip_title": "", "days": [] }`. | *"Please describe your trip with a bit more detail — a destination and how many days works well."* |
| **`wrong_shape`** | JSON structure missing required fields (`days`, `stops`). | *"The response was missing required fields. Please include details like a destination or duration."* |
| **`malformed`** | Model returned non-JSON text that failed `JSON.parse()`. | *"The AI model returned unparseable JSON text. Click try again to regenerate."* |
| **`timeout`** | Client/server request exceeded 25 seconds (`AbortController`). | *"The request took too long (over 25s) to complete. Please try again."* |
| **`network`** | Groq API unreachable, rate-limited, or `GROQ_API_KEY` missing. | *"Could not connect to the trip planning service. Please check your connection and GROQ_API_KEY in .env.local."* |

- **Stale Response Protection**: Each request uses an `AbortController`. Rapid new submissions abort in-flight requests so older responses can never overwrite newer state.
- **Preserved Itinerary**: If an existing itinerary is loaded and a subsequent request fails, the current itinerary stays visible while the error banner explains what went wrong.

---

## 🔧 Deployment Debugging Notes

During Vercel production deployment, the following issues were diagnosed and resolved:
1. **Missing `GROQ_API_KEY` on Production**: Verified and configured `GROQ_API_KEY` in Vercel environment settings for Production and Preview environments.
2. **Groq Model Migration**: Configured model selection to `openai/gpt-oss-120b` with overridable `GROQ_MODEL` environment variable support.
3. **Markdown Code-Fence Stripping**: Handled instances where LLMs wrap valid JSON in ` ```json ... ``` ` fences despite `json_schema` mode.
4. **Model Signal Adequacy**: Replaced fragile regex/word-list heuristics with clean prompt rules signaling empty days arrays (`{ "trip_title": "", "days": [] }`), caught early in `lib/schema.js`.

---

## 🤖 AI-Usage Disclosure

### Development Tools Used
- **Antigravity AI Agent** — Scaffolding, implementation of Next.js API route and schema validator, debugging, refactoring, and documentation formatting.
- **Groq API** — Product runtime AI provider generating structured JSON travel itineraries from user prompts.
- **Manual Development & Testing** — Reviewing generated code, writing manual validator test payloads, verifying local UI flows, testing AbortController cancellation, and styling dark mode.

### How AI Was Used in Phases
- **Phase 1: Foundation & Setup** — Scaffolded Next.js Pages Router in JavaScript with custom CSS variables and package scripts (`"start": "next dev"`).
- **Phase 2: Backend API & Schema** — Built `pages/api/plan-trip.js` with Groq `json_schema` mode, server-side `AbortController` 25s timeout, and `lib/schema.js` validation with fallback UUIDs.
- **Phase 3: Frontend & State Machine** — Created `pages/index.js` lifecycle state machine (`idle | loading | success | error`), `TripForm`, `StatusBanner`, and `EmptyState`.
- **Phase 4: Interactivity & UX** — Implemented horizontal Day Tabs, click-to-expand stop cards, stop removal (`✕`), accessible Up/Down reordering (`▲`/`▼`), and sample prompt preset chips.
- **Phase 5: Reliability & Polish** — Added `localStorage` persistence, anti-flash dark mode in `pages/_document.js`, clean error taxonomy, and responsive CSS tokens.
- **Phase 6: Deployment & Docs** — Verified production Vercel deployment, updated README documentation, and verified `npm run build`.

---

## ⏱️ Time Spent Breakdown

| Phase | Approx. Time | Work Completed |
| :--- | :--- | :--- |
| **Foundation & Setup** | ~20 min | Next.js Pages Router setup, CSS variables, `package.json` scripts |
| **Backend & Schema** | ~45 min | Groq `json_schema` integration, `lib/schema.js` validator, fallback UUIDs |
| **Frontend State Machine** | ~35 min | Lifecycle state machine, `TripForm`, `StatusBanner`, `EmptyState` |
| **Interactivity & UI** | ~40 min | Day tabs, click-to-expand card, remove, accessible reorder buttons |
| **Reliability & Performance** | ~30 min | `AbortController` cancellation, 25s timeout, `localStorage` sync |
| **Dark Mode & Styling** | ~25 min | Anti-flash theme script in `_document.js`, CSS design tokens |
| **README & Deployment** | ~25 min | Documentation, Vercel build verification, git commits |
| **Total** | **~3.5 hours** | **Complete feature delivery and production deployment** |

---

## 🔮 What I'd Do Next (Known Limitations)

- **Streaming Responses**: Implement Server-Sent Events (SSE) or ReadableStream to stream itinerary days progressively as they generate.
- **Refinement Loop**: Add follow-up prompts to edit existing itineraries (e.g., *"Make Day 2 more relaxed"*).
- **Multi-Trip Saved Sessions**: Allow saving multiple trip itineraries into local storage session history.
- **Export Options**: Export itineraries to downloadable PDF or calendar (`.ics`) files.
