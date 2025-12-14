import React from "react";

export default function Input({ label, error, ...props }) {
  return (
    <label className="block">
      <div className="mb-1 text-sm text-white/70">{label}</div>
      <input
        {...props}
        className={[
          "w-full rounded-xl border bg-white/5 px-4 py-3 text-white outline-none",
          "placeholder:text-white/35",
          error ? "border-rose-500/60 focus:border-rose-400" : "border-white/10 focus:border-blue-400/60"
        ].join(" ")}
      />
      {error ? <div className="mt-1 text-xs text-rose-300">{error}</div> : null}
    </label>
  );
}
