import mongoose from "mongoose";
import { connectDB } from "./db.js";
import Student from "./models/Student.js";
import { students } from "./data/students.js";

if (process.env.NODE_ENV === "production") {
  console.error(
    "Refusing to seed: NODE_ENV is production. Seeding deletes every student.",
  );
  process.exit(1);
}

async function seed() {
  await connectDB();

  // WARNING: this deletes every student in the database before inserting
  await Student.deleteMany({});

  // Remove the old numeric ids, so MongoDB creates its own
  const docs = students.map(({ id, ...rest }) => rest);
  const created = await Student.insertMany(docs);

  console.log(`Seeded ${created.length} students`);
  await mongoose.disconnect();
}

seed().catch(async (err) => {
  console.error("Seeding failed:", err.message);
  await mongoose.disconnect();
  process.exit(1);
});
