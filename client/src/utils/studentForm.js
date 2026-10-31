import { formatCurrency } from "./fees.js";

export const emptyForm = {
  name: "",
  grade: "",
  guardian: "",
  totalFee: "",
  paid: "",
};

const MAX_TEXT = 60;

// Returns an object like { name: "Name is required." }. Empty object = valid.
export function validateStudentForm(values) {
  const errors = {};
  const name = values.name.trim();

  if (!name) errors.name = "Name is required.";
  else if (name.length > MAX_TEXT)
    errors.name = `Name must be ${MAX_TEXT} characters or fewer.`;
  if (values.grade.trim().length > MAX_TEXT)
    errors.grade = `Grade must be ${MAX_TEXT} characters or fewer.`;
  if (values.guardian.trim().length > MAX_TEXT)
    errors.guardian = `Guardian must be ${MAX_TEXT} characters or fewer.`;

  const feeText = String(values.totalFee).trim();
  const totalFee = Number(feeText);
  const feeValid = feeText !== "" && Number.isFinite(totalFee) && totalFee > 0;
  if (feeText === "") errors.totalFee = "Total fee is required.";
  else if (!feeValid) errors.totalFee = "Enter an amount greater than 0.";

  const paidText = String(values.paid).trim();
  const paid = paidText === "" ? 0 : Number(paidText);
  if (!Number.isFinite(paid) || paid < 0)
    errors.paid = "Enter 0 or a positive amount.";
  else if (feeValid && paid > totalFee)
    errors.paid = "Paid can't be more than the total fee.";

  return errors;
}

// Turns the form's text values into the object the API expects
export function toPayload(values) {
  return {
    name: values.name.trim(),
    grade: values.grade.trim(),
    guardian: values.guardian.trim(),
    totalFee: Number(values.totalFee),
    paid: values.paid.trim() === "" ? 0 : Number(values.paid),
  };
}

// Turns a saved student into the text values the form works with
export function studentToForm(student) {
  const blankIfDash = (v) => (v === "—" ? "" : String(v ?? ""));
  return {
    name: String(student.name ?? ""),
    grade: blankIfDash(student.grade),
    guardian: blankIfDash(student.guardian),
    totalFee: String(student.totalFee ?? ""),
    paid: String(student.paid ?? ""),
  };
}

// Same checks as adding, minus "paid", plus: the fee can't drop below what was paid
export function validateStudentEdit(values, alreadyPaid) {
  const errors = validateStudentForm({ ...values, paid: "" });
  const fee = Number(String(values.totalFee).trim());
  if (!errors.totalFee && fee < alreadyPaid) {
    errors.totalFee = `Total fee can't be less than the ${formatCurrency(alreadyPaid)} already paid.`;
  }
  return errors;
}

// Payload for an edit: no "paid", because payments have their own route
export function toEditPayload(values) {
  return {
    name: values.name.trim(),
    grade: values.grade.trim(),
    guardian: values.guardian.trim(),
    totalFee: Number(values.totalFee),
  };
}
