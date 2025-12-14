import React from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../services/authService.js";

export default function Navbar() {
  const navigate = useNavigate();

  async function onLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0b1220]/70 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500 via-violet-500 to-emerald-400 shadow-soft" />
          <div>
            <div className="text-sm font-semibold tracking-tight text-white">Task Dashboard</div>
            <div className="text-xs text-white/60">Secure JWT app</div>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white hover:bg-white/10 active:scale-[0.99]"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
