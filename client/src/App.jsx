import { useEffect, useState } from "react";
import Dashboard from "./Dashboard";
import LoginPage from "./components/LoginPage";
import LoadingState from "./components/LoadingState";
import ErrorState from "./components/ErrorState";
import { getCurrentUser, login, logout } from "./api/auth";

export default function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [startupError, setStartupError] = useState("");

  // On page load, ask the server whether the cookie is still valid
  useEffect(() => {
    const controller = new AbortController();
    getCurrentUser(controller.signal)
      .then(setUser)
      .catch((err) => {
        if (err.name === "AbortError") return;
        if (err.status !== 401) setStartupError(err.message); // 401 just means "not logged in"
      })
      .finally(() => {
        if (!controller.signal.aborted) setChecking(false);
      });
    return () => controller.abort();
  }, []);

  // Any protected request that comes back 401 sends the user to the login page
  useEffect(() => {
    const onExpired = () => setUser(null);
    window.addEventListener("auth:expired", onExpired);
    return () => window.removeEventListener("auth:expired", onExpired);
  }, []);

  async function handleLogin(email, password) {
    setUser(await login(email, password)); // throws on failure, and the form shows it
  }

  async function handleLogout() {
    try {
      await logout();
    } catch {
      // even if the server can't be reached, leave the dashboard
    }
    setUser(null);
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-slate-100 p-6">
        <LoadingState message="Checking your session..." />
      </div>
    );
  }

  if (startupError && !user) {
    return (
      <div className="min-h-screen bg-slate-100 p-6">
        <ErrorState
          message={startupError}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  if (!user) return <LoginPage onLogin={handleLogin} />;

  return <Dashboard user={user} onLogout={handleLogout} />;
}
