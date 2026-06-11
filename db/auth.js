const crypto = require("crypto");
const { query } = require("./database");

async function findUserByEmail(email) {
  const rows = await query(
    "SELECT id, name, email, password_hash, is_active, last_login_at FROM users WHERE email = ? LIMIT 1",
    [email]
  );
  return rows[0] || null;
}

async function findUserById(id) {
  const rows = await query(
    "SELECT id, name, email, is_active FROM users WHERE id = ? LIMIT 1",
    [id]
  );
  return rows[0] || null;
}

async function createUser(name, email, passwordHash) {
  const id = crypto.randomUUID();
  await query(
    "INSERT INTO users (id, name, email, password_hash) VALUES (?, ?, ?, ?)",
    [id, name, email, passwordHash]
  );
  return { id, name, email };
}

async function updateLastLogin(userId) {
  await query("UPDATE users SET last_login_at = NOW() WHERE id = ?", [userId]);
}

async function createPasswordResetToken(userId, tokenHash, expiresAt) {
  const id = crypto.randomUUID();
  await query(
    "INSERT INTO password_reset_tokens (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, ?)",
    [id, userId, tokenHash, expiresAt]
  );
  return id;
}

async function findPasswordResetToken(tokenHash) {
  const rows = await query(
    "SELECT id, user_id, expires_at, used_at FROM password_reset_tokens WHERE token_hash = ? LIMIT 1",
    [tokenHash]
  );
  return rows[0] || null;
}

async function markTokenAsUsed(tokenId) {
  await query(
    "UPDATE password_reset_tokens SET used_at = NOW() WHERE id = ?",
    [tokenId]
  );
}

async function updateUserPassword(userId, passwordHash) {
  await query(
    "UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?",
    [passwordHash, userId]
  );
}

module.exports = {
  findUserByEmail,
  findUserById,
  createUser,
  updateLastLogin,
  createPasswordResetToken,
  findPasswordResetToken,
  markTokenAsUsed,
  updateUserPassword
};
