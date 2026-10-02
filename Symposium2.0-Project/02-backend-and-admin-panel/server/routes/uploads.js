// ============================================================
// Public endpoint: upload a payment screenshot, get back the URL
// to include when submitting the registration form itself.
// Kept separate from the registration submission endpoint since
// file uploads are multipart/form-data, not JSON.
// ============================================================
const express = require('express');
const { handleUpload } = require('../middleware/upload');

const router = express.Router();

router.post('/payment-screenshot', handleUpload, (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file was uploaded.' });
  }
  const fileUrl = `/uploads/payments/${req.file.filename}`;
  res.status(201).json({ url: fileUrl, message: 'File uploaded successfully.' });
});

module.exports = router;
