import { loadConfig } from "./config.js";
import { createMailer } from "./mailer.js";
import { createApp } from "./app.js";

const config = loadConfig();
const app = createApp({ config, mailer: createMailer(config) });

app.listen(config.port, () => {
  console.log(`Tripti Foundation API running on http://localhost:${config.port}`);
  if (config.problems.length) console.log(`[setup] ${config.problems.join(", ")}. Copy .env.example to .env and fill it in.`);
  if (!config.smtp.host) console.log("[setup] SMTP is not configured, so thank-you emails are only logged here.");
});
