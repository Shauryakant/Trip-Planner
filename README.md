# 🗺️ Trip Planner AI

An interactive, day-by-day travel itinerary builder built with Next.js (Pages Router, JavaScript), Groq AI native `json_schema` structured output, and pure CSS custom properties for dark mode and stop-type theming.

🌐 **Live Deployment**: [https://trip-planner-omega-ten.vercel.app/](https://trip-planner-omega-ten.vercel.app/)

---

## 🎥 Video Explanation

[Watch Recorded Video Demonstration & Code Walkthrough](your-video-link-here)

---

## 🚀 Setup Instructions

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
   *(Optional: You can also specify `GROQ_MODEL=openai/gpt-oss-120b` or another Groq model).*

4. **Start the Development Server**:
   ```bash
   npm start
   ```
   *Note: Per requirements, `npm start` executes `next dev`.*
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 💡 How It Works & Key Features

- **Free-Form Prompt Input**: Describe any trip (e.g., *"4 days in Tokyo focusing on ramen, Akihabara electronics, and historic shrines"*).
- **Early Input Guard**: Bypasses API invocation for empty or ultra-short (< 3 characters) descriptions.
- **Server-Side Groq `json_schema` Mode**: The API route (`pages/api/plan-trip.js`) calls Groq using native `json_schema` mode, constraining LLM generation to an exact JSON object shape and enum property types (`activity`, `food`, `transport`, `lodging`).
- **Model-Based Input Adequacy Signal**: The system prompt instructs the model to return `{ "trip_title": "", "days": [] }` if an input is insufficient or non-travel related. The server validator catches `isDaysEmpty` early and returns a friendly `insufficient_input` banner rather than fabricating generic trips.
- **Request Lifecycle State Machine**: Handles `idle | loading | success | error` with explicit error classifications (`insufficient_input`, `malformed`, `wrong_shape`, `empty`, `timeout`, `network`).
- **In-Flight Request Cancellation (`AbortController`)**: If a user submits a new prompt while a request is pending, the previous request is immediately aborted so stale responses can never overwrite newer data.
- **Interactive Day-by-Day Itinerary**:
  - **Horizontal Day Tabs**: Seamlessly switch between days with live stop count badges.
  - **Click-to-Expand Stop Cards**: Click anywhere on a stop card (title, badge, time) or the `ℹ️` button to toggle its detailed description.
  - **Stop Removal**: Delete stops instantly with the `✕` button.
  - **Accessible Stop Reordering**: Reorder stops within a day using `▲` and `▼` buttons. Reordering operates on stable stop UUIDs so expanded card states never scramble.
  - **Stop Type Visual Hierarchy**: Distinct color badges and icons for `activity` (🎯), `food` (🍽️), `transport` (🚗), and `lodging` (🏨).
- **Persistence & Dark Mode**:
  - Automatically saves itinerary state to `localStorage` key `trip_planner_itinerary`.
  - Dark mode toggle using `data-theme` attribute on `<html>` and CSS custom variables, with flash-of-unstyled-theme prevention.

---

## 🛡️ Architecture & Technical Decision Defense

### 1. Server-Side API Route (`pages/api/plan-trip.js`)
- **Security**: The `GROQ_API_KEY` is kept strictly server-side and is never exposed to the client bundle.
- **Single Model Configuration**: Invokes Groq once using `const MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-120b'` without complex cascade heuristics, making API execution linear and simple to defend.
- **Timeout Protection**: Implements a 25-second server timeout using `AbortController` to prevent hanging requests.

### 2. Native Groq `json_schema` Mode
- Unlike `json_object` mode (which only guarantees valid JSON syntax), `json_schema` mode constrains token sampling during generation.
- Enforces property types, required array structures, and enum restrictions (`['activity', 'food', 'transport', 'lodging']`) at the model output level.

### 3. Model Signal & Schema Validation (`lib/schema.js`)
- Instead of using brittle regex/word-list heuristics to classify user prompts, the model itself judges input adequacy via system prompt instructions (`{ "trip_title": "", "days": [] }`).
- `validate()` in `lib/schema.js` checks `isDaysEmpty` early to trigger an `insufficient_input` error, while serving as defense-in-depth sanitization for fallback UUIDs.

### 4. Client-Side AbortController Race-Condition Guard
- If a user rapidly clicks "Generate" or alters their prompt, in-flight HTTP requests are immediately aborted via `controller.abort()`.
- Abort errors are filtered in the catch block, preventing older slow API responses from overwriting newer user requests.

### 5. Local State Mutations vs. API Refetching
- All user edits (expanding descriptions, deleting stops, reordering stops) mutate local React state (`useState`).
- This avoids unnecessary API calls, saves token quota, and provides instant, zero-latency feedback.

### 6. Up/Down Reorder Buttons vs. Drag-and-Drop
- Up/Down buttons provide 100% keyboard and screen-reader accessibility, eliminate mobile touch-drag gesture conflicts, and guarantee robust performance across all device widths.

### 7. CSS Custom Properties for Theming
- Theming is controlled globally via `:root` and `[data-theme="dark"]` CSS custom variables. This eliminates component-level conditional class clutter and enables seamless theme transitions.

---

## 🤖 AI-Usage Note
I designed the JSON schema, error taxonomy, and validation rules up front, then used an agentic coding assistant to implement the API route, validator, and prompt template against that spec. Reviewing the generated code, I caught and fixed several real issues: a candidate-model list that included Groq models since deprecated, an over-engineered gibberish-detection heuristic that I replaced with a simpler approach (having the model itself signal insufficient input, validated through the existing schema pipeline), and a dead/unreachable validation branch left over from an earlier iteration. I wrote manual test cases for the validator (lib/schema.js) against hand-crafted payloads to confirm each error path actually fires correctly. Frontend scaffolding and CSS design tokens were also AI-assisted.

*All application logic, schema validation algorithms, state machine handlers, and component architectures were reviewed, verified, and refined manually.*

---

## 🔮 What I'd Do Next (Known Limitations)

- **Streaming Responses**: Implement Server-Sent Events (SSE) or ReadableStream to stream itinerary days progressively as they are generated.
- **Refinement Loop**: Add a follow-up prompt input to edit existing itineraries (e.g., *"Add more vegetarian food stops to Day 2"*).
- **Multi-Trip History**: Allow saving multiple trip itineraries into local storage session history.
- **Export & Share**: Export itineraries as downloadable PDF or calendar (`.ics`) files.

---

## ⏱️ Time Spent

- **Total Time**: ~3 hours
