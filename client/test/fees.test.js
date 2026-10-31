import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  calculateTotals,
  formatCurrency,
  getOutstanding,
  getStatus,
} from "../src/utils/fees.js";

describe("calculateTotals", () => {
  it("returns zeros for empty or invalid input", () => {
    const zero = { totalStudents: 0, collected: 0, outstanding: 0 };
    assert.deepEqual(calculateTotals([]), zero);
    assert.deepEqual(calculateTotals(null), zero);
    assert.deepEqual(calculateTotals("abc"), zero);
  });

  it("treats bad numbers as 0 and caps overpayment at the fee", () => {
    const result = calculateTotals([
      { totalFee: 1000, paid: 400 },
      { totalFee: "abc", paid: -5 },
      { totalFee: 500, paid: 900 },
    ]);
    assert.deepEqual(result, {
      totalStudents: 3,
      collected: 900,
      outstanding: 600,
    });
  });
});

describe("formatCurrency", () => {
  it("uses Indian digit grouping", () => {
    assert.equal(formatCurrency(151000), "Rs. 1,51,000");
  });
  it("turns invalid or negative values into Rs. 0", () => {
    assert.equal(formatCurrency("abc"), "Rs. 0");
    assert.equal(formatCurrency(-5), "Rs. 0");
    assert.equal(formatCurrency(undefined), "Rs. 0");
  });
});

describe("getStatus", () => {
  it("returns Paid, Partial or Unpaid", () => {
    assert.equal(getStatus({ totalFee: 1000, paid: 1000 }), "Paid");
    assert.equal(getStatus({ totalFee: 1000, paid: 1500 }), "Paid");
    assert.equal(getStatus({ totalFee: 1000, paid: 300 }), "Partial");
    assert.equal(getStatus({ totalFee: 1000, paid: 0 }), "Unpaid");
  });
  it("treats an empty object as Unpaid", () => {
    assert.equal(getStatus({}), "Unpaid");
  });
});

describe("getOutstanding", () => {
  it("never goes below zero", () => {
    assert.equal(getOutstanding({ totalFee: 1000, paid: 1500 }), 0);
    assert.equal(getOutstanding({ totalFee: 1000, paid: 250 }), 750);
  });
});
