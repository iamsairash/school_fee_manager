import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { sanitizeStudents } from "../src/utils/validate.js";

describe("sanitizeStudents", () => {
  it("repairs fixable rows and skips unusable ones", () => {
    const raw = [
      {
        id: 1,
        name: "  Asha   Rai ",
        grade: "Grade 1",
        guardian: "Ram",
        totalFee: "1000",
        paid: "400",
      },
      null,
      "text",
      { id: 1, name: "Duplicate id", totalFee: 1, paid: 0 },
      { id: 2, name: "   " },
      { name: "No id" },
      { id: 3, name: "Messy", totalFee: "abc", paid: -5 },
    ];
    const { students, skipped } = sanitizeStudents(raw);

    assert.equal(skipped, 5);
    assert.equal(students.length, 2);
    assert.deepEqual(students[0], {
      id: 1,
      name: "Asha Rai",
      grade: "Grade 1",
      guardian: "Ram",
      totalFee: 1000,
      paid: 400,
    });
    assert.deepEqual(students[1], {
      id: 3,
      name: "Messy",
      grade: "—",
      guardian: "—",
      totalFee: 0,
      paid: 0,
    });
  });

  it("returns an empty result when the input is not an array", () => {
    assert.deepEqual(sanitizeStudents(null), { students: [], skipped: 0 });
  });
});
