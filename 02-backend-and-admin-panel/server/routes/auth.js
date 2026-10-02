// ============================================================
// POST /api/auth/login — admin login, returns a JWT token
// ============================================================
const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { comparePassword } = require('../utils/password');
const jwt = require('jsonwebtoken');
const { loginLimiter } = require('../middleware/rateLimiter');

router.post('/login', loginLimiter, async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  try {
    const [rows] = await pool.query(
      'SELECT * FROM admin_accounts WHERE username = ? AND is_active = TRUE',
      [username]
    );
    const admin = rows[0];

    if (!admin) {
      return res.status(401).json({ error: 'Incorrect username or password.' });
    }

    const isValid = await comparePassword(password, admin.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Incorrect username or password.' });
    }

    await pool.query('UPDATE admin_accounts SET last_login = NOW() WHERE admin_id = ?', [admin.admin_id]);

    const token = jwt.sign(
      { adminId: admin.admin_id, username: admin.username },
      process.env.JWT_SECRET,
      { expiresIn: '12h' }
    );

    res.json({
      token,
      admin: { id: admin.admin_id, name: admin.full_name, username: admin.username },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

module.exports = router;
