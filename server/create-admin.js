import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { connectDB } from "./db.js";
import User from "./models/User.js";

const email = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD ?? "";

async function run() {
  if (!/^\S+@\S+\.\S+$/.test(email))
    throw new Error("ADMIN_EMAIL must be a valid email address.");
  if (password.length < 8 || password.length > 72) {
    throw new Error(
      "ADMIN_PASSWORD must be 8 to 72 characters (bcrypt ignores anything longer).",
    );
  }

  await connectDB();
  const passwordHash = await bcrypt.hash(password, 12);

  // Creates the admin, or resets the password if that email already exists
  await User.findOneAndUpdate(
    { email },
    { email, passwordHash },
    { upsert: true },
  );
  console.log(`Admin ready: ${email}`);
  await mongoose.disconnect();
}

run().catch(async (err) => {
  console.error("Failed:", err.message);
  await mongoose.disconnect();
  process.exit(1);
});
