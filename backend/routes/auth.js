import express from "express";
import passport from "passport";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { authLimiter } from "../middleware/rateLimiters.js";
import { FRONTEND_URL } from "../config/env.js";
import {
  signAccessToken,
  getUserIdFromRequest,
} from "../utils/authToken.js";
import { sendVerificationEmail } from "../services/mailer.js";
import {
  generateVerificationCode,
  hashVerificationCode,
  verifyCodeHash,
  verificationExpiryDate,
  isVerificationExpired,
} from "../utils/verificationCode.js";

const router = express.Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(email) {
  return typeof email === "string" && EMAIL_RE.test(email.trim());
}

async function deliverVerificationEmail(user, verificationCode) {
  let emailDelivery = "smtp";
  try {
    const mailResult = await sendVerificationEmail({
      to: user.email,
      fullName: user.fullName,
      code: verificationCode,
      expiresMinutes: 10,
    });
    if (mailResult?.devLogged) {
      emailDelivery = "console";
    } else if (!mailResult?.sent) {
      emailDelivery = "failed";
    }
  } catch (mailErr) {
    console.error("Verification email error:", mailErr);
    emailDelivery = "failed";
  }
  return emailDelivery;
}

function buildVerificationRegisterResponse(email, emailDelivery) {
  const message =
    emailDelivery === "smtp"
      ? "נשלח קוד אימות לכתובת האימייל שלך. הזן אותו כדי להשלים את ההרשמה."
      : emailDelivery === "console"
        ? "SMTP לא מוגדר — הקוד מודפס בקונסול השרת (מצב פיתוח)."
        : "ההרשמה הצליחה אך שליחת המייל נכשלה. נסה 'שלח קוד מחדש'.";
  return {
    needsEmailVerification: true,
    email,
    emailDelivery,
    message,
  };
}

function redirectFrontendWithToken(res, userId) {
  const token = signAccessToken(String(userId));
  try {
    const u = new URL(FRONTEND_URL);
    u.hash = `access_token=${encodeURIComponent(token)}`;
    return res.redirect(u.toString());
  } catch {
    const base = String(FRONTEND_URL || "").replace(/\/$/, "");
    return res.redirect(`${base}#access_token=${encodeURIComponent(token)}`);
  }
}

router.post("/auth/register", authLimiter, async (req, res) => {
  const { fullName, email, password } = req.body;

  if (!fullName || !email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: "אימייל לא תקין" });
  }

  try {
    const existingUser = await User.findOne({ email: email.toLowerCase() }).select(
      "+emailVerificationCodeHash +emailVerificationExpiresAt emailVerified passwordHash fullName email",
    );
    if (existingUser?.emailVerified) {
      return res.status(409).json({ error: "כבר קיים חשבון עם אימייל זה" });
    }
    if (existingUser && !existingUser.passwordHash) {
      return res.status(409).json({
        error: "האימייל מקושר לחשבון גוגל/פייסבוק — התחבר דרך הרשת החברתית",
      });
    }

    const verificationCode = generateVerificationCode();

    let user;
    if (existingUser) {
      existingUser.fullName = fullName;
      existingUser.emailVerified = false;
      existingUser.emailVerificationCodeHash = hashVerificationCode(verificationCode);
      existingUser.emailVerificationExpiresAt = verificationExpiryDate(10);
      existingUser.$locals.plainPassword = password;
      user = await existingUser.save();
    } else {
      user = new User({
        fullName,
        email: email.toLowerCase(),
        emailVerified: false,
        emailVerificationCodeHash: hashVerificationCode(verificationCode),
        emailVerificationExpiresAt: verificationExpiryDate(10),
      });
      user.$locals.plainPassword = password;
      await user.save();
    }

    const emailDelivery = await deliverVerificationEmail(user, verificationCode);

    res.status(existingUser ? 200 : 201).json(
      buildVerificationRegisterResponse(user.email, emailDelivery),
    );
  } catch (err) {
    if (err.name === "ValidationError") {
      const msg = Object.values(err.errors)
        .map((e) => e.message)
        .join(", ");
      return res.status(400).json({ error: msg });
    }
    console.error("Register error:", err);
    res.status(500).json({ error: "Failed to register" });
  }
});

