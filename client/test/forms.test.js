import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  emptyForm,
  validateStudentForm,
  validateStudentEdit,
  toPayload,
  studentToForm,
} from "../src/utils/studentForm.js";
import { validatePaymentAmount } from "../src/utils/paymentForm.js";

const valid = {
  name: "Meera Joshi",
  grade: "Grade 6",
  guardian: "Hari",
  totalFee: "20000",
  paid: "5000",
};

describe("validateStudentForm", () => {
  it("accepts a valid form", () => {
    assert.deepEqual(validateStudentForm(valid), {});
  });
  it("requires a name and a fee", () => {
    const errors = validateStudentForm(emptyForm);
    assert.deepEqual(Object.keys(errors).sort(), ["name", "totalFee"]);
  });
  it("rejects a zero or non-numeric fee", () => {
    assert.ok(validateStudentForm({ ...valid, totalFee: "0" }).totalFee);
    assert.ok(validateStudentForm({ ...valid, totalFee: "abc" }).totalFee);
  });
  it("rejects paid above the fee, and treats blank paid as 0", () => {
    assert.ok(
      validateStudentForm({ ...valid, totalFee: "1000", paid: "5000" }).paid,
    );
    assert.deepEqual(validateStudentForm({ ...valid, paid: "" }), {});
  });
  it("rejects names that are too long", () => {
    assert.ok(validateStudentForm({ ...valid, name: "x".repeat(61) }).name);
  });
});

describe("toPayload and studentToForm", () => {
  it("builds the API payload from form text", () => {
    assert.deepEqual(toPayload({ ...valid, name: "  Meera  ", paid: "" }), {
      name: "Meera",
      grade: "Grade 6",
      guardian: "Hari",
      totalFee: 20000,
      paid: 0,
    });
  });
  it("shows the dash placeholder as an empty box when editing", () => {
    const form = studentToForm({
      name: "A",
      grade: "—",
      guardian: "—",
      totalFee: 100,
      paid: 0,
    });
    assert.equal(form.grade, "");
    assert.equal(form.guardian, "");
  });
});

describe("validateStudentEdit", () => {
  it("rejects a fee below the amount already paid", () => {
    const errors = validateStudentEdit({ ...valid, totalFee: "10000" }, 15000);
    assert.match(errors.totalFee, /already paid/);
  });
  it("accepts a fee equal to the amount paid", () => {
    assert.deepEqual(
      validateStudentEdit({ ...valid, totalFee: "15000" }, 15000),
      {},
    );
  });
});

describe("validatePaymentAmount", () => {
  it("accepts amounts up to the outstanding balance", () => {
    assert.equal(validatePaymentAmount("5000", 15000), "");
    assert.equal(validatePaymentAmount("15000", 15000), "");
  });
  it("rejects empty, zero, negative, text and too-large amounts", () => {
    assert.ok(validatePaymentAmount("", 15000));
    assert.ok(validatePaymentAmount("0", 15000));
    assert.ok(validatePaymentAmount("-5", 15000));
    assert.ok(validatePaymentAmount("abc", 15000));
    assert.ok(validatePaymentAmount("20000", 15000));
  });
});
