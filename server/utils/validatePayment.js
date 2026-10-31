const MAX_AMOUNT = 10_000_000;

// Returns { error, amount }. error is "" when the input is valid.
export function validatePaymentInput(body) {
  const input =
    body && typeof body === "object" && !Array.isArray(body) ? body : {};
  const raw = input.amount;

  if (
    raw === undefined ||
    raw === null ||
    (typeof raw === "string" && raw.trim() === "")
  ) {
    return { error: "Enter the payment amount.", amount: 0 };
  }
  if (typeof raw !== "number" && typeof raw !== "string") {
    return { error: "Enter a valid amount.", amount: 0 };
  }

  const n = Number(raw);
  if (!Number.isFinite(n)) return { error: "Enter a valid amount.", amount: 0 };

  // Round to 2 decimals to avoid floating point surprises like 0.1 + 0.2
  const amount = Math.round(n * 100) / 100;
  if (amount <= 0)
    return { error: "Enter an amount greater than 0.", amount: 0 };
  if (amount > MAX_AMOUNT)
    return { error: "That amount is too large.", amount: 0 };

  return { error: "", amount };
}
