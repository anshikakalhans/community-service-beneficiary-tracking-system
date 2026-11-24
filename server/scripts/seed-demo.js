import { loadConfig } from "../config.js";
import { connectDb, disconnectDb } from "../db.js";
import { Donation, Beneficiary, Assistance, PendingSupport } from "../models.js";

const config = loadConfig();
if (!config.mongoUri) {
  console.log("MONGODB_URI is not set. Add it to .env first.");
  process.exit(1);
}

await connectDb(config.mongoUri);

if ((await Donation.countDocuments()) > 0 && !process.argv.includes("--force")) {
  console.log("The database already has donations. Run with --force to add demo data anyway.");
  await disconnectDb();
  process.exit(0);
}

const ago = (days) => new Date(Date.now() - days * 86400000);
const day = (days) => ago(days).toISOString().slice(0, 10);

await Donation.insertMany([
  { donorName: "Rohan Mehta", email: "rohan@example.com", amount: 2500, cause: "Education for All", createdAt: ago(1), emailStatus: "sent" },
  { donorName: "Priya Sharma", email: "priya@example.com", amount: 1000, cause: "Healthcare Support", createdAt: ago(2), emailStatus: "sent" },
  { donorName: "Anonymous", email: "anon@example.com", amount: 5000, cause: "Tree Plantation", anonymous: true, createdAt: ago(3), emailStatus: "sent" },
  { donorName: "Aman Verma", email: "aman@example.com", amount: 750, cause: "Animal Welfare", createdAt: ago(4), emailStatus: "sent" },
  { donorName: "Neha Kapoor", email: "neha@example.com", amount: 1500, cause: "Education for All", createdAt: ago(6), emailStatus: "sent" },
]);

await Beneficiary.insertMany([
  { name: "Demo Beneficiary A", age: 12, contact: "9000000001", address: "Demo address, Delhi", support: "School books and uniform" },
  { name: "Demo Beneficiary B", age: 34, contact: "9000000002", address: "Demo address, Delhi", support: "Monthly ration" },
  { name: "Demo Beneficiary C", age: 8, contact: "9000000003", address: "Demo address, Delhi", support: "Learning materials" },
]);

await Assistance.insertMany([
  { beneficiary: "Demo Beneficiary A", type: "Educational Support", date: day(5), description: "Books and stationery provided" },
  { beneficiary: "Demo Beneficiary B", type: "Food Support", date: day(9), description: "One month of ration" },
]);

await PendingSupport.insertMany([
  { beneficiary: "Demo Beneficiary C", requiredSupport: "School bag and notebooks", priority: "High", description: "Needed before the new term" },
]);

console.log("Demo data added. These records are fake, so delete them before going live.");
await disconnectDb();
