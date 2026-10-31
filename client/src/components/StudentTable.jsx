import StatusBadge from "./StatusBadge";
import { formatCurrency, getOutstanding, getStatus } from "../utils/fees";

const headers = [
  "Student",
  "Grade",
  "Guardian",
  "Total Fee",
  "Paid",
  "Outstanding",
  "Status",
  "Action",
];

export default function StudentTable({
  students,
  totalCount,
  emptyMessage = "No students to show.",
  onRecordPayment,
  onEdit,
  onDelete,
}) {
  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <h2 className="text-base font-semibold text-slate-800">Students</h2>
        <p className="text-sm text-slate-500">
          Showing {students.length} of {totalCount}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              {headers.map((h) => (
                <th key={h} className="whitespace-nowrap px-5 py-3 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {students.length === 0 ? (
              <tr>
                <td
                  colSpan={headers.length}
                  className="px-5 py-12 text-center text-slate-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              students.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="whitespace-nowrap px-5 py-3 font-medium text-slate-800">
                    {s.name}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 text-slate-600">
                    {s.grade}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 text-slate-600">
                    {s.guardian}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 text-slate-600">
                    {formatCurrency(s.totalFee)}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 text-slate-600">
                    {formatCurrency(s.paid)}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 text-slate-600">
                    {formatCurrency(getOutstanding(s))}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3">
                    <StatusBadge status={getStatus(s)} />
                  </td>
                  <td className="whitespace-nowrap px-5 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onRecordPayment?.(s)}
                        disabled={getOutstanding(s) === 0}
                        className="rounded-md border border-slate-200 px-3 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-transparent"
                      >
                        Record payment
                      </button>
                      <button
                        type="button"
                        onClick={() => onEdit?.(s)}
                        className="rounded-md border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete?.(s)}
                        className="rounded-md border border-rose-200 px-3 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
