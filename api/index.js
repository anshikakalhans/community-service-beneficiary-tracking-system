import { loadConfig } from "../server/config.js";
import { createMailer } from "../server/mailer.js";
import { createApp } from "../server/app.js";

const config = loadConfig();

export default createApp({ config, mailer: createMailer(config) });
