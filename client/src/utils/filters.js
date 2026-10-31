// Clean up whatever the user typed: trim, collapse spaces, lowercase.
// Anything that isn't a string becomes "" (which means "no filter").
import { getStatus } from "./fees.js";

export function normalizeQuery(query) {
  if (typeof query !== "string") return "";
  return query.trim().replace(/\s+/g, " ").toLowerCase();
}

// Keep students whose name OR guardian contains the query.
// Uses includes(), not a regex, so characters like ( or * are treated as plain text.
export function searchStudents(students, query) {
  if (!Array.isArray(students)) return [];
  const q = normalizeQuery(query);
  if (!q) return students;

  return students.filter((s) => {
    const name = String(s?.name ?? "").toLowerCase();
    const guardian = String(s?.guardian ?? "").toLowerCase();
    return name.includes(q) || guardian.includes(q);
  });
}

export const STATUS_OPTIONS = ["All", "Paid", "Partial", "Unpaid"];

// Keep students with the chosen status. "All" (or anything unknown) means no filter.
export function filterByStatus(students, status) {
  if (!Array.isArray(students)) return [];
  if (!STATUS_OPTIONS.includes(status) || status === "All") return students;
  return students.filter((s) => getStatus(s) === status);
}
