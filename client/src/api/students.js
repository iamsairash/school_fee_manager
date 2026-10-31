import { request } from "./http";

export async function fetchStudents(signal) {
  const data = await request("/api/students", { signal });
  if (!Array.isArray(data))
    throw new Error("The server sent data in an unexpected format.");
  return data;
}

// Failures throw an Error; err.fields holds per-field messages when the server rejected the input
export function createStudent(payload) {
  return request("/api/students", { method: "POST", body: payload });
}

export function recordPayment(id, amount) {
  return request(`/api/students/${encodeURIComponent(id)}/payments`, {
    method: "PATCH",
    body: { amount },
  });
}

export function updateStudent(id, payload) {
  return request(`/api/students/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: payload,
  });
}

export function deleteStudent(id) {
  return request(`/api/students/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
