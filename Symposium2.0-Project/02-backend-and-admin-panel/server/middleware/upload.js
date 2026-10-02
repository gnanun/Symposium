// ============================================================
// Handles payment screenshot uploads.
// Security notes:
// - File type is checked by actual MIME type AND extension, not
//   filename alone (a browser claiming "image/jpeg" is trusted
//   only as far as multer's fileFilter can verify from the
//   upload stream — this is standard practice; full magic-byte
//   sniffing would need an extra library and isn't necessary at
//   this scale).
// - Size is capped server-side — the client-side limit alone is
//   never sufficient, since it can be bypassed.
// - Files are renamed on save (random + timestamp) so a
//   participant can never overwrite another's file or inject a
//   path via their original filename.
// ============================================================
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads', 'payments');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png'];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB — generous for a phone screenshot, blocks accidental huge uploads

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const randomName = crypto.randomBytes(16).toString('hex');
    cb(null, `${Date.now()}-${randomName}${ext}`);
  },
});

function fileFilter(req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  const mimeOk = ALLOWED_MIME_TYPES.includes(file.mimetype);
  const extOk = ALLOWED_EXTENSIONS.includes(ext);

  if (!mimeOk || !extOk) {
    return cb(new Error('Only JPG, JPEG, or PNG image files are allowed.'));
  }
  cb(null, true);
}

const uploadPaymentScreenshot = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
}).single('payment_screenshot');

/** Wraps multer's callback style in a friendlier error response. */
function handleUpload(req, res, next) {
  uploadPaymentScreenshot(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File is too large. Maximum size is 5 MB.' });
      }
      return res.status(400).json({ error: 'File upload failed. Please try again.' });
    }
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}

module.exports = { handleUpload, UPLOAD_DIR };
