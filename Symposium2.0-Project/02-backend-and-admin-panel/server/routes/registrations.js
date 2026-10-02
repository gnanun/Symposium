// ============================================================
// Public registration submission + admin registration management.
// This is intentionally NOT built on the generic CRUD factory —
// a registration touches four tables at once (registrations,
// registration_answers, team_members, event_registration_settings)
// and must succeed or fail as a single unit, so it needs its own
// transaction-based logic.
// ============================================================
const express = require('express');
const pool = require('../config/db');
const { requireAdmin } = require('../middleware/auth');
const { generateRegistrationId } = require('../utils/registrationId');
const { registrationLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// ---------- Helpers ----------

/** Fetches an event's registration settings + its parent edition's number, or null if not found. */
async function getEventRegistrationContext(connection, eventId) {
  const [rows] = await connection.query(
    `SELECT ers.*, e.event_name, e.edition_id, se.edition_number
     FROM event_registration_settings ers
     JOIN events e ON e.event_id = ers.event_id
     JOIN symposium_editions se ON se.edition_id = e.edition_id
     WHERE ers.event_id = ? FOR UPDATE`,
    [eventId]
  );
  return rows[0] || null;
}

// ---------- PUBLIC: submit a registration ----------
router.post('/', registrationLimiter, async (req, res) => {
  const { event_id, team_name, answers, team_members, payment_screenshot_url, utr_number, website } = req.body;

  // Honeypot: real participants never populate this hidden field. A bot that
  // fills every field will. Reject generically — don't reveal why, so bots
  // don't learn to leave it empty specifically for this endpoint.
  if (website && String(website).trim() !== "") {
    return res.status(400).json({ error: 'Registration could not be processed. Please try again.' });
  }

  if (!event_id || !answers || !payment_screenshot_url || !utr_number) {
    return res.status(400).json({ error: 'Missing required registration information.' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Load event registration settings (locked for this transaction — prevents two
    //    simultaneous last-seat registrations both succeeding)
    const ctx = await getEventRegistrationContext(connection, event_id);
    if (!ctx) {
      await connection.rollback();
      return res.status(404).json({ error: 'This event does not accept registrations.' });
    }

    // 2. Status checks
    if (ctx.status === 'not_set' || ctx.status === 'coming_soon') {
      await connection.rollback();
      return res.status(403).json({ error: 'Registration for this event has not opened yet.' });
    }
    if (ctx.status === 'paused') {
      await connection.rollback();
      return res.status(403).json({ error: 'Registration is temporarily paused. Please check back soon.' });
    }
    if (ctx.status === 'closed') {
      await connection.rollback();
      return res.status(403).json({ error: 'Registration for this event is closed.' });
    }
    if (ctx.status === 'full' || ctx.seats_registered >= ctx.seats_total) {
      await connection.rollback();
      return res.status(403).json({ error: 'This event has reached full capacity.' });
    }
    if (ctx.deadline && new Date() > new Date(ctx.deadline)) {
      await connection.rollback();
      return res.status(403).json({ error: 'The registration deadline for this event has passed.' });
    }

    // 3. Team size enforcement
    const memberCount = 1 + (Array.isArray(team_members) ? team_members.length : 0);
    if (memberCount < ctx.team_size_min || memberCount > ctx.team_size_max) {
      await connection.rollback();
      return res.status(400).json({
        error: `Team size for this event must be between ${ctx.team_size_min} and ${ctx.team_size_max} members. You provided ${memberCount}.`,
      });
    }

    // 4. Dynamic field validation — every required field must have a non-empty answer
    const [fieldRows] = await connection.query(
      `SELECT field_id, field_label, is_required, field_type FROM registration_fields WHERE event_id = ?`,
      [event_id]
    );
    for (const field of fieldRows) {
      const value = answers[field.field_id];
      if (field.is_required && (value === undefined || value === null || String(value).trim() === '')) {
        await connection.rollback();
        return res.status(400).json({ error: `"${field.field_label}" is required.` });
      }
      if (value && field.field_type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        await connection.rollback();
        return res.status(400).json({ error: `"${field.field_label}" must be a valid email address.` });
      }
      if (value && field.field_type === 'phone' && !/^[0-9+\-\s]{7,15}$/.test(value)) {
        await connection.rollback();
        return res.status(400).json({ error: `"${field.field_label}" must be a valid phone number.` });
      }
    }

    // 5. Generate a unique Registration ID (only after all validation has passed)
    const registrationId = await generateRegistrationId(connection, ctx.edition_number, event_id, ctx.event_name);

    // 6. Insert the registration
    await connection.query(
      `INSERT INTO registrations (registration_id, event_id, team_name, payment_status, payment_screenshot_url, utr_number)
       VALUES (?, ?, ?, 'verification_pending', ?, ?)`,
      [registrationId, event_id, team_name || null, payment_screenshot_url, utr_number]
    );

    // 7. Insert answers
    for (const field of fieldRows) {
      const value = answers[field.field_id];
      if (value !== undefined && value !== null && String(value).trim() !== '') {
        await connection.query(
          `INSERT INTO registration_answers (registration_id, field_id, answer_value) VALUES (?, ?, ?)`,
          [registrationId, field.field_id, String(value)]
        );
      }
    }

    // 8. Insert team members (if any)
    if (Array.isArray(team_members)) {
      for (const member of team_members) {
        if (!member.member_name) continue;
        await connection.query(
          `INSERT INTO team_members (registration_id, member_name, member_email, member_phone, member_usn)
           VALUES (?, ?, ?, ?, ?)`,
          [registrationId, member.member_name, member.member_email || null, member.member_phone || null, member.member_usn || null]
        );
      }
    }

    // 9. Increment seat count, auto-flip to 'full' if capacity is now reached
    const newCount = ctx.seats_registered + 1;
    const newStatus = newCount >= ctx.seats_total ? 'full' : ctx.status;
    await connection.query(
      `UPDATE event_registration_settings SET seats_registered = ?, status = ? WHERE event_id = ?`,
      [newCount, newStatus, event_id]
    );

    await connection.commit();
    res.status(201).json({
      registration_id: registrationId,
      event_name: ctx.event_name,
      team_name: team_name || null,
      payment_status: 'verification_pending',
      submitted_at: new Date().toISOString(),
      message: 'Registration successful.',
    });
  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).json({ error: 'Registration could not be completed. Please try again.' });
  } finally {
    connection.release();
  }
});

// ---------- PUBLIC: fetch one registration by ID (for the receipt page) ----------
router.get('/:id', async (req, res) => {
  try {
    const [[registration]] = await pool.query(
      `SELECT r.*, e.event_name FROM registrations r JOIN events e ON e.event_id = r.event_id WHERE r.registration_id = ?`,
      [req.params.id]
    );
    if (!registration) return res.status(404).json({ error: 'Registration not found.' });

    const [answers] = await pool.query(
      `SELECT f.field_label, a.answer_value FROM registration_answers a
       JOIN registration_fields f ON f.field_id = a.field_id WHERE a.registration_id = ?`,
      [req.params.id]
    );
    const [members] = await pool.query(`SELECT * FROM team_members WHERE registration_id = ?`, [req.params.id]);

    res.json({ ...registration, answers, team_members: members });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not fetch this registration.' });
  }
});

// ---------- ADMIN: list/search registrations for one event ----------
router.get('/', requireAdmin, async (req, res) => {
  try {
    const { event_id, search } = req.query;
    if (!event_id) return res.status(400).json({ error: 'event_id is required.' });

    let sql = `SELECT * FROM registrations WHERE event_id = ?`;
    const params = [event_id];
    if (search) {
      sql += ` AND (team_name LIKE ? OR registration_id LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }
    sql += ` ORDER BY registration_id ASC`;

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not fetch registrations.' });
  }
});

// ---------- ADMIN: mark payment status ----------
router.put('/:id/payment-status', requireAdmin, async (req, res) => {
  try {
    const { payment_status } = req.body;
    if (!['verification_pending', 'paid'].includes(payment_status)) {
      return res.status(400).json({ error: 'Invalid payment status.' });
    }
    await pool.query(`UPDATE registrations SET payment_status = ? WHERE registration_id = ?`, [payment_status, req.params.id]);
    res.json({ message: 'Payment status updated.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not update payment status.' });
  }
});

// ---------- ADMIN: duplicate detection ----------
// Flags registrations that share the same value in any field whose label
// looks like an identity field (Email, Phone, USN). Does NOT block
// registration at submission time — purely a review aid for the admin,
// since a participant registering for multiple events is expected and fine;
// this surfaces genuine possible-duplicate entries within the same event.
router.get('/:eventId/duplicates', requireAdmin, async (req, res) => {
  try {
    const identityLabels = ['email', 'phone', 'usn'];
    const [rows] = await pool.query(
      `SELECT a.answer_value, f.field_label, a.registration_id, r.team_name
       FROM registration_answers a
       JOIN registration_fields f ON f.field_id = a.field_id
       JOIN registrations r ON r.registration_id = a.registration_id
       WHERE f.event_id = ? AND LOWER(f.field_label) REGEXP ?`,
      [req.params.eventId, identityLabels.join('|')]
    );

    // Group by (field_label, answer_value) — anything with more than one registration_id is a duplicate
    const groups = {};
    for (const row of rows) {
      const key = `${row.field_label}::${row.answer_value.trim().toLowerCase()}`;
      if (!groups[key]) groups[key] = { field: row.field_label, value: row.answer_value, registrations: [] };
      if (!groups[key].registrations.some((r) => r.registration_id === row.registration_id)) {
        groups[key].registrations.push({ registration_id: row.registration_id, team_name: row.team_name });
      }
    }

    const duplicates = Object.values(groups).filter((g) => g.registrations.length > 1);
    res.json(duplicates);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not check for duplicates.' });
  }
});

// ---------- ADMIN: export registrations (event-wise, ID ascending) ----------
router.get('/:eventId/export', requireAdmin, async (req, res) => {
  const format = (req.query.format || 'xlsx').toLowerCase();
  try {
    const [registrations] = await pool.query(
      `SELECT * FROM registrations WHERE event_id = ? ORDER BY registration_id ASC`,
      [req.params.eventId]
    );
    const [fields] = await pool.query(
      `SELECT field_id, field_label FROM registration_fields WHERE event_id = ? ORDER BY display_order ASC`,
      [req.params.eventId]
    );

    if (!registrations.length) {
      return res.status(404).json({ error: 'No registrations found for this event.' });
    }

    // Build one flat row per registration, with dynamic field columns
    const [allAnswers] = await pool.query(
      `SELECT registration_id, field_id, answer_value FROM registration_answers
       WHERE registration_id IN (?)`,
      [registrations.map((r) => r.registration_id)]
    );
    const answersByReg = {};
    for (const a of allAnswers) {
      if (!answersByReg[a.registration_id]) answersByReg[a.registration_id] = {};
      answersByReg[a.registration_id][a.field_id] = a.answer_value;
    }

    const headers = ['Registration ID', 'Team Name', 'Payment Status', 'UTR Number', 'Submitted At', ...fields.map((f) => f.field_label)];
    const dataRows = registrations.map((r) => [
      r.registration_id,
      r.team_name || '',
      r.payment_status,
      r.utr_number,
      r.submitted_at,
      ...fields.map((f) => (answersByReg[r.registration_id] && answersByReg[r.registration_id][f.field_id]) || ''),
    ]);

    if (format === 'csv') {
      const escapeCsv = (val) => `"${String(val ?? '').replace(/"/g, '""')}"`;
      const csv = [headers, ...dataRows].map((row) => row.map(escapeCsv).join(',')).join('\r\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="registrations_event${req.params.eventId}.csv"`);
      return res.send(csv);
    }

    // Default: real .xlsx via write-excel-file (no known vulnerabilities, write-only, minimal deps)
    const writeXlsxFile = require('write-excel-file/node');
    const sheetData = [headers, ...dataRows].map((row) => row.map((cell) => String(cell ?? '')));
    const buffer = await writeXlsxFile(sheetData).toBuffer();

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="registrations_event${req.params.eventId}.xlsx"`);
    res.send(buffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not generate export.' });
  }
});

module.exports = router;
