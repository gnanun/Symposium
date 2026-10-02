// ============================================================
// Reusable CRUD route factory.
// Every content type (events, gallery, committee, etc.) follows
// the same pattern: public GET (filtered by edition), admin-only
// POST/PUT/DELETE. This file generates that router so every
// entity behaves identically instead of copy-pasted route logic
// drifting out of sync over time.
// ============================================================
const express = require('express');
const pool = require('../config/db');
const { requireAdmin } = require('../middleware/auth');

/**
 * @param {string} table       - exact table name, e.g. 'events'
 * @param {string} idField     - primary key column, e.g. 'event_id'
 * @param {string[]} fields    - editable columns (excludes id/timestamps)
 */
// Tables that have a display_order column — only these get ordered by it.
// Every other table (even when filtered) is ordered by its id column only,
// since ordering by a non-existent column would throw a SQL error.
// NOTE: this list was verified programmatically against schema.sql directly —
// do not add a table here without checking its actual CREATE TABLE statement first.
const TABLES_WITH_DISPLAY_ORDER = new Set([
  'events', 'schedule_items', 'gallery_items', 'faqs', 'committee_members',
  'members', 'sponsors', 'registration_fields', 'judges', 'testimonials',
  'travel_info_sections',
]);

function createCrudRouter({ table, idField, fields }) {
  const router = express.Router();

  // GET all — optionally filter by edition_id (?edition_id=2) and/or event_id (?event_id=5).
  // Both are supported (not just edition_id) since several V2 tables — registration_fields,
  // event_registration_settings, theme_reveal — are scoped by event, not by edition.
  router.get('/', async (req, res) => {
    try {
      const { edition_id, event_id } = req.query;
      const conditions = [];
      const params = [];
      if (edition_id) { conditions.push('edition_id = ?'); params.push(edition_id); }
      if (event_id) { conditions.push('event_id = ?'); params.push(event_id); }

      const orderBy = TABLES_WITH_DISPLAY_ORDER.has(table)
        ? `display_order ASC, ${idField} ASC`
        : `${idField} ${conditions.length ? 'ASC' : 'DESC'}`;

      const sql = conditions.length
        ? `SELECT * FROM ${table} WHERE ${conditions.join(' AND ')} ORDER BY ${orderBy}`
        : `SELECT * FROM ${table} ORDER BY ${orderBy}`;

      const [rows] = await pool.query(sql, params);
      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: `Could not fetch ${table}.` });
    }
  });

  // GET one by id
  router.get('/:id', async (req, res) => {
    try {
      const [rows] = await pool.query(`SELECT * FROM ${table} WHERE ${idField} = ?`, [req.params.id]);
      if (!rows[0]) return res.status(404).json({ error: 'Not found.' });
      res.json(rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: `Could not fetch this ${table} entry.` });
    }
  });

  // POST create — admin only
  router.post('/', requireAdmin, async (req, res) => {
    try {
      const cols = fields.filter((f) => req.body[f] !== undefined);
      if (!cols.length) return res.status(400).json({ error: 'No valid fields provided.' });

      const placeholders = cols.map(() => '?').join(', ');
      const values = cols.map((f) => req.body[f]);

      const [result] = await pool.query(
        `INSERT INTO ${table} (${cols.join(', ')}) VALUES (${placeholders})`,
        values
      );
      res.status(201).json({ id: result.insertId, message: 'Created successfully.' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: `Could not create ${table} entry.` });
    }
  });

  // PUT update — admin only
  router.put('/:id', requireAdmin, async (req, res) => {
    try {
      const cols = fields.filter((f) => req.body[f] !== undefined);
      if (!cols.length) return res.status(400).json({ error: 'No valid fields provided.' });

      const setClause = cols.map((f) => `${f} = ?`).join(', ');
      const values = cols.map((f) => req.body[f]);
      values.push(req.params.id);

      await pool.query(`UPDATE ${table} SET ${setClause} WHERE ${idField} = ?`, values);
      res.json({ message: 'Updated successfully.' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: `Could not update this ${table} entry.` });
    }
  });

  // DELETE — admin only
  router.delete('/:id', requireAdmin, async (req, res) => {
    try {
      await pool.query(`DELETE FROM ${table} WHERE ${idField} = ?`, [req.params.id]);
      res.json({ message: 'Deleted successfully.' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: `Could not delete this ${table} entry.` });
    }
  });

  return router;
}

module.exports = createCrudRouter;
