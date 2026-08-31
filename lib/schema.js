/**
 * Generates a unique UUID v4 compatible string.
 */
export function generateUUID() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'idx-' + Math.random().toString(36).substring(2, 9) + '-' + Date.now().toString(36);
}

/**
 * Validates and sanitizes raw JSON returned from Groq model.
 * 
 * Expected shape:
 * {
 *   "trip_title": string,
 *   "days": [
 *     {
 *       "day_number": number,
 *       "title": string,
 *       "stops": [
 *         {
 *           "id": string (uuid),
 *           "type": "activity" | "food" | "transport" | "lodging",
 *           "name": string,
 *           "time": string,
 *           "description": string
 *         }
 *       ]
 *     }
 *   ]
 * }
 * 
 * @param {any} data - Raw parsed JSON data
 * @returns {{ valid: boolean, reason?: "empty" | "malformed" | "wrong_shape", error?: string, data?: object }}
 */
export function validate(data) {
  if (data === null || data === undefined) {
    return { valid: false, reason: 'empty', error: 'Response data is empty' };
  }

  if (typeof data !== 'object' || Array.isArray(data)) {
    return { valid: false, reason: 'malformed', error: 'Response root must be a JSON object' };
  }

  // Validate trip_title
  const trip_title = typeof data.trip_title === 'string' && data.trip_title.trim()
    ? data.trip_title.trim()
    : 'Custom Trip Itinerary';

  // Validate days array
  if (!Array.isArray(data.days) || data.days.length === 0) {
    return { valid: false, reason: 'wrong_shape', error: "Field 'days' must be a non-empty array" };
  }

  const validTypes = new Set(['activity', 'food', 'transport', 'lodging']);
  const sanitizedDays = [];

  for (let dIdx = 0; dIdx < data.days.length; dIdx++) {
    const day = data.days[dIdx];
    if (!day || typeof day !== 'object') {
      return { valid: false, reason: 'wrong_shape', error: `Day at index ${dIdx} is invalid` };
    }

    const day_number = typeof day.day_number === 'number' ? day.day_number : dIdx + 1;
    const title = typeof day.title === 'string' && day.title.trim()
      ? day.title.trim()
      : `Day ${day_number}`;

    if (!Array.isArray(day.stops)) {
      return { valid: false, reason: 'wrong_shape', error: `Stops in Day ${day_number} must be an array` };
    }

    const sanitizedStops = [];

    for (let sIdx = 0; sIdx < day.stops.length; sIdx++) {
      const stop = day.stops[sIdx];
      if (!stop || typeof stop !== 'object') {
        return { valid: false, reason: 'wrong_shape', error: `Stop at index ${sIdx} in Day ${day_number} is invalid` };
      }

      const name = typeof stop.name === 'string' ? stop.name.trim() : '';
      if (!name) {
        return { valid: false, reason: 'wrong_shape', error: `Stop at index ${sIdx} in Day ${day_number} is missing a name` };
      }

      // Ensure stable id
      const id = typeof stop.id === 'string' && stop.id.trim()
        ? stop.id.trim()
        : generateUUID();

      // Normalize stop type
      let rawType = typeof stop.type === 'string' ? stop.type.toLowerCase().trim() : 'activity';
      const type = validTypes.has(rawType) ? rawType : 'activity';

      const time = typeof stop.time === 'string' && stop.time.trim() ? stop.time.trim() : 'Flexible Time';
      const description = typeof stop.description === 'string' ? stop.description.trim() : '';

      sanitizedStops.push({
        id,
        type,
        name,
        time,
        description,
      });
    }

    sanitizedDays.push({
      day_number,
      title,
      stops: sanitizedStops,
    });
  }

  return {
    valid: true,
    data: {
      trip_title,
      days: sanitizedDays,
    },
  };
}
