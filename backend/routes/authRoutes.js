import crypto from "crypto";
import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

const SECRET = process.env.JWT_SECRET;
const RESET_TOKEN_TTL_MS = 1000 * 60 * 15;
const RESET_RESPONSE_MESSAGE = "If an account with that email exists, a password reset link has been sent.";
const normalizeEmail = (value) => typeof value === "string" ? value.trim().toLowerCase() : "";
const isGmailAddress = (value) => normalizeEmail(value).endsWith("@gmail.com");

const getFrontendBaseUrl = (origin) =>
  process.env.FRONTEND_URL ||
  process.env.CLIENT_URL ||
  process.env.APP_URL ||
  origin ||
  "http://localhost:5173";

const buildResetLink = (email, token, origin) => {
  const resetUrl = new URL(getFrontendBaseUrl(origin));
  resetUrl.searchParams.set("mode", "reset");
  resetUrl.searchParams.set("token", token);
  resetUrl.searchParams.set("email", email);
  return resetUrl.toString();
};

const sendPasswordResetEmail = async (email, resetLink) => {
  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_SERVICE,
    SMTP_USER,
    SMTP_PASS,
    SMTP_SECURE,
    MAIL_FROM,
    NODE_ENV
  } = process.env;

  const effectiveService = SMTP_SERVICE || (isGmailAddress(SMTP_USER) ? "gmail" : "");
  const hasMailTransport = Boolean(SMTP_HOST || effectiveService);

  if (!SMTP_USER || !SMTP_PASS || !hasMailTransport) {
    console.warn("Password reset email skipped because SMTP is not configured.");

    if (NODE_ENV === "production") {
      throw new Error("Password reset email is not configured.");
    }

    console.info(`Password reset link for ${email}: ${resetLink}`);
    return { previewUrl: resetLink };
  }

  const nodemailer = (await import("nodemailer")).default;
  const transportConfig = {
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS
    }
  };

  if (effectiveService) transportConfig.service = effectiveService;
  if (SMTP_HOST) transportConfig.host = SMTP_HOST;
  if (SMTP_PORT) transportConfig.port = Number(SMTP_PORT);
  if (SMTP_HOST || SMTP_PORT) {
    transportConfig.secure = SMTP_SECURE === "true" || Number(SMTP_PORT) === 465;
  }

  const transporter = nodemailer.createTransport(transportConfig);

  await transporter.sendMail({
    from: MAIL_FROM || SMTP_USER,
    to: email,
    subject: "Reset your FinTrack Pro password",
    text: `Reset your FinTrack Pro password using this link: ${resetLink}\n\nThis link expires in 15 minutes.`,
    html: `
      <div style="font-family: Inter, Arial, sans-serif; color: #0f172a; line-height: 1.6;">
        <h2 style="margin-bottom: 12px;">Reset your FinTrack Pro password</h2>
        <p>We received a request to reset your password.</p>
        <p>
          <a
            href="${resetLink}"
            style="display: inline-block; padding: 12px 18px; border-radius: 10px; background: #6c63ff; color: #ffffff; text-decoration: none; font-weight: 700;"
          >
            Reset Password
          </a>
        </p>
        <p>This link expires in 15 minutes. If you did not request this, you can ignore this email.</p>
      </div>
    `
  });

  return {};
};

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(400).json({ message: "User already exists." });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name || "",
      email: normalizedEmail,
      password: hashed
    });

    res.status(201).json({
      message: "Account created successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ message: "Registration failed" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(400).json({ message: "Invalid email" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign({ id: user._id }, SECRET, { expiresIn: "7d" });

    res.json({
      token,
      role: user.role,
      name: user.name,
      email: user.email,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Login failed" });
  }
});

router.post("/forgot-password", async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);

    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ message: RESET_RESPONSE_MESSAGE });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    const resetLink = buildResetLink(user.email, resetToken, req.headers.origin);

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = new Date(Date.now() + RESET_TOKEN_TTL_MS);
    await user.save();

    try {
      const delivery = await sendPasswordResetEmail(user.email, resetLink);
      return res.json({
        message: RESET_RESPONSE_MESSAGE,
        ...(delivery.previewUrl ? { previewUrl: delivery.previewUrl } : {})
      });
    } catch (mailErr) {
      user.passwordResetToken = null;
      user.passwordResetExpires = null;
      await user.save();
      throw mailErr;
    }
  } catch (err) {
    console.error("FORGOT PASSWORD ERROR:", err);
    res.status(500).json({ message: err.message || "Failed to send reset email." });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const { token, newPassword } = req.body;

    if (!email || !token || !newPassword) {
      return res.status(400).json({ message: "Email, token, and new password are required." });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      email,
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ message: "This reset link is invalid or has expired." });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save();

    res.json({ message: "Password reset successful. Please sign in with your new password." });
  } catch (err) {
    console.error("RESET PASSWORD ERROR:", err);
    res.status(500).json({ message: "Password reset failed." });
  }
});

router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    console.error("PROFILE ERROR:", err);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
});

router.put("/me", authMiddleware, async (req, res) => {
  try {
    const { name } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name: name || "" },
      { new: true }
    ).select("-password");

    res.json(user);
  } catch (err) {
    console.error("UPDATE PROFILE ERROR:", err);
    res.status(500).json({ message: "Update failed" });
  }
});

router.post("/change-password", authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Both passwords required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Min 6 characters required" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Wrong current password" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save();

    res.json({ message: "Password updated" });
  } catch (err) {
    console.error("CHANGE PASSWORD ERROR:", err);
    res.status(500).json({ message: "Password change failed" });
  }
});

export default router;
