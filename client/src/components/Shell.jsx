import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar.jsx";

export default function Shell() {
  const { pathname } = useLocation();
  const showNav = pathname === "/dashboard";

  return (
    <div className="min-h-full">
      {showNav && <Navbar />}
      <main className="mx-auto w-full max-w-6xl px-4 py-10">
        <Outlet />
      </main>
    </div>
  );
}