router.post("/auth/login", authLimiter, async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: "אימייל לא תקין" });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    if (!user.passwordHash) {
      return res.status(401).json({
        error:
          "החשבון נוצר עם גוגל/פייסבוק – השתמש בהתחברות חברתית",
      });
    }
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Legacy accounts created before email verification may have emailVerified=false.
    // Login is allowed; verification is required only during registration.
    if (user.emailVerified === false) {
      user.emailVerified = true;
      user.emailVerificationCodeHash = undefined;
      user.emailVerificationExpiresAt = undefined;
      await user.save();
    }

    req.session.userId = user._id.toString();
    const token = signAccessToken(user._id.toString());
    res.json({
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
      },
      token,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Failed to login" });
  }
});

router.post("/auth/verify-email", authLimiter, async (req, res) => {
  const emailRaw = typeof req.body?.email === "string" ? req.body.email.trim() : "";
  const codeRaw = typeof req.body?.code === "string" ? req.body.code.trim() : "";

  if (!emailRaw || !codeRaw) {
    return res.status(400).json({ error: "נדרשים אימייל וקוד אימות" });
  }
  if (!isValidEmail(emailRaw)) {
    return res.status(400).json({ error: "אימייל לא תקין" });
  }
  if (!/^\d{6}$/.test(codeRaw)) {
    return res.status(400).json({ error: "קוד האימות חייב להיות 6 ספרות" });
  }

  try {
    const user = await User.findOne({ email: emailRaw.toLowerCase() }).select(
      "+emailVerificationCodeHash +emailVerificationExpiresAt fullName email passwordHash emailVerified",
    );
    if (!user) {
      return res.status(400).json({ error: "קוד אימות שגוי" });
    }
    if (user.emailVerified) {
      req.session.userId = user._id.toString();
      const token = signAccessToken(user._id.toString());
      return res.json({
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
        },
        token,
        alreadyVerified: true,
      });
    }
    if (
      !user.emailVerificationCodeHash ||
      isVerificationExpired(user.emailVerificationExpiresAt)
    ) {
      return res.status(400).json({
        error: "פג תוקף הקוד. בקש שליחה מחדש.",
        expired: true,
      });
    }
    if (!verifyCodeHash(codeRaw, user.emailVerificationCodeHash)) {
      return res.status(400).json({ error: "קוד אימות שגוי" });
    }

    user.emailVerified = true;
    user.emailVerificationCodeHash = undefined;
    user.emailVerificationExpiresAt = undefined;
    await user.save();

    req.session.userId = user._id.toString();
    const token = signAccessToken(user._id.toString());
    res.json({
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
      },
      token,
    });
  } catch (err) {
    console.error("Verify email error:", err);
    res.status(500).json({ error: "אימות האימייל נכשל" });
  }
});

router.post("/auth/resend-verification", authLimiter, async (req, res) => {
  const emailRaw = typeof req.body?.email === "string" ? req.body.email.trim() : "";
  if (!emailRaw || !isValidEmail(emailRaw)) {
    return res.status(400).json({ error: "אימייל לא תקין" });
  }

  try {
    const user = await User.findOne({ email: emailRaw.toLowerCase() }).select(
      "+emailVerificationCodeHash +emailVerificationExpiresAt fullName email passwordHash emailVerified",
    );
    if (!user || !user.passwordHash) {
      return res.json({
        ok: true,
        message: "אם החשבון קיים, נשלח קוד אימות חדש.",
      });
    }
    if (user.emailVerified) {
      return res.status(400).json({ error: "האימייל כבר אומת" });
    }

    const verificationCode = generateVerificationCode();
    user.emailVerificationCodeHash = hashVerificationCode(verificationCode);
    user.emailVerificationExpiresAt = verificationExpiryDate(10);
    await user.save();

    try {
      await sendVerificationEmail({
        to: user.email,
        fullName: user.fullName,
        code: verificationCode,
        expiresMinutes: 10,
      });
    } catch (mailErr) {
      console.error("Resend verification email error:", mailErr);
      return res.status(503).json({ error: "שליחת המייל נכשלה. נסה שוב מאוחר יותר." });
    }

    res.json({
      ok: true,
      message: "קוד אימות חדש נשלח לאימייל שלך",
    });
  } catch (err) {
    console.error("Resend verification error:", err);
    res.status(500).json({ error: "שליחה מחדש נכשלה" });
  }
});

