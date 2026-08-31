# 🗺️ Trip Planner AI

An interactive, day-by-day travel itinerary builder built with Next.js (Pages Router, JavaScript), structured Groq AI output (`json_object` mode), and pure CSS custom properties for dark mode and stop-type theming.

---

## 🚀 Setup Instructions

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd trip-planner
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

4. **Start the Development Server**:
   ```bash
   npm start
   ```
   *Note: Per requirements, `npm start` executes `next dev`.*
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 💡 How It Works & Key Features

- **Free-Form Prompt Input**: Describe any trip (e.g., *"4 days in Tokyo focusing on ramen, Akihabara electronics, and historic shrines"*).
- **Server-Side AI Schema Validation**: The API route (`pages/api/plan-trip.js`) calls Groq (`llama-3.3-70b-versatile`) with `response_format: { type: "json_object" }`. It strictly validates the response using `lib/schema.js` before returning data to the client.
- **Request State Machine**: Handles `idle | loading | success | error` with explicit error classifications (`malformed`, `wrong_shape`, `empty`, `timeout`, `network`).
- **In-Flight Request Cancellation (`AbortController`)**: If a user submits a new prompt while a request is pending, the previous request is automatically aborted so stale responses can never overwrite newer data.
- **Interactive Day-by-Day Itinerary**:
  - **Horizontal Day Tabs**: Seamlessly switch between days.
  - **Expandable Stops**: Toggle detailed descriptions for each stop.
  - **Stop Removal**: Remove stops with the `✕` button.
  - **Accessible Stop Reordering**: Reorder stops within a day using `▲` and `▼` buttons. Reordering relies on stable stop UUIDs so expanded card states never scramble.
  - **Stop Type Visual Hierarchy**: Distinct color badges and icons for `activity` (🎯), `food` (🍽️), `transport` (🚗), and `lodging` (🏨), with a fallback for unexpected types.
- **Persistence & Dark Mode**:
  - Automatically saves itinerary state to `localStorage`.
  - Dark mode toggle using `data-theme` attribute on `<html>` and CSS custom variables, with flash-of-unstyled-theme prevention.

---

## 🛡️ Architecture & Technical Decision Defense

### 1. Server-Side API Route (`pages/api/plan-trip.js`)
- **Security**: The `GROQ_API_KEY` is kept strictly server-side and is never exposed to the client bundle.
- **Server-Side Validation**: Relying solely on LLM output in the client can cause unexpected crashes. By validating the model output on the server with `lib/schema.js`, we ensure only sanitized, compliant data reaches the frontend.
- **Timeout Protection**: Implements a 25-second server timeout using `AbortController` to prevent hanging requests.

### 2. Schema Validation & UUID Normalization (`lib/schema.js`)
- Groq's `json_object` mode guarantees valid JSON syntax, but does **not** guarantee specific object keys or field types.
- The `validate()` function checks required array structures, normalizes stop types, and auto-generates stable v4 UUIDs for any stop missing an ID. This guarantees stable React `key` bindings and predictable reordering.

### 3. Client-Side AbortController Race-Condition Guard
- If a user rapidly clicks "Generate" or alters their prompt, in-flight HTTP requests are immediately aborted via `controller.abort()`.
- Abort errors are filtered in the catch block, preventing older slow API responses from overwriting newer user requests.

### 4. Local State Mutations vs. API Refetching
- All user edits (expanding descriptions, deleting stops, reordering stops) mutate local React state (`useState`).
- This avoids unnecessary API calls, saves token quota, and provides instant, zero-latency feedback.

### 5. Up/Down Reorder Buttons vs. Drag-and-Drop
- Up/Down buttons provide 100% keyboard and screen-reader accessibility, eliminate mobile touch-drag gesture conflicts, and guarantee robust performance across all device widths.

### 6. CSS Custom Properties for Theming
- Theming is controlled globally via `:root` and `[data-theme="dark"]` CSS custom variables. This eliminates component-level conditional class clutter and enables seamless theme transitions.

---

## 🤖 AI-Usage Note

AI tools were utilized during development for:
- Initial scaffolding of Next.js Pages Router boilerplate and package scripts.
- Crafting system prompt instructions for Groq's JSON mode (`lib/groqPrompt.js`).
- Generating initial CSS design tokens for light and dark color schemes.

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
