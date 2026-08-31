/**
 * Builds system and user messages for the Groq API call.
 * Instructs the model to output strict JSON matching the required schema.
 * 
 * @param {string} description - Free-form trip description entered by the user.
 * @returns {Array<{role: string, content: string}>}
 */
export function buildGroqPromptMessages(description) {
  const systemPrompt = `You are an expert travel planner assistant.
Your task is to take a user's trip description and convert it into a structured, day-by-day trip itinerary.

You MUST respond with a valid JSON object only. Do NOT include any markdown formatting (like \`\`\`json), no introductory text, and no commentary.

The JSON MUST conform exactly to this schema:
{
  "trip_title": "string (Short catchy title for the trip)",
  "days": [
    {
      "day_number": 1,
      "title": "string (e.g. Day 1: Exploring Historic Downtown)",
      "stops": [
        {
          "id": "string (unique UUID string for each stop, e.g. 550e8400-e29b-41d4-a716-446655440000)",
          "type": "activity" | "food" | "transport" | "lodging",
          "name": "string (Name of location, attraction, or stop)",
          "time": "string (e.g. 09:00 AM or Morning)",
          "description": "string (Engaging 1-2 sentence overview of what to do here)"
        }
      ]
    }
  ]
}

Rules:
1. "type" MUST be strictly one of: "activity", "food", "transport", or "lodging".
2. "days" MUST contain at least one day item.
3. Every stop MUST have a unique UUID string for "id".
4. Ensure times are formatted consistently (e.g., 09:00 AM, 01:30 PM, Evening).
5. Output ONLY the raw JSON object.`;

  const userPrompt = `Please create a structured travel itinerary for the following trip request:
"${description.trim()}"`;

  return [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];
}
