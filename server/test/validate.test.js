import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  validateStudentInput,
  validateStudentUpdate,
} from "../utils/validateStudent.js";
import { validatePaymentInput } from "../utils/validatePayment.js";

describe("validateStudentInput", () => {
  it("cleans the text, converts numbers and ignores extra fields", () => {
    const { errors, data } = validateStudentInput({
      name: "  Test   Student ",
      totalFee: "10000",
      paid: 2500,
      role: "admin",
    });
    assert.deepEqual(errors, {});
    assert.deepEqual(data, {
      name: "Test Student",
      grade: "—",
      guardian: "—",
      totalFee: 10000,
      paid: 2500,
    });
  });

  it("requires a name and a fee, even for a null body", () => {
    const { errors } = validateStudentInput(null);
    assert.deepEqual(Object.keys(errors).sort(), ["name", "totalFee"]);
  });

  it("rejects text, zero and huge fees", () => {
    assert.ok(
      validateStudentInput({ name: "A", totalFee: "abc" }).errors.totalFee,
    );
    assert.ok(validateStudentInput({ name: "A", totalFee: 0 }).errors.totalFee);
    assert.ok(
      validateStudentInput({ name: "A", totalFee: 99_999_999 }).errors.totalFee,
    );
  });

  it("rejects paid above the fee or below zero, and defaults blank paid to 0", () => {
    assert.ok(
      validateStudentInput({ name: "A", totalFee: 1000, paid: 5000 }).errors
        .paid,
    );
    assert.ok(
      validateStudentInput({ name: "A", totalFee: 1000, paid: -1 }).errors.paid,
    );
    assert.equal(
      validateStudentInput({ name: "A", totalFee: 1000, paid: "" }).data.paid,
      0,
    );
  });

  it("rejects names longer than 60 characters", () => {
    assert.ok(
      validateStudentInput({ name: "x".repeat(61), totalFee: 1000 }).errors
        .name,
    );
  });
});

describe("validateStudentUpdate", () => {
  it("never returns a paid field", () => {
    const { errors, data } = validateStudentUpdate({
      name: "A",
      totalFee: 1000,
      paid: 99999,
    });
    assert.deepEqual(errors, {});
    assert.equal("paid" in data, false);
  });
});

describe("validatePaymentInput", () => {
  it("accepts numbers and numeric text", () => {
    assert.deepEqual(validatePaymentInput({ amount: 5000 }), {
      error: "",
      amount: 5000,
    });
    assert.deepEqual(validatePaymentInput({ amount: "250" }), {
      error: "",
      amount: 250,
    });
  });
  it("rounds to 2 decimals", () => {
    assert.equal(validatePaymentInput({ amount: 0.1 + 0.2 }).amount, 0.3);
  });
  it("rejects missing, zero, negative, text, object and huge amounts", () => {
    for (const body of [
      undefined,
      {},
      { amount: "" },
      { amount: 0 },
      { amount: -5 },
      { amount: "abc" },
      { amount: { $gt: 0 } },
      { amount: 10_000_001 },
    ]) {
      assert.ok(
        validatePaymentInput(body).error,
        `should reject ${JSON.stringify(body)}`,
      );
    }
  });
});
