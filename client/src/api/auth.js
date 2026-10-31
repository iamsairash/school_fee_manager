import { request } from "./http";

// notifyOnUnauthorized is off here: a 401 from these calls is expected, not an "expired session"
export function login(email, password) {
  return request("/api/auth/login", {
    method: "POST",
    body: { email, password },
    notifyOnUnauthorized: false,
  });
}

export function logout() {
  return request("/api/auth/logout", {
    method: "POST",
    notifyOnUnauthorized: false,
  });
}

export function getCurrentUser(signal) {
  return request("/api/auth/me", { signal, notifyOnUnauthorized: false });
}