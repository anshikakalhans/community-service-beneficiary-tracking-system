import { Router } from "express";
import bcrypt from "bcryptjs";
import { User } from "../models.js";
import { hashPassword } from "../admin.js";
import { HttpError, wrap, text, EMAIL_RE, signToken, requireUser } from "../middleware.js";
import { userOut } from "../serialize.js";

export function authRoutes(config) {
  const router = Router();
  const attempts = new Map();

  const checkRate = (key) => {
    const rec = attempts.get(key);
    if (rec && rec.reset > Date.now() && rec.count >= 10) {
      throw new HttpError(429, "Too many attempts. Please try again in a few minutes.");
    }
  };
  const noteFailure = (key) => {
    const rec = attempts.get(key);
    if (!rec || rec.reset <= Date.now()) attempts.set(key, { count: 1, reset: Date.now() + 15 * 60 * 1000 });
    else rec.count += 1;
  };

  router.post(
    "/signup",
    wrap(async (req, res) => {
      const name = text(req.body.name, 80);
      const email = text(req.body.email, 120).toLowerCase();
      const password = String(req.body.password || "");
      if (!name) throw new HttpError(400, "Please enter your name.");
      if (!EMAIL_RE.test(email)) throw new HttpError(400, "Please enter a valid email address.");
      if (password.length < 6) throw new HttpError(400, "Password must contain at least 6 characters.");
      if (await User.exists({ email })) throw new HttpError(409, "An account with this email already exists.");
      const user = await User.create({ name, email, passwordHash: await hashPassword(password), role: "donor" });
      res.status(201).json({ token: signToken(user, config.jwtSecret), user: userOut(user) });
    }),
  );

  router.post(
    "/login",
    wrap(async (req, res) => {
      const email = text(req.body.email, 120).toLowerCase();
      const key = `${req.ip}|${email}`;
      checkRate(key);
      const user = await User.findOne({ email });
      const ok = user && (await bcrypt.compare(String(req.body.password || ""), user.passwordHash));
      if (!ok) {
        noteFailure(key);
        throw new HttpError(401, "Invalid email or password. Please create an account first.");
      }
      attempts.delete(key);
      res.json({ token: signToken(user, config.jwtSecret), user: userOut(user) });
    }),
  );

  router.get("/me", requireUser, (req, res) => res.json({ user: userOut(req.user) }));

  router.put(
    "/me",
    requireUser,
    wrap(async (req, res) => {
      const name = text(req.body.name, 80);
      const email = text(req.body.email, 120).toLowerCase();
      if (!name) throw new HttpError(400, "Please enter your name.");
      if (!EMAIL_RE.test(email)) throw new HttpError(400, "Please enter a valid email address.");
      if (await User.exists({ email, _id: { $ne: req.user._id } })) {
        throw new HttpError(409, "Another account already uses this email.");
      }
      const user = await User.findByIdAndUpdate(req.user._id, { name, email }, { new: true });
      res.json({ user: userOut(user) });
    }),
  );

  router.put(
    "/password",
    requireUser,
    wrap(async (req, res) => {
      const current = String(req.body.currentPassword || "");
      const next = String(req.body.newPassword || "");
      if (next.length < 6) throw new HttpError(400, "New password must contain at least 6 characters.");
      const user = await User.findById(req.user._id);
      if (!(await bcrypt.compare(current, user.passwordHash))) {
        throw new HttpError(400, "Your current password is not correct.");
      }
      user.passwordHash = await hashPassword(next);
      await user.save();
      res.json({ ok: true });
    }),
  );

  return router;
}
