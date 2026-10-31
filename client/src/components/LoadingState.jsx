export default function LoadingState({ message = "Loading students..." }) {
  return (
    <div
      role="status"
      className="flex flex-col items-center justify-center rounded-xl bg-white py-20 shadow-sm"
    >
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />
      <p className="mt-4 text-sm text-slate-500">{message}</p>
    </div>
  );
}
