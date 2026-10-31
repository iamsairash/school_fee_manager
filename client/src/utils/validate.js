const MAX_TEXT = 60;

// Accepts strings and numbers only. Trims, collapses spaces, caps the length.
function cleanText(value, fallback = "") {
  if (typeof value !== "string" && typeof value !== "number") return fallback;
  const text = String(value).trim().replace(/\s+/g, " ").slice(0, MAX_TEXT);
  return text || fallback;
}

// Invalid, negative or missing amounts become 0
function cleanAmount(value) {
  if (typeof value !== "number" && typeof value !== "string") return 0;
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function isValidId(id) {
  return (
    (typeof id === "number" && Number.isFinite(id)) ||
    (typeof id === "string" && id.trim() !== "")
  );
}

// Returns { students, skipped }.
// A row is skipped if it isn't an object, has no usable id, repeats an id,
// or has no name. Other bad fields are repaired instead of skipped.
export function sanitizeStudents(rawStudents) {
  if (!Array.isArray(rawStudents)) return { students: [], skipped: 0 };

  const seen = new Set();
  const students = [];

  for (const row of rawStudents) {
    const isObject =
      row !== null && typeof row === "object" && !Array.isArray(row);
    if (!isObject || !isValidId(row.id)) continue;

    const key = String(row.id).trim();
    const name = cleanText(row.name);
    if (!name || seen.has(key)) continue;
    seen.add(key);

    students.push({
      id: row.id,
      name,
      grade: cleanText(row.grade, "—"),
      guardian: cleanText(row.guardian, "—"),
      totalFee: cleanAmount(row.totalFee),
      paid: cleanAmount(row.paid),
    });
  }

  return { students, skipped: rawStudents.length - students.length };
}
