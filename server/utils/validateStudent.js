const MAX_TEXT = 60;
const MAX_AMOUNT = 10_000_000;

function cleanText(value) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
}

// null = not provided, NaN = invalid, otherwise a number
function toNumber(value) {
  if (value === undefined || value === null) return null;
  if (typeof value === "string" && value.trim() === "") return null;
  if (typeof value !== "number" && typeof value !== "string") return NaN;
  return Number(value);
}

// Returns { errors, data }. Only the known fields are copied into `data`,
// so extra fields sent by a client (like _id or role) are ignored.
export function validateStudentInput(body) {
  const input =
    body && typeof body === "object" && !Array.isArray(body) ? body : {};
  const errors = {};

  const name = cleanText(input.name);
  const grade = cleanText(input.grade);
  const guardian = cleanText(input.guardian);

  if (!name) errors.name = "Name is required.";
  else if (name.length > MAX_TEXT)
    errors.name = `Name must be ${MAX_TEXT} characters or fewer.`;
  if (grade.length > MAX_TEXT)
    errors.grade = `Grade must be ${MAX_TEXT} characters or fewer.`;
  if (guardian.length > MAX_TEXT)
    errors.guardian = `Guardian must be ${MAX_TEXT} characters or fewer.`;

  const totalFee = toNumber(input.totalFee);
  if (totalFee === null) errors.totalFee = "Total fee is required.";
  else if (!Number.isFinite(totalFee) || totalFee <= 0)
    errors.totalFee = "Enter an amount greater than 0.";
  else if (totalFee > MAX_AMOUNT) errors.totalFee = "That amount is too large.";

  let paid = toNumber(input.paid);
  if (paid === null) paid = 0; // blank means nothing paid yet
  if (!Number.isFinite(paid) || paid < 0)
    errors.paid = "Enter 0 or a positive amount.";
  else if (Number.isFinite(totalFee) && totalFee !== null && paid > totalFee) {
    errors.paid = "Paid can't be more than the total fee.";
  }

  return {
    errors,
    data: {
      name,
      grade: grade || "—",
      guardian: guardian || "—",
      totalFee,
      paid,
    },
  };
}
// Same rules as creating a student, but without the "paid" field.
// Reuses validateStudentInput so the two can never drift apart.
export function validateStudentUpdate(body) {
  const input =
    body && typeof body === "object" && !Array.isArray(body) ? body : {};
  const { errors, data } = validateStudentInput({ ...input, paid: 0 });
  const { paid, ...fields } = data; // drop paid: edits must never change it
  return { errors, data: fields };
}
