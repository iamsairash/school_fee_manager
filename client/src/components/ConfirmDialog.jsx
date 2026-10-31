import { useState } from "react";
import Modal from "./Modal";

export default function ConfirmDialog({
  title,
  message,
  confirmLabel = "Delete",
  onConfirm,
  onCancel,
}) {
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");

  async function handleConfirm() {
    if (working) return;
    setWorking(true);
    setError("");
    try {
      await onConfirm(); // the parent closes the dialog on success
    } catch (err) {
      setError(err.message);
      setWorking(false);
    }
  }

  return (
    // While a request is running, Escape and the overlay do nothing
    <Modal title={title} onClose={working ? () => {} : onCancel}>
      <p className="text-sm text-slate-600">{message}</p>

      {error && (
        <p
          role="alert"
          className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700"
        >
          {error}
        </p>
      )}

      <div className="mt-6 flex justify-end gap-3">
        {/* Cancel gets the focus, so pressing Enter by accident never deletes */}
        <button
          type="button"
          onClick={onCancel}
          disabled={working}
          autoFocus
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-60"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={working}
          className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {working ? "Deleting..." : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
