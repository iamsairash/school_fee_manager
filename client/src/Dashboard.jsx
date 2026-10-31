import { useState } from "react";
import Sidebar from "./components/Sidebar";
import StatCard from "./components/StatCard";
import StudentTable from "./components/StudentTable";
import SearchBar from "./components/SearchBar";
import FilterSelect from "./components/FilterSelect";
import ClearFiltersButton from "./components/ClearFiltersButton";
import Alert from "./components/Alert";
import LoadingState from "./components/LoadingState";
import ErrorState from "./components/ErrorState";
import useStudents from "./hooks/useStudents";
import { calculateTotals, formatCurrency } from "./utils/fees";
import {
  searchStudents,
  filterByStatus,
  normalizeQuery,
  STATUS_OPTIONS,
} from "./utils/filters";
import Modal from "./components/Modal";
import StudentForm from "./components/StudentForm";
import PaymentForm from "./components/PaymentForm";
import ConfirmDialog from "./components/ConfirmDialog";
import { studentToForm } from "./utils/studentForm";

export default function Dashboard({ user, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [showAdd, setShowAdd] = useState(false);
  const [payingId, setPayingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const {
    students,
    skipped,
    loading,
    error,
    reload,
    addStudent,
    payStudent,
    editStudent,
    removeStudent,
  } = useStudents();
  const { totalStudents, collected, outstanding } = calculateTotals(students);
  const visibleStudents = filterByStatus(
    searchStudents(students, query),
    status,
  );

  const hasQuery = normalizeQuery(query) !== "";
  const hasStatus = status !== "All";
  const showClear = query !== "" || hasStatus;

  let emptyMessage = "No students have been added yet.";
  if (hasQuery && hasStatus) {
    emptyMessage = `No ${status} students match "${query.trim()}".`;
  } else if (hasQuery) {
    emptyMessage = `No students match "${query.trim()}". Try a different name.`;
  } else if (hasStatus && students.length > 0) {
    emptyMessage = `No students have the status "${status}".`;
  }

  function clearFilters() {
    setQuery("");
    setStatus("All");
  }

  async function handleAdd(payload) {
    await addStudent(payload); // throws on failure, and the form shows the error
    setShowAdd(false);
  }

  // Look the student up from the list, so the dialog always shows current data
  const payingStudent = students.find((s) => s.id === payingId) ?? null;

  async function handlePayment(amount) {
    await payStudent(payingId, amount); // throws on failure, and the form shows the error
    setPayingId(null);
  }
  const editingStudent = students.find((s) => s.id === editingId) ?? null;
  const deletingStudent = students.find((s) => s.id === deletingId) ?? null;

  async function handleEdit(payload) {
    await editStudent(editingId, payload); // throws on failure, and the form shows it
    setEditingId(null);
  }

  async function handleDelete() {
    await removeStudent(deletingId);
    setDeletingId(null);
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-md p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            aria-label="Open menu"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-xl font-semibold text-slate-800">Dashboard</h1>

          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-sm text-slate-500 sm:inline">
              {user.email}
            </span>
            <button
              type="button"
              onClick={onLogout}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-800"
            >
              Log out
            </button>
          </div>
        </header>

        <main className="p-4 sm:p-6">
          {loading ? (
            <LoadingState />
          ) : error ? (
            <ErrorState message={error} onRetry={reload} />
          ) : (
            <>
              {skipped > 0 && (
                <Alert>
                  {skipped} {skipped === 1 ? "record was" : "records were"}{" "}
                  skipped because of missing or invalid data.
                </Alert>
              )}

              <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <StatCard
                  title="Total Students"
                  value={totalStudents}
                  hint="Enrolled this term"
                  accent="indigo"
                />
                <StatCard
                  title="Fees Collected"
                  value={formatCurrency(collected)}
                  hint="Payments received"
                  accent="green"
                />
                <StatCard
                  title="Outstanding Fees"
                  value={formatCurrency(outstanding)}
                  hint="Still to be paid"
                  accent="red"
                />
              </section>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <SearchBar
                  value={query}
                  onChange={setQuery}
                  placeholder="Search by student or guardian"
                />
                <div className="flex flex-wrap items-center gap-3">
                  <FilterSelect
                    label="Status"
                    value={status}
                    options={STATUS_OPTIONS}
                    onChange={setStatus}
                  />
                  {showClear && <ClearFiltersButton onClick={clearFilters} />}
                  <button
                    type="button"
                    onClick={() => setShowAdd(true)}
                    className="whitespace-nowrap rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  >
                    + Add student
                  </button>
                </div>
              </div>

              <div className="mt-4">
                <StudentTable
                  students={visibleStudents}
                  totalCount={students.length}
                  emptyMessage={emptyMessage}
                  onRecordPayment={(student) => setPayingId(student.id)}
                  onEdit={(student) => setEditingId(student.id)}
                  onDelete={(student) => setDeletingId(student.id)}
                />
                {showAdd && (
                  <Modal title="Add student" onClose={() => setShowAdd(false)}>
                    <StudentForm
                      onSubmit={handleAdd}
                      onCancel={() => setShowAdd(false)}
                    />
                  </Modal>
                )}
                {payingStudent && (
                  <Modal
                    title="Record payment"
                    onClose={() => setPayingId(null)}
                  >
                    <PaymentForm
                      student={payingStudent}
                      onSubmit={handlePayment}
                      onCancel={() => setPayingId(null)}
                    />
                  </Modal>
                )}
                {editingStudent && (
                  <Modal
                    title="Edit student"
                    onClose={() => setEditingId(null)}
                  >
                    <StudentForm
                      editing
                      initialValues={studentToForm(editingStudent)}
                      alreadyPaid={editingStudent.paid}
                      submitLabel="Save changes"
                      onSubmit={handleEdit}
                      onCancel={() => setEditingId(null)}
                    />
                  </Modal>
                )}

                {deletingStudent && (
                  <ConfirmDialog
                    title="Delete student"
                    message={`Delete ${deletingStudent.name}? This permanently removes the student and their payment record (${formatCurrency(deletingStudent.paid)} paid). This can't be undone.`}
                    onConfirm={handleDelete}
                    onCancel={() => setDeletingId(null)}
                  />
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
