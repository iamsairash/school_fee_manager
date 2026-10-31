export default function ClearFiltersButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-200"
    >
      Clear filters
    </button>
  );
}
