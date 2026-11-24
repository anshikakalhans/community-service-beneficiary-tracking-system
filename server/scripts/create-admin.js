import { loadConfig } from "../config.js";
import { connectDb, disconnectDb } from "../db.js";
import { upsertAdmin } from "../admin.js";

const [name, email, password] = process.argv.slice(2);
const config = loadConfig();

if (!email || !password) {
  console.log('Usage: npm run create-admin -- "Member Name" member@ngo.org "Password"');
  process.exit(1);
}
if (!config.mongoUri) {
  console.log("MONGODB_URI is not set. Add it to .env first.");
  process.exit(1);
}

await connectDb(config.mongoUri);
const result = await upsertAdmin({ name, email, password });
console.log(result.created ? `Created admin ${email}` : `Updated existing account ${email} to admin`);
await disconnectDb();
