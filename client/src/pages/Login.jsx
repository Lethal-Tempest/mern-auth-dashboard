import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Input from "../components/Input.jsx";
import { login } from "../services/authService.js";
import { validateLogin } from "../utils/validators.js";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location?.state?.from || "/dashboard";

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(k, v) {
    setForm((s) => ({ ...s, [k]: v }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setServerError("");

    const nextErrors = validateLogin(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    try {
      setLoading(true);
      await login(form);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setServerError(err?.response?.data?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-5rem)]">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-5xl flex-col items-center justify-center px-4 py-10">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 via-violet-500 to-emerald-400 shadow-soft" />
          <h1 className="text-3xl font-semibold tracking-tight text-white">Task Dashboard</h1>
          <p className="mt-2 text-sm text-white/60">Secure JWT Authentication + Tasks</p>
        </div>

        {/* Content */}
        <div className="grid w-full grid-cols-1 gap-8 lg:grid-cols-2">
          <section className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-soft">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold tracking-tight text-white">Welcome back</h2>
              <p className="mt-2 text-sm text-white/60">Login to access your dashboard and tasks.</p>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <Input
                label="Email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="you@example.com"
                error={errors.email}
                autoComplete="email"
              />
              <Input
                label="Password"
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                placeholder="••••••••"
                type="password"
                error={errors.password}
                autoComplete="current-password"
              />

              {serverError ? (
                <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                  {serverError}
                </div>
              ) : null}

              <button
                disabled={loading}
                className="w-full rounded-xl bg-gradient-to-r from-blue-500 via-violet-500 to-emerald-400 px-4 py-3 text-sm font-semibold text-white shadow-soft hover:brightness-110 disabled:opacity-60"
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>

            <div className="mt-5 text-sm text-white/70">
              No account?{" "}
              <Link className="font-medium text-white underline underline-offset-4" to="/register">
                Create one
              </Link>
            </div>
          </section>

          <aside className="hidden lg:block">
            <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-8">
              <div className="text-sm font-semibold text-white/80">What you get</div>
              <ul className="mt-4 space-y-3 text-sm text-white/65">
                <li className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">JWT-based authentication</li>
                <li className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">Protected dashboard route</li>
                <li className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">Task CRUD + search/filter</li>
              </ul>
            </div>
          </aside>
        </div>

        {/* Footer hint (optional but minimal) */}
        <div className="mt-8 text-center text-xs text-white/40">
          © 2025 Daksh Arora
        </div>
      </div>
    </div>
  );
}
