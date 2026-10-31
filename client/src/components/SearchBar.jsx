export default function SearchBar({
  value,
  onChange,
  placeholder = "Search...",
}) {
  return (
    <div className="relative w-full sm:max-w-sm">
      <svg
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <circle cx="11" cy="11" r="7" />
        <path strokeLinecap="round" d="M21 21l-4.3-4.3" />
      </svg>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={50}
        aria-label="Search students"
        className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-9 text-sm text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
      />

      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-600"
          aria-label="Clear search"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      )}
    </div>
  );
}
