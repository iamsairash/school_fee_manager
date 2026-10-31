import { useState } from "react";
import FormField from "./FormField";
import { formatCurrency } from "../utils/fees";
import {
  emptyForm,
  validateStudentForm,
  validateStudentEdit,
  toPayload,
  toEditPayload,
} from "../utils/studentForm";

export default function StudentForm({
  onSubmit,
  onCancel,
  initialValues = emptyForm,
  submitLabel = "Add student",
  editing = false,
  alreadyPaid = 0,
}) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [saving, setSaving] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
    setErrors((errs) => ({ ...errs, [name]: undefined }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (saving) return;

    const found = editing
      ? validateStudentEdit(values, alreadyPaid)
      : validateStudentForm(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSaving(true);
    setSubmitError("");
    try {
      await onSubmit(editing ? toEditPayload(values) : toPayload(values));
    } catch (err) {
      setSubmitError(err.message);
      if (err.fields) setErrors(err.fields);
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <FormField
        label="Student name"
        name="name"
        value={values.name}
        onChange={handleChange}
        error={errors.name}
        required
        maxLength={60}
        autoFocus
      />
      <div className="grid grid-cols-2 gap-4">
        <FormField
          label="Grade"
          name="grade"
          value={values.grade}
          onChange={handleChange}
          error={errors.grade}
          maxLength={60}
          placeholder="Grade 5"
        />
        <FormField
          label="Guardian"
          name="guardian"
          value={values.guardian}
          onChange={handleChange}
          error={errors.guardian}
          maxLength={60}
        />
      </div>

      {editing ? (
        <div>
          <FormField
            label="Total fee (Rs.)"
            name="totalFee"
            type="number"
            min="0"
            step="any"
            value={values.totalFee}
            onChange={handleChange}
            error={errors.totalFee}
            required
          />
          <p className="mt-1 text-xs text-slate-400">
            Already paid: {formatCurrency(alreadyPaid)}. To add a payment, use
            "Record payment".
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="Total fee (Rs.)"
            name="totalFee"
            type="number"
            min="0"
            step="any"
            value={values.totalFee}
            onChange={handleChange}
            error={errors.totalFee}
            required
          />
          <FormField
            label="Paid so far (Rs.)"
            name="paid"
            type="number"
            min="0"
            step="any"
            value={values.paid}
            onChange={handleChange}
            error={errors.paid}
            placeholder="0"
          />
        </div>
      )}

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
          {saving ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
