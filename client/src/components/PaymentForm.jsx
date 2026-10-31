import { useState } from "react";
import FormField from "./FormField";
import { formatCurrency, getOutstanding } from "../utils/fees";
import { validatePaymentAmount } from "../utils/paymentForm";

export default function PaymentForm({ student, onSubmit, onCancel }) {
  const outstanding = getOutstanding(student);
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (saving) return;

    const found = validatePaymentAmount(amount, outstanding);
    setError(found);
    if (found) return;

    setSaving(true);
    setSubmitError("");
    try {
      await onSubmit(Number(amount)); // the parent closes the dialog on success
    } catch (err) {
      setSubmitError(err.message);
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div className="rounded-lg bg-slate-50 px-4 py-3 text-sm">
        <p className="font-medium text-slate-800">{student.name}</p>
        <p className="mt-1 text-slate-500">
          Outstanding:{" "}
          <span className="font-semibold text-slate-800">
            {formatCurrency(outstanding)}
          </span>
        </p>
      </div>

      <FormField
        label="Payment amount (Rs.)"
        name="amount"
        type="number"
        min="0"
        step="any"
        value={amount}
        onChange={(e) => {
          setAmount(e.target.value);
          setError("");
        }}
        error={error}
        required
        autoFocus
      />

      <button
        type="button"
        onClick={() => {
          setAmount(String(outstanding));
          setError("");
        }}
        className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
      >
        Pay full balance
      </button>

      {submitError && (
        <p
          role="alert"
          className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700"
        >
          {submitError}
        </p>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Saving..." : "Record payment"}
        </button>
      </div>
    </form>
  );
}
