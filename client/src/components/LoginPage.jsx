import { useState } from "react";
import FormField from "./FormField";

export default function LoginPage({ onLogin }) {
  const [values, setValues] = useState({ email: "", password: "" });
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

    const email = values.email.trim();
    const found = {};
    if (!email) found.email = "Email is required.";
    else if (!/^\S+@\S+\.\S+$/.test(email))
      found.email = "Enter a valid email address.";
    if (!values.password) found.password = "Password is required.";
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSaving(true);
    setSubmitError("");
    try {
      await onLogin(email, values.password); // on success the page switches to the dashboard
    } catch (err) {
      setSubmitError(err.message);
      setValues((v) => ({ ...v, password: "" })); // clear the password after a failed try
      setSaving(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-800">Fee Manager</h1>
        <p className="mt-1 text-sm text-slate-500">Log in to continue.</p>

        <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
          <FormField
            label="Email"
            name="email"
            type="email"
            autoComplete="username"
            value={values.email}
            onChange={handleChange}
            error={errors.email}
            maxLength={120}
            required
            autoFocus
          />
          <FormField
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={values.password}
            onChange={handleChange}
            error={errors.password}
            maxLength={200}
            required
          />

          {submitError && (
            <p
              role="alert"
              className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700"
            >
              {submitError}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Logging in..." : "Log in"}
          </button>
        </form>
      </div>
    </div>
  );
}
