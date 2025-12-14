import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Input from "../components/Input.jsx";
import { register } from "../services/authService.js";
import { validateRegister } from "../utils/validators.js";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(k, v) {
    setForm((s) => ({ ...s, [k]: v }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setServerError("");

    const nextErrors = validateRegister(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    try {
      setLoading(true);
      await register({ name: form.name, email: form.email, password: form.password });
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setServerError(err?.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-5rem)]">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-xl flex-col items-center justify-center px-4 py-10">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 via-violet-500 to-emerald-400 shadow-soft" />
          <h1 className="text-3xl font-semibold tracking-tight text-white">Task Dashboard</h1>
          <p className="mt-2 text-sm text-white/60">Create your account to continue</p>
        </div>

        {/* Card */}
        <div className="w-full rounded-3xl border border-white/10 bg-white/5 p-8 shadow-soft">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold tracking-tight text-white">Create account</h2>
            <p className="mt-2 text-sm text-white/60">Register to access your profile and tasks.</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <Input
              label="Name"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              error={errors.name}
              placeholder="Your name"
              autoComplete="name"
            />
            <Input
              label="Email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              error={errors.email}
              autoComplete="email"
              placeholder="you@example.com"
            />
            <Input
              label="Password"
              type="password"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              error={errors.password}
              autoComplete="new-password"
              placeholder="••••••••"
            />
            <Input
              label="Confirm password"
              type="password"
              value={form.confirmPassword}
              onChange={(e) => update("confirmPassword", e.target.value)}
              error={errors.confirmPassword}
              autoComplete="new-password"
              placeholder="••••••••"
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
              {loading ? "Creating..." : "Create account"}
            </button>
          </form>

          <div className="mt-5 text-sm text-white/70">
            Already have an account?{" "}
            <Link className="font-medium text-white underline underline-offset-4" to="/login">
              Login
            </Link>
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-white/40">
          © 2025 Daksh Arora
        </div>
      </div>
    </div>
  );
}
