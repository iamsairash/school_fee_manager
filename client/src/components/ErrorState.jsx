export default function ErrorState({ message, onRetry }) {
  return (
    <div
      role="alert"
      className="rounded-xl border border-rose-200 bg-white px-6 py-12 text-center shadow-sm"
    >
      <h2 className="text-base font-semibold text-slate-800">
        Something went wrong
      </h2>
      <p className="mt-2 text-sm text-slate-500">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
      >
        Try again
      </button>
    </div>
  );
}
