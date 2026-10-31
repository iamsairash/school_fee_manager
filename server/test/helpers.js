import assert from "node:assert/strict";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import request from "supertest";
import { connectDB } from "../db.js";
import User from "../models/User.js";
import Student from "../models/Student.js";

export const TEST_EMAIL = "tester@example.com";
export const TEST_PASSWORD = "test-password-123";

// Connects, then REFUSES to continue unless the database name ends in "_test"
export async function connectTestDB() {
  await connectDB();
  const name = mongoose.connection.name;
  if (!name.endsWith("_test")) {
    await mongoose.disconnect();
    throw new Error(
      `Refusing to run tests on database "${name}". Its name must end in "_test". Check server/.env.test.`,
    );
  }
}

// Empties both collections and creates one known admin user
export async function resetDB() {
  await Student.deleteMany({});
  await User.deleteMany({});
  // Low bcrypt cost keeps the tests fast; the real app uses 12
  await User.create({
    email: TEST_EMAIL,
    passwordHash: await bcrypt.hash(TEST_PASSWORD, 4),
  });
}

export async function disconnectDB() {
  await mongoose.disconnect();
}

// A supertest "agent" remembers cookies, like a browser
export async function loggedInAgent(app) {
  const agent = request.agent(app);
  const res = await agent
    .post("/api/auth/login")
    .send({ email: TEST_EMAIL, password: TEST_PASSWORD });
  assert.equal(res.status, 200, "test login failed");
  return agent;
}
