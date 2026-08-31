import Groq from 'groq-sdk';
import { buildGroqPromptMessages } from '@/lib/groqPrompt';
import { validate } from '@/lib/schema';

export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req, res) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'wrong_shape', message: 'Method Not Allowed' });
  }

  const { description } = req.body || {};

  // Validate description parameter
  if (!description || typeof description !== 'string' || !description.trim()) {
    return res.status(400).json({ error: 'empty', message: 'Trip description cannot be empty.' });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'network',
      message: 'GROQ_API_KEY is not configured on the server.',
    });
  }

  const groq = new Groq({ apiKey });

  // 25-second server side timeout controller
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 25000);

  const modelToUse = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';

  try {
    const messages = buildGroqPromptMessages(description);

    let completion;
    try {
      completion = await groq.chat.completions.create(
        {
          messages,
          model: modelToUse,
          response_format: { type: 'json_object' },
          temperature: 0.7,
          max_tokens: 4000,
        },
        {
          signal: controller.signal,
        }
      );
    } catch (primaryErr) {
      // If primary model is not found, attempt fallback to llama-3.1-8b-instant or llama3-8b-8192
      if (primaryErr?.status === 404 || primaryErr?.error?.code === 'model_not_found') {
        const fallbackModel = modelToUse === 'llama-3.1-8b-instant' ? 'llama3-8b-8192' : 'llama-3.1-8b-instant';
        completion = await groq.chat.completions.create(
          {
            messages,
            model: fallbackModel,
            response_format: { type: 'json_object' },
            temperature: 0.7,
            max_tokens: 4000,
          },
          {
            signal: controller.signal,
          }
        );
      } else {
        throw primaryErr;
      }
    }

    clearTimeout(timeoutId);

    const rawContent = completion.choices?.[0]?.message?.content;

    if (!rawContent || !rawContent.trim()) {
      return res.status(422).json({
        error: 'empty',
        message: 'Groq API returned an empty completion.',
      });
    }

    // Try parsing raw JSON content
    let parsedJson;
    try {
      parsedJson = JSON.parse(rawContent);
    } catch (parseError) {
      return res.status(422).json({
        error: 'malformed',
        message: 'Groq API returned malformed JSON that could not be parsed.',
      });
    }

    // Strict schema validation
    const validation = validate(parsedJson);

    if (!validation.valid) {
      return res.status(422).json({
        error: validation.reason || 'wrong_shape',
        message: validation.error || 'Parsed output failed schema validation.',
      });
    }

    // Return successfully validated trip itinerary data
    return res.status(200).json({ trip: validation.data });

  } catch (error) {
    clearTimeout(timeoutId);

    if (error.name === 'AbortError') {
      return res.status(504).json({
        error: 'timeout',
        message: 'Request to Groq API timed out after 25 seconds.',
      });
    }

    // Handle generic Groq / network failure
    return res.status(500).json({
      error: 'network',
      message: error.message || 'An error occurred while calling the Groq API.',
    });
  }
}
