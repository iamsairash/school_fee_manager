// Returns an error message, or "" if the amount is valid.
export function validatePaymentAmount(text, outstanding) {
  const value = String(text).trim();
  if (value === "") return "Enter the payment amount.";

  const amount = Number(value);
  if (!Number.isFinite(amount)) return "Enter a valid amount.";
  if (amount <= 0) return "Enter an amount greater than 0.";
  if (amount > outstanding) return "That is more than the outstanding balance.";
  return "";
}
