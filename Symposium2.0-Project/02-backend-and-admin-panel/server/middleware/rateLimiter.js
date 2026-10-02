// ============================================================
// Rate limiting — protects against brute-force login attempts
// and spam/bot registration submissions.
// ============================================================
const rateLimit = require('express-rate-limit');

// Login: 8 attempts per 15 minutes per IP. Tight enough to stop
// brute-forcing a password, loose enough that a real admin who
// mistypes a few times never gets locked out during normal use.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8,
  message: { error: 'Too many login attempts. Please wait 15 minutes and try again.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Public registration submission: 10 attempts per 10 minutes per IP.
// Generous enough for a genuine participant (including retries after
// a validation error), tight enough to block automated spam submission.
const registrationLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  message: { error: 'Too many registration attempts from this device. Please wait a few minutes and try again.' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { loginLimiter, registrationLimiter };
