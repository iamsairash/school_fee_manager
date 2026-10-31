export default function FormField({
  label,
  name,
  value,
  onChange,
  error,
  required,
  ...inputProps
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-1 block text-sm font-medium text-slate-700"
      >
        {label}
        {required && <span className="text-rose-500"> *</span>}
      </label>
      <input
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        aria-invalid={error ? "true" : "false"}
        className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 ${
          error
            ? "border-rose-400 focus:ring-rose-200"
            : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-200"
        }`}
        {...inputProps}
      />
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
    </div>
  );
}
