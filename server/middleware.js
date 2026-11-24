import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { User } from "./models.js";

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

export const text = (value, max = 200) => String(value ?? "").trim().slice(0, max);

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export const signToken = (user, secret) => jwt.sign({ sub: String(user._id) }, secret, { expiresIn: "7d" });

export const authenticate = (config) =>
  wrap(async (req, res, next) => {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : "";
    req.user = null;
    if (token) {
      try {
        const payload = jwt.verify(token, config.jwtSecret);
        if (mongoose.isValidObjectId(payload.sub)) req.user = await User.findById(payload.sub).lean();
      } catch {
        req.user = null;
      }
    }
    next();
  });

export const requireUser = (req, res, next) =>
  req.user ? next() : next(new HttpError(401, "Please log in to continue."));

export const requireAdmin =
  (message = "Only admin can add or change this information") =>
  (req, res, next) => {
    if (!req.user) return next(new HttpError(401, "Please log in to continue."));
    if (req.user.role !== "admin") return next(new HttpError(403, message));
    next();
  };

export const validId = (id) => {
  if (!mongoose.isValidObjectId(id)) throw new HttpError(404, "Not found.");
  return id;
};

export const limitParam = (value, fallback = 100) =>
  Math.min(Math.max(parseInt(value || String(fallback), 10) || fallback, 1), 500);
