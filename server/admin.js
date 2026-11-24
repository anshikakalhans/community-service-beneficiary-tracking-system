import bcrypt from "bcryptjs";
import { User } from "./models.js";

export const hashPassword = (password) => bcrypt.hash(password, 10);

export async function upsertAdmin({ name, email, password }) {
  const mail = String(email).trim().toLowerCase();
  const passwordHash = await hashPassword(password);
  const existing = await User.findOne({ email: mail });
  if (existing) {
    existing.role = "admin";
    existing.passwordHash = passwordHash;
    if (name) existing.name = name;
    await existing.save();
    return { id: String(existing._id), created: false };
  }
  const user = await User.create({ name: name || "NGO Admin", email: mail, passwordHash, role: "admin" });
  return { id: String(user._id), created: true };
}

let bootstrapped = false;

export async function bootstrapAdmin(admin) {
  if (bootstrapped || !admin.email || !admin.password) return null;
  bootstrapped = true;
  const exists = await User.exists({ role: "admin" });
  if (exists) return null;
  return upsertAdmin(admin);
}

export const resetBootstrap = () => {
  bootstrapped = false;
};
