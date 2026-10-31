// Full class names are written out so Tailwind can detect them
const styles = {
  Paid: "bg-emerald-50 text-emerald-700",
  Partial: "bg-amber-50 text-amber-700",
  Unpaid: "bg-rose-50 text-rose-700",
};

export default function StatusBadge({ status }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
        styles[status] ?? "bg-slate-100 text-slate-600"
      }`}
    >
      {status}
    </span>
  );
}
