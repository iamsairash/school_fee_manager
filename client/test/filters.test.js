import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  normalizeQuery,
  searchStudents,
  filterByStatus,
} from "../src/utils/filters.js";

const sample = [
  {
    id: 1,
    name: "Aarav Sharma",
    guardian: "Ramesh Sharma",
    totalFee: 1000,
    paid: 1000,
  },
  {
    id: 2,
    name: "Sita Thapa",
    guardian: "Gopal Thapa",
    totalFee: 1000,
    paid: 500,
  },
  { id: 3, name: "Bikash Rai", guardian: "Maya Rai", totalFee: 1000, paid: 0 },
];

describe("normalizeQuery", () => {
  it("trims, collapses spaces and lowercases", () => {
    assert.equal(normalizeQuery("  A   B "), "a b");
  });
  it("returns an empty string for non-strings", () => {
    assert.equal(normalizeQuery(5), "");
    assert.equal(normalizeQuery(null), "");
  });
});

describe("searchStudents", () => {
  it("returns everyone for an empty or invalid query", () => {
    assert.equal(searchStudents(sample, "").length, 3);
    assert.equal(searchStudents(sample, null).length, 3);
  });
  it("ignores capitals and extra spaces", () => {
    assert.deepEqual(
      searchStudents(sample, "  SITA  ").map((s) => s.id),
      [2],
    );
  });
  it("searches the guardian name too", () => {
    assert.deepEqual(
      searchStudents(sample, "gopal").map((s) => s.id),
      [2],
    );
  });
  it("treats special characters as plain text", () => {
    assert.equal(searchStudents(sample, "(*[").length, 0);
  });
  it("returns [] when the list is not an array", () => {
    assert.deepEqual(searchStudents(null, "a"), []);
  });
});

describe("filterByStatus", () => {
  it("filters by each status", () => {
    assert.deepEqual(
      filterByStatus(sample, "Paid").map((s) => s.id),
      [1],
    );
    assert.deepEqual(
      filterByStatus(sample, "Partial").map((s) => s.id),
      [2],
    );
    assert.deepEqual(
      filterByStatus(sample, "Unpaid").map((s) => s.id),
      [3],
    );
  });
  it("treats All and unknown values as no filter", () => {
    assert.equal(filterByStatus(sample, "All").length, 3);
    assert.equal(filterByStatus(sample, "banana").length, 3);
  });
  it("combines with search", () => {
    const found = filterByStatus(searchStudents(sample, "thapa"), "Partial");
    assert.deepEqual(
      found.map((s) => s.id),
      [2],
    );
    assert.equal(
      filterByStatus(searchStudents(sample, "bikash"), "Partial").length,
      0,
    );
  });
});
