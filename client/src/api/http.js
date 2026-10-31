const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

// Every API call goes through here. It always sends the login cookie,
// turns failures into readable Errors, and announces expired logins.
export async function request(
  path,
  { method = "GET", body, signal, notifyOnUnauthorized = true } = {},
) {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      credentials: "include", // send and receive the cookie
      headers:
        body !== undefined ? { "Content-Type": "application/json" } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (err) {
    if (err.name === "AbortError") throw err;
    throw new Error("Could not reach the server. Is it running?");
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    // no readable body; handled below
  }

  if (!response.ok) {
    if (response.status === 401 && notifyOnUnauthorized) {
      window.dispatchEvent(new Event("auth:expired")); // App.jsx shows the login page
    }
    // Server-side (5xx) messages stay generic
    const message = response.status < 500 ? data?.error : undefined;
    const err = new Error(
      message ?? `The server returned an error (${response.status}).`,
    );
    err.status = response.status;
    err.fields = data?.fields;
    throw err;
  }

  if (data === null)
    throw new Error("The server sent a response that could not be read.");
  return data;
}
