import { useCallback, useEffect, useState } from "react";
import {
  fetchStudents,
  createStudent,
  recordPayment,
  updateStudent,
  deleteStudent,
} from "../api/students";
import { sanitizeStudents } from "../utils/validate";

export default function useStudents() {
  const [state, setState] = useState({
    students: [],
    skipped: 0,
    loading: true,
    error: null,
  });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setState((s) => ({ ...s, loading: true, error: null }));

    fetchStudents(controller.signal)
      .then((raw) => {
        const { students, skipped } = sanitizeStudents(raw);
        setState({ students, skipped, loading: false, error: null });
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        setState({
          students: [],
          skipped: 0,
          loading: false,
          error: err.message,
        });
      });

    return () => controller.abort();
  }, [attempt]);

  const reload = useCallback(() => setAttempt((n) => n + 1), []);

  // Saves on the server first, then adds the saved student to the list.
  // Errors are thrown so the form can show them.
  const addStudent = useCallback(async (payload) => {
    const created = await createStudent(payload);
    const { students: clean } = sanitizeStudents([created]);
    setState((s) => ({ ...s, students: [...s.students, ...clean] }));
  }, []);

  // Saves the payment, then replaces that student in the list with the server's version
  const payStudent = useCallback(async (id, amount) => {
    const updated = await recordPayment(id, amount);
    const { students: clean } = sanitizeStudents([updated]);
    if (clean.length === 0) return;
    setState((s) => ({
      ...s,
      students: s.students.map((st) => (st.id === clean[0].id ? clean[0] : st)),
    }));
  }, []);

  // Saves the edit, then swaps the server's version into the list
  const editStudent = useCallback(async (id, payload) => {
    const updated = await updateStudent(id, payload);
    const { students: clean } = sanitizeStudents([updated]);
    if (clean.length === 0) return;
    setState((s) => ({
      ...s,
      students: s.students.map((st) => (st.id === clean[0].id ? clean[0] : st)),
    }));
  }, []);

  // Deletes on the server, then removes the student from the list
  const removeStudent = useCallback(async (id) => {
    try {
      await deleteStudent(id);
    } catch (err) {
      // Already gone (deleted elsewhere): the goal is reached, so just update the list
      if (err.status !== 404) throw err;
    }
    setState((s) => ({
      ...s,
      students: s.students.filter((st) => st.id !== id),
    }));
  }, []);

  return {
    ...state,
    reload,
    addStudent,
    payStudent,
    editStudent,
    removeStudent,
  };
}
