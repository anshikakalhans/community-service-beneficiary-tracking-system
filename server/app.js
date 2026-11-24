import express from "express";
import cors from "cors";
import { connectDb } from "./db.js";
import { bootstrapAdmin } from "./admin.js";
import { authenticate, HttpError, wrap } from "./middleware.js";
import { authRoutes } from "./routes/auth.js";
import { donationRoutes } from "./routes/donations.js";
import { recordRoutes } from "./routes/records.js";
import { proofRoutes } from "./routes/proofs.js";

export function createApp({ config, mailer }) {
  const app = express();
  app.disable("x-powered-by");
  app.set("trust proxy", 1);

  app.use(
    cors({
      origin: (origin, done) => done(null, !origin || config.corsOrigins.includes(origin)),
    }),
  );
  app.use((req, res, next) => {
    res.set({ "X-Content-Type-Options": "nosniff", "Referrer-Policy": "strict-origin-when-cross-origin" });
    next();
  });
  app.use(express.json({ limit: "4mb" }));

  app.use("/api", (req, res, next) => {
    if (config.problems.length) {
      return res.status(500).json({ error: `Server is not configured: ${config.problems.join(", ")}.` });
    }
    next();
  });

  app.use(
    "/api",
    wrap(async (req, res, next) => {
      try {
        await connectDb(config.mongoUri);
        await bootstrapAdmin(config.admin);
      } catch (error) {
        console.error("[db] connection failed:", error.message);
        throw new HttpError(503, "Cannot connect to the database. Check MONGODB_URI and the Atlas Network Access list.");
      }
      next();
    }),
  );

  app.use("/api", authenticate(config));

  app.get("/api/health", (req, res) => res.json({ ok: true, database: "connected" }));
  app.use("/api/auth", authRoutes(config));
  app.use("/api", donationRoutes({ config, mailer }));
  app.use("/api", recordRoutes());
  app.use("/api", proofRoutes({ config, mailer }));

  app.use("/api", (req, res) => res.status(404).json({ error: "Not found." }));

  app.use((error, req, res, next) => {
    if (error instanceof HttpError) return res.status(error.status).json({ error: error.message });
    if (error?.type === "entity.too.large") return res.status(413).json({ error: "The upload is too large." });
    if (error?.type === "entity.parse.failed") return res.status(400).json({ error: "Invalid JSON." });
    if (error?.name === "ValidationError") return res.status(400).json({ error: Object.values(error.errors)[0]?.message || "Invalid data." });
    console.error(error);
    res.status(500).json({ error: "Something went wrong on the server." });
  });

  return app;
}
