export default function Alert({ children }) {
  return (
    <div
      role="alert"
      className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
    >
      {children}
    </div>
  );
}
