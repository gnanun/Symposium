// ============================================================
// SYMPOSIUM 2.0 — BACKEND ENTRY POINT
// Run: npm install, then npm start
// EDIT: set real values in .env before running (see .env.example)
// ============================================================
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const entities = require('./routes/entities');
const registrationRoutes = require('./routes/registrations');
const uploadRoutes = require('./routes/uploads');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS — only requests from known, configured origins are allowed.
// EDIT the ALLOWED_ORIGINS value in .env before deploying to production.
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:8080,http://localhost:8081')
  .split(',')
  .map((o) => o.trim());

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. curl, server-to-server, mobile apps)
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    console.warn(`CORS blocked request from unauthorized origin: ${origin}`);
    return callback(new Error('Not allowed by CORS'));
  },
}));
app.use(express.json());
app.use('/uploads', express.static(require('path').join(__dirname, 'uploads')));

// Health check — useful to confirm the server is alive after deployment
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Symposium 2.0 backend is running.' });
});

// Auth
app.use('/api/auth', authRoutes);

// Content endpoints — all edition-scoped, public GET / admin-only write
app.use('/api/editions', entities.editions);
app.use('/api/events', entities.events);
app.use('/api/schedule', entities.schedule);
app.use('/api/downloads', entities.downloads);
app.use('/api/gallery', entities.gallery);
app.use('/api/announcements', entities.announcements);
app.use('/api/live-updates', entities.liveUpdates);
app.use('/api/faqs', entities.faqs);
app.use('/api/committee', entities.committee);
app.use('/api/members', entities.members);
app.use('/api/sponsors', entities.sponsors);
app.use('/api/achievements', entities.achievements);
app.use('/api/recaps', entities.recaps);
app.use('/api/contact-info', entities.contactInfo);
app.use('/api/registration', entities.registration);
app.use('/api/registrations', registrationRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/judges', entities.judges);
app.use('/api/testimonials', entities.testimonials);
app.use('/api/travel-info', entities.travelInfo);
app.use('/api/code-of-conduct', entities.codeOfConduct);
app.use('/api/theme-reveal', entities.themeReveal);
app.use('/api/event-registration-settings', entities.eventRegistrationSettings);
app.use('/api/registration-fields', entities.registrationFields);

// 404 fallback for unknown API routes
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'This endpoint does not exist.' });
});

// Central error handler — ensures no internal stack traces or file paths are ever
// leaked to the client (e.g. CORS rejections, unexpected errors), regardless of
// where in the request pipeline they occur.
app.use((err, req, res, next) => {
  if (err && err.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: 'This origin is not permitted to access the API.' });
  }
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on our end. Please try again.' });
});

app.listen(PORT, () => {
  console.log(`Symposium 2.0 backend running on port ${PORT}`);
});