router.post("/auth/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.json({ ok: true });
  });
});

router.get("/auth/me", async (req, res) => {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const user = await User.findById(userId).select(
      "fullName email passwordHash",
    );
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    res.json({
      user: {
        fullName: user.fullName,
        email: user.email,
        hasPassword: Boolean(user.passwordHash),
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

router.put("/auth/profile", requireAuth, async (req, res) => {
  const nameRaw = typeof req.body?.fullName === "string" ? req.body.fullName.trim() : "";
  if (!nameRaw || nameRaw.length < 2) {
    return res.status(400).json({ error: "שם מלא חייב להכיל לפחות שני תווים" });
  }
  try {
    const user = await User.findByIdAndUpdate(
      req.userId,
      { fullName: nameRaw },
      { new: true, runValidators: true },
    ).select("fullName email passwordHash");
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    res.json({
      user: {
        fullName: user.fullName,
        email: user.email,
        hasPassword: Boolean(user.passwordHash),
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to update profile" });
  }
});

router.put("/auth/password", authLimiter, requireAuth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (
    typeof currentPassword !== "string" ||
    typeof newPassword !== "string" ||
    !currentPassword ||
    !newPassword
  ) {
    return res.status(400).json({ error: "נא למלא סיסמה נוכחית וסיסמה חדשה" });
  }
  if (newPassword.length < 7) {
    return res.status(400).json({ error: "הסיסמה החדשה חייבת לכלול לפחות 7 תווים" });
  }
  if (newPassword.length > 128) {
    return res.status(400).json({ error: "הסיסמה החדשה ארוכה מדי" });
  }
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (!user.passwordHash) {
      return res.status(400).json({
        error:
          "החשבון מקושר לגוגל/פייסבוק — אין סיסמה מקומית לעדכן",
      });
    }
    const match = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!match) {
      return res.status(401).json({ error: "הסיסמה הנוכחית שגויה" });
    }
    user.$locals.plainPassword = newPassword;
    await user.save();
    res.json({ ok: true });
  } catch (err) {
    console.error("Password update error:", err);
    res.status(500).json({ error: "Failed to update password" });
  }
});

router.get("/auth/google", (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID) {
    return res.status(503).json({ error: "התחברות עם גוגל אינה מופעלת" });
  }
  passport.authenticate("google", { scope: ["profile", "email"] })(
    req,
    res,
    next,
  );
});

router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${FRONTEND_URL}/login?error=google`,
  }),
  (req, res) => {
    req.session.userId = req.user._id.toString();
    redirectFrontendWithToken(res, req.user._id);
  },
);

router.get("/auth/facebook", (req, res, next) => {
  if (!process.env.FACEBOOK_APP_ID) {
    return res.status(503).json({ error: "התחברות עם פייסבוק אינה מופעלת" });
  }
  passport.authenticate("facebook", { scope: ["email"] })(req, res, next);
});

router.get(
  "/auth/facebook/callback",
  passport.authenticate("facebook", {
    session: false,
    failureRedirect: `${FRONTEND_URL}/login?error=facebook`,
  }),
  (req, res) => {
    req.session.userId = req.user._id.toString();
    redirectFrontendWithToken(res, req.user._id);
  },
);

export default router;
