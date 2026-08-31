import Groq from "groq-sdk";
import { buildGroqPromptMessages } from "@/lib/groqPrompt";
import { validate } from "@/lib/schema";

export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req, res) {
  // Only accept POST requests
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res
      .status(405)
      .json({ error: "wrong_shape", message: "Method Not Allowed" });
  }

  const { description } = req.body || {};

  // Minimal early guard: description must exist, be a string, and be at least 3 trimmed characters
  if (
    !description ||
    typeof description !== "string" ||
    description.trim().length < 3
  ) {
    return res.status(400).json({
      error: "empty",
      message: "Trip description cannot be empty or under 3 characters.",
    });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: "network",
      message: "GROQ_API_KEY is not configured on the server.",
    });
  }

  const groq = new Groq({ apiKey });

  // 25-second server side timeout controller
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 25000);

  const MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";

  try {
    const messages = buildGroqPromptMessages(description);

    const completion = await groq.chat.completions.create(
      {
        messages,
        model: MODEL,
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "trip_itinerary",
            schema: {
              type: "object",
              properties: {
                trip_title: { type: "string" },
                days: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      day_number: { type: "number" },
                      title: { type: "string" },
                      stops: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            id: { type: "string" },
                            type: {
                              type: "string",
                              enum: [
                                "activity",
                                "food",
                                "transport",
                                "lodging",
                              ],
                            },
                            name: { type: "string" },
                            time: { type: "string" },
                            description: { type: "string" },
                          },
                          required: [
                            "id",
                            "type",
                            "name",
                            "time",
                            "description",
                          ],
                          additionalProperties: false,
                        },
                      },
                    },
                    required: ["day_number", "title", "stops"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["trip_title", "days"],
              additionalProperties: false,
            },
          },
        },
        temperature: 0.7,
        max_tokens: 4000,
      },
      {
        signal: controller.signal,
      },
    );

    clearTimeout(timeoutId);

    const rawContent = completion.choices?.[0]?.message?.content;

    if (!rawContent || !rawContent.trim()) {
      return res.status(422).json({
        error: "empty",
        message: "Groq API returned an empty completion.",
      });
    }

    // Clean markdown code block wrappers if present
    let cleanContent = rawContent
      .trim()
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    // Parse JSON content
    let parsedJson;
    try {
      parsedJson = JSON.parse(cleanContent);
      if (typeof parsedJson === "string") {
        parsedJson = JSON.parse(parsedJson);
      }
    } catch (parseError) {
      return res.status(422).json({
        error: "malformed",
        message:
          "Something went wrong generating your itinerary. Please try again.",
      });
    }

    // Strict schema & business logic validation
    const validation = validate(parsedJson);

    if (!validation.valid) {
      return res.status(422).json({
        error: validation.reason || "wrong_shape",
        message: validation.error || "Parsed output failed schema validation.",
      });
    }

    return res.status(200).json({ trip: validation.data });
  } catch (error) {
    clearTimeout(timeoutId);

    if (error.name === "AbortError") {
      return res.status(504).json({
        error: "timeout",
        message: "Request timed out ",
      });
    }

    return res.status(error.status || 500).json({
      error: "network",
      message: error.message?.slice(0, 200) || "There was a network error",
    });
  }
}
