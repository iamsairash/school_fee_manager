import mongoose from "mongoose";

// Use 127.0.0.1 rather than "localhost" to avoid IPv6 lookup problems on newer Node versions.
// Set MONGODB_URI in the environment to point somewhere else (for example Atlas).
const MONGODB_URI =
  process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/school_fee_manager";

export async function connectDB() {
  // Fail after 5 seconds instead of hanging if MongoDB isn't running
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
  console.log("MongoDB connected");
}
