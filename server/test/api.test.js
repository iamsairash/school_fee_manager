import { describe, it, before, beforeEach, after } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import app from "../app.js";
import Student from "../models/Student.js";
import {
  connectTestDB,
  resetDB,
  disconnectDB,
  loggedInAgent,
  TEST_EMAIL,
  TEST_PASSWORD,
} from "./helpers.js";

const MISSING_ID = "000000000000000000000000";

before(async () => {
  await connectTestDB();
  await resetDB();
});

after(disconnectDB);

describe("authentication", () => {
  it("health check is public", async () => {
    const res = await request(app).get("/api/health");
    assert.equal(res.status, 200);
    assert.equal(res.body.database, "connected");
  });

  it("students routes return 401 without a login", async () => {
    assert.equal((await request(app).get("/api/students")).status, 401);
    assert.equal(
      (
        await request(app)
          .post("/api/students")
          .send({ name: "A", totalFee: 1 })
      ).status,
      401,
    );
    assert.equal(
      (await request(app).delete(`/api/students/${MISSING_ID}`)).status,
      401,
    );
  });

  it("rejects a forged token", async () => {
    const res = await request(app)
      .get("/api/students")
      .set("Cookie", "token=abc.def.ghi");
    assert.equal(res.status, 401);
  });

  it("gives the same 401 message for a wrong password and an unknown email", async () => {
    const wrong = await request(app)
      .post("/api/auth/login")
      .send({ email: TEST_EMAIL, password: "wrong-password" });
    const unknown = await request(app)
      .post("/api/auth/login")
      .send({ email: "nobody@example.com", password: "whatever1" });
    assert.equal(wrong.status, 401);
    assert.equal(unknown.status, 401);
    assert.equal(wrong.body.error, unknown.body.error);
  });

  it("rejects an object instead of an email (injection attempt)", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: { $gt: "" }, password: "x" });
    assert.equal(res.status, 400);
  });

  it("logs in with an httpOnly cookie, then /me works, then logout locks it again", async () => {
    const agent = request.agent(app);
    const login = await agent
      .post("/api/auth/login")
      .send({ email: TEST_EMAIL, password: TEST_PASSWORD });
    assert.equal(login.status, 200);
    assert.deepEqual(login.body, { email: TEST_EMAIL });
    assert.match(login.headers["set-cookie"].join(";"), /HttpOnly/i);

    assert.equal((await agent.get("/api/auth/me")).body.email, TEST_EMAIL);
    assert.equal((await agent.get("/api/students")).status, 200);

    await agent.post("/api/auth/logout");
    assert.equal((await agent.get("/api/students")).status, 401);
  });
});

