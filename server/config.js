import "dotenv/config";

export function loadConfig(overrides = {}) {
  const env = process.env;
  const production = env.NODE_ENV === "production" || Boolean(env.VERCEL);
  const vercelUrl = env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${env.VERCEL_PROJECT_PRODUCTION_URL}` : "";
  const frontendUrl = (env.FRONTEND_URL || vercelUrl || "http://localhost:5173").replace(/\/$/, "");

  const config = {
    production,
    port: Number(env.PORT || 5000),
    ngoName: env.NGO_NAME || "Tripti Foundation",
    frontendUrl,
    corsOrigins: [frontendUrl, ...(env.CORS_ORIGIN || "").split(",").map((s) => s.trim()).filter(Boolean)],
    mongoUri: env.MONGODB_URI || "",
    jwtSecret: env.JWT_SECRET || (production ? "" : "dev-only-secret-change-me"),
    smtp: {
      host: env.SMTP_HOST || "",
      port: Number(env.SMTP_PORT || 465),
      user: env.SMTP_USER || "",
      pass: env.SMTP_PASS || "",
    },
    mailFrom: env.MAIL_FROM || env.SMTP_USER || "no-reply@example.org",
    admin: {
      name: env.ADMIN_NAME || "NGO Admin",
      email: env.ADMIN_EMAIL || "",
      password: env.ADMIN_PASSWORD || "",
    },
    ...overrides,
  };

  config.problems = [];
  if (!config.mongoUri) config.problems.push("MONGODB_URI is not set");
  if (!config.jwtSecret) config.problems.push("JWT_SECRET is not set");
  return config;
}
