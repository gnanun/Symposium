// ============================================================
// One-time script to create an admin account.
// Run manually: node utils/createAdmin.js "Full Name" "username" "email" "password"
// Never store plain passwords — this hashes before saving.
// ============================================================
const pool = require('../config/db');
const { hashPassword } = require('./password');

async function createAdmin() {
  const [fullName, username, email, plainPassword] = process.argv.slice(2);

  if (!fullName || !username || !email || !plainPassword) {
    console.log('Usage: node utils/createAdmin.js "Full Name" "username" "email" "password"');
    process.exit(1);
  }

  const passwordHash = await hashPassword(plainPassword);

  await pool.query(
    `INSERT INTO admin_accounts (full_name, username, email, password_hash) VALUES (?, ?, ?, ?)`,
    [fullName, username, email, passwordHash]
  );

  console.log(`Admin account created for ${username}. You can now log in via /api/auth/login.`);
  process.exit(0);
}

createAdmin().catch((err) => {
  console.error('Failed to create admin:', err.message);
  process.exit(1);
});
