// Turn anything into a safe, non-negative number (invalid input becomes 0)
function toAmount(value) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export function calculateTotals(students) {
  // Handle empty or invalid input: not an array, null, undefined
  if (!Array.isArray(students)) {
    return { totalStudents: 0, collected: 0, outstanding: 0 };
  }

  let collected = 0;
  let outstanding = 0;

  for (const s of students) {
    const totalFee = toAmount(s?.totalFee);
    // A student can't have paid more than the fee for this calculation
    const paid = Math.min(toAmount(s?.paid), totalFee);
    collected += paid;
    outstanding += totalFee - paid;
  }

  return { totalStudents: students.length, collected, outstanding };
}

// 151000 -> "Rs. 1,51,000"
export function formatCurrency(amount) {
  return `Rs. ${toAmount(amount).toLocaleString("en-IN")}`;
}

// Outstanding amount for one student (never negative)
export function getOutstanding(student) {
  const totalFee = toAmount(student?.totalFee);
  const paid = Math.min(toAmount(student?.paid), totalFee);
  return totalFee - paid;
}

// "Paid" | "Partial" | "Unpaid"
export function getStatus(student) {
  const totalFee = toAmount(student?.totalFee);
  const paid = toAmount(student?.paid);
  if (totalFee > 0 && paid >= totalFee) return "Paid";
  if (paid > 0) return "Partial";
  return "Unpaid";
}