describe("students API", () => {
  let agent;

  before(async () => {
    agent = await loggedInAgent(app);
  });

  // Every test starts with an empty students collection
  beforeEach(async () => {
    await Student.deleteMany({});
  });

  describe("GET /api/students", () => {
    it("returns an empty list, then students with id and no _id or __v", async () => {
      assert.deepEqual((await agent.get("/api/students")).body, []);

      await Student.create([
        { name: "Aarav", totalFee: 1000, paid: 1000 },
        { name: "Sita", totalFee: 2000, paid: 500 },
      ]);
      const res = await agent.get("/api/students");
      assert.equal(res.status, 200);
      assert.equal(res.body.length, 2);
      assert.equal(typeof res.body[0].id, "string");
      assert.equal("_id" in res.body[0], false);
      assert.equal("__v" in res.body[0], false);
    });
  });

  describe("POST /api/students", () => {
    it("creates a student, cleans the name and ignores extra fields", async () => {
      const res = await agent.post("/api/students").send({
        name: "  Test   Student ",
        grade: "Grade 1",
        guardian: "Guardian",
        totalFee: 10000,
        paid: 2500,
        role: "admin",
      });
      assert.equal(res.status, 201);
      assert.equal(res.body.name, "Test Student");
      assert.equal(res.body.paid, 2500);
      assert.equal("role" in res.body, false);
      assert.equal(await Student.countDocuments(), 1);
    });

    it("defaults a blank paid to 0", async () => {
      const res = await agent
        .post("/api/students")
        .send({ name: "A", totalFee: 5000 });
      assert.equal(res.status, 201);
      assert.equal(res.body.paid, 0);
    });

    it("returns 400 with field messages for invalid input and saves nothing", async () => {
      const res = await agent
        .post("/api/students")
        .send({ name: "  ", totalFee: "abc" });
      assert.equal(res.status, 400);
      assert.deepEqual(Object.keys(res.body.fields).sort(), [
        "name",
        "totalFee",
      ]);
      assert.equal(await Student.countDocuments(), 0);
    });

    it("rejects paid above the total fee", async () => {
      const res = await agent
        .post("/api/students")
        .send({ name: "X", totalFee: 1000, paid: 5000 });
      assert.equal(res.status, 400);
      assert.ok(res.body.fields.paid);
    });

    it("returns 400 for broken JSON", async () => {
      const res = await agent
        .post("/api/students")
        .set("Content-Type", "application/json")
        .send("{bad");
      assert.equal(res.status, 400);
      assert.equal(res.body.error, "Invalid JSON in request body");
    });
  });

  describe("PATCH /api/students/:id/payments", () => {
    it("adds a payment", async () => {
      const s = await Student.create({
        name: "Sita",
        totalFee: 30000,
        paid: 15000,
      });
      const res = await agent
        .patch(`/api/students/${s.id}/payments`)
        .send({ amount: 5000 });
      assert.equal(res.status, 200);
      assert.equal(res.body.paid, 20000);
    });

    it("refuses a payment above the outstanding balance", async () => {
      const s = await Student.create({
        name: "Sita",
        totalFee: 30000,
        paid: 15000,
      });
      const res = await agent
        .patch(`/api/students/${s.id}/payments`)
        .send({ amount: 20000 });
      assert.equal(res.status, 400);
      assert.match(res.body.error, /outstanding balance/);
      assert.equal((await Student.findById(s.id)).paid, 15000);
    });

    it("rejects invalid amounts", async () => {
      const s = await Student.create({ name: "Sita", totalFee: 30000 });
      for (const amount of [-5, 0, "abc", undefined]) {
        const res = await agent
          .patch(`/api/students/${s.id}/payments`)
          .send({ amount });
        assert.equal(res.status, 400, `amount ${amount} should be rejected`);
      }
    });

    it("returns 400 for a bad id and 404 for an unknown student", async () => {
      assert.equal(
        (await agent.patch("/api/students/123/payments").send({ amount: 100 }))
          .status,
        400,
      );
      assert.equal(
        (
          await agent
            .patch(`/api/students/${MISSING_ID}/payments`)
            .send({ amount: 100 })
        ).status,
        404,
      );
    });

    it("lets only one of two simultaneous payments through when both can't fit", async () => {
      const s = await Student.create({ name: "Race", totalFee: 1000, paid: 0 });
      const [a, b] = await Promise.all([
        agent.patch(`/api/students/${s.id}/payments`).send({ amount: 600 }),
        agent.patch(`/api/students/${s.id}/payments`).send({ amount: 600 }),
      ]);
      assert.deepEqual([a.status, b.status].sort(), [200, 400]);
      assert.equal((await Student.findById(s.id)).paid, 600);
    });
  });

  describe("PATCH /api/students/:id (edit)", () => {
    it("edits the details but never the paid amount", async () => {
      const s = await Student.create({
        name: "Sita",
        totalFee: 30000,
        paid: 15000,
      });
      const res = await agent.patch(`/api/students/${s.id}`).send({
        name: "  Sita   Edited ",
        grade: "Grade 8",
        guardian: "Gopal",
        totalFee: 40000,
        paid: 99999,
      });
      assert.equal(res.status, 200);
      assert.equal(res.body.name, "Sita Edited");
      assert.equal(res.body.totalFee, 40000);
      assert.equal(res.body.paid, 15000);
    });

    it("refuses a total fee below what was already paid", async () => {
      const s = await Student.create({
        name: "Sita",
        totalFee: 30000,
        paid: 15000,
      });
      const res = await agent
        .patch(`/api/students/${s.id}`)
        .send({ name: "Sita", totalFee: 10000 });
      assert.equal(res.status, 400);
      assert.ok(res.body.fields.totalFee);
      assert.equal((await Student.findById(s.id)).totalFee, 30000);
    });

    it("rejects invalid input, a bad id, and an unknown student", async () => {
      const s = await Student.create({ name: "Sita", totalFee: 30000 });
      assert.equal(
        (
          await agent
            .patch(`/api/students/${s.id}`)
            .send({ name: " ", totalFee: "abc" })
        ).status,
        400,
      );
      assert.equal(
        (
          await agent
            .patch("/api/students/123")
            .send({ name: "X", totalFee: 1000 })
        ).status,
        400,
      );
      assert.equal(
        (
          await agent
            .patch(`/api/students/${MISSING_ID}`)
            .send({ name: "X", totalFee: 1000 })
        ).status,
        404,
      );
    });
  });

  describe("DELETE /api/students/:id", () => {
    it("deletes a student, then returns 404 the second time", async () => {
      const s = await Student.create({ name: "Delete Me", totalFee: 1000 });
      const first = await agent.delete(`/api/students/${s.id}`);
      assert.equal(first.status, 200);
      assert.deepEqual(first.body, { id: s.id });
      assert.equal(await Student.countDocuments(), 0);
      assert.equal((await agent.delete(`/api/students/${s.id}`)).status, 404);
    });

    it("returns 400 for a bad id", async () => {
      assert.equal((await agent.delete("/api/students/123")).status, 400);
    });
  });
});
