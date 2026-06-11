const express = require("express");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const rateLimit = require("express-rate-limit");
const {
  findUserByEmail,
  findUserById,
  createUser,
  updateLastLogin,
  createPasswordResetToken,
  findPasswordResetToken,
  markTokenAsUsed,
  updateUserPassword
} = require("../db/auth");

const router = express.Router();

const BCRYPT_ROUNDS = 12;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// A valid bcrypt hash used to prevent user-enumeration via timing differences.
// Generated once at startup so login always runs bcrypt.compare regardless of
// whether the email exists.
const DUMMY_HASH = bcrypt.hashSync("dummy-never-matches", 10);

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) =>
    res.status(429).json({ success: false, error: "Muitas tentativas de login. Aguarde 15 minutos e tente novamente." })
});

const forgotLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) =>
    res.status(429).json({ success: false, error: "Muitas tentativas. Aguarde 1 hora e tente novamente." })
});

// ─── POST /auth/register ──────────────────────────────────────────────────────

router.post("/register", async (req, res) => {
  const name = String(req.body.name || "").trim();
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");

  const errors = {};
  if (!name || name.length < 2) errors.name = "Nome deve ter pelo menos 2 caracteres.";
  if (name.length > 100) errors.name = "Nome muito longo (máximo 100 caracteres).";
  if (!email || !EMAIL_REGEX.test(email)) errors.email = "E-mail inválido.";
  if (email.length > 254) errors.email = "E-mail muito longo.";
  if (!password || password.length < 8) errors.password = "Senha deve ter pelo menos 8 caracteres.";
  if (password.length > 72) errors.password = "Senha muito longa (máximo 72 caracteres).";

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  try {
    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ success: false, errors: { email: "Este e-mail já está cadastrado." } });
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const user = await createUser(name, email, passwordHash);

    req.session.userId = user.id;
    await saveSession(req);

    return res.status(201).json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (err) {
    console.error("[Auth] Register error:", err.message);
    return res.status(500).json({ success: false, error: "Erro interno do servidor." });
  }
});

// ─── POST /auth/login ─────────────────────────────────────────────────────────

router.post("/login", loginLimiter, async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");

  if (!email || !password) {
    return res.status(400).json({ success: false, error: "E-mail e senha são obrigatórios." });
  }

  try {
    const user = await findUserByEmail(email);
    // Always run bcrypt.compare to prevent timing-based user enumeration.
    const hash = user ? user.password_hash : DUMMY_HASH;
    const match = await bcrypt.compare(password, hash);

    if (!user || !match) {
      return res.status(401).json({ success: false, error: "Credenciais inválidas." });
    }

    if (!user.is_active) {
      return res.status(403).json({ success: false, error: "Conta desativada. Entre em contato com o suporte." });
    }

    await updateLastLogin(user.id);

    req.session.userId = user.id;
    await saveSession(req);

    return res.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (err) {
    console.error("[Auth] Login error:", err.message);
    return res.status(500).json({ success: false, error: "Erro interno do servidor." });
  }
});

// ─── POST /auth/logout ────────────────────────────────────────────────────────

router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) console.error("[Auth] Session destroy error:", err.message);
    res.clearCookie("leafscan.sid");
    res.json({ success: true });
  });
});

// ─── GET /auth/me ─────────────────────────────────────────────────────────────

router.get("/me", requireAuth, (req, res) => {
  const { id, name, email } = req.user;
  res.json({ success: true, user: { id, name, email } });
});

// ─── POST /auth/forgot-password ───────────────────────────────────────────────

router.post("/forgot-password", forgotLimiter, async (req, res) => {
  // Always return the same message to prevent user-enumeration.
  const SAFE_RESPONSE = {
    success: true,
    message: "Se este e-mail estiver cadastrado, você receberá as instruções em breve."
  };

  const email = String(req.body.email || "").trim().toLowerCase();
  if (!email || !EMAIL_REGEX.test(email)) return res.json(SAFE_RESPONSE);

  try {
    const user = await findUserByEmail(email);
    if (!user) return res.json(SAFE_RESPONSE);

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await createPasswordResetToken(user.id, tokenHash, expiresAt);

    const appUrl = (process.env.APP_URL || `http://localhost:${process.env.PORT || 3000}`).replace(/\/$/, "");
    const resetUrl = `${appUrl}/?action=reset&token=${rawToken}`;

    // No email provider configured — log reset URL to server console.
    // To enable email delivery, integrate an SMTP/transactional email service
    // (e.g. Nodemailer + Gmail, SendGrid, Resend) and replace these console.log
    // calls with your sendMail(user.email, user.name, resetUrl) call.
    console.log(`[Auth] Password reset requested for: ${email}`);
    console.log(`[Auth] Reset link (copy and send to user): ${resetUrl}`);

    return res.json(SAFE_RESPONSE);
  } catch (err) {
    console.error("[Auth] Forgot-password error:", err.message);
    return res.json(SAFE_RESPONSE); // Don't leak server errors
  }
});

// ─── POST /auth/reset-password ────────────────────────────────────────────────

router.post("/reset-password", async (req, res) => {
  const token = String(req.body.token || "").trim();
  const password = String(req.body.password || "");
  const confirmPassword = String(req.body.confirmPassword || "");

  if (!token) {
    return res.status(400).json({ success: false, error: "Token inválido." });
  }
  if (!password || password.length < 8) {
    return res.status(400).json({ success: false, error: "A senha deve ter pelo menos 8 caracteres." });
  }
  if (password.length > 72) {
    return res.status(400).json({ success: false, error: "Senha muito longa (máximo 72 caracteres)." });
  }
  if (password !== confirmPassword) {
    return res.status(400).json({ success: false, error: "As senhas não coincidem." });
  }

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  try {
    const record = await findPasswordResetToken(tokenHash);

    if (!record) {
      return res.status(400).json({ success: false, error: "Token inválido ou expirado. Solicite um novo link." });
    }
    if (new Date() > new Date(record.expires_at)) {
      return res.status(400).json({ success: false, error: "Token expirado. Solicite um novo link de recuperação." });
    }
    if (record.used_at) {
      return res.status(400).json({ success: false, error: "Token já utilizado. Solicite um novo link de recuperação." });
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    await updateUserPassword(record.user_id, passwordHash);
    await markTokenAsUsed(record.id);

    return res.json({ success: true, message: "Senha redefinida com sucesso. Faça login com a nova senha." });
  } catch (err) {
    console.error("[Auth] Reset-password error:", err.message);
    return res.status(500).json({ success: false, error: "Erro interno do servidor." });
  }
});

// ─── requireAuth middleware ───────────────────────────────────────────────────

async function requireAuth(req, res, next) {
  if (!req.session?.userId) {
    return res.status(401).json({ success: false, error: "Não autenticado." });
  }
  try {
    const user = await findUserById(req.session.userId);
    if (!user || !user.is_active) {
      req.session.destroy(() => {});
      return res.status(401).json({ success: false, error: "Sessão inválida. Faça login novamente." });
    }
    req.user = user;
    next();
  } catch (err) {
    console.error("[Auth] requireAuth error:", err.message);
    return res.status(500).json({ success: false, error: "Erro interno do servidor." });
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function saveSession(req) {
  return new Promise((resolve, reject) => {
    req.session.save((err) => (err ? reject(err) : resolve()));
  });
}

module.exports = { router, requireAuth };
