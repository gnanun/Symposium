// ============================================================
// Generates a unique, human-readable Registration ID.
// Format: SYM<edition_number>-<EVENTCODE>-<sequence>
// e.g.    SYM2-HACK-0001
// Uniqueness is guaranteed by checking the database directly
// inside the same transaction that inserts the registration —
// never generated speculatively before the DB commit.
// ============================================================
const pool = require('../config/db');

/** Turns an event name into a short uppercase code, e.g. "Hackathon" -> "HACK" */
function eventCode(eventName) {
  const cleaned = eventName.replace(/[^a-zA-Z]/g, '').toUpperCase();
  return cleaned.slice(0, 4) || 'EVT';
}

/**
 * Generates the next sequential Registration ID for a given event,
 * using a row lock so two simultaneous registrations can never
 * collide on the same sequence number.
 * MUST be called with a connection that is already inside a transaction.
 */
async function generateRegistrationId(connection, editionNumber, eventId, eventName) {
  const code = eventCode(eventName);
  const prefix = `SYM${editionNumber}-${code}-`;

  // Lock existing rows for this prefix so concurrent requests serialize correctly
  const [rows] = await connection.query(
    `SELECT registration_id FROM registrations
     WHERE event_id = ? AND registration_id LIKE ?
     ORDER BY registration_id DESC LIMIT 1 FOR UPDATE`,
    [eventId, `${prefix}%`]
  );

  let nextSeq = 1;
  if (rows.length) {
    const lastSeq = parseInt(rows[0].registration_id.split('-').pop(), 10);
    if (!Number.isNaN(lastSeq)) nextSeq = lastSeq + 1;
  }

  const padded = String(nextSeq).padStart(4, '0');
  return `${prefix}${padded}`;
}

module.exports = { generateRegistrationId, eventCode };
