import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="mx-auto w-full max-w-xl rounded-3xl border border-white/10 bg-white/5 p-10 text-center shadow-soft">
      <div className="text-2xl font-semibold text-white">Page not found</div>
      <div className="mt-2 text-sm text-white/60">The route doesn’t exist.</div>
      <Link
        to="/login"
        className="mt-6 inline-flex rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-[#0b1220] hover:bg-white/90"
      >
        Go to login
      </Link>
    </div>
  );
}
