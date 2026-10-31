// Full class names are written out so Tailwind can detect them
const accents = {
  indigo: "bg-indigo-50 text-indigo-600",
  green: "bg-emerald-50 text-emerald-600",
  red: "bg-rose-50 text-rose-600",
};

export default function StatCard({ title, value, hint, accent = "indigo" }) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <span
          className={`h-3 w-3 rounded-full ${accents[accent] ?? accents.indigo}`}
        />
      </div>
      <p className="mt-2 text-2xl font-semibold text-slate-800">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}
