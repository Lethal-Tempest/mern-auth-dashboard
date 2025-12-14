import React from "react";
import Shell from "../components/Shell.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";

import Login from "../pages/Login.jsx";
import Register from "../pages/Register.jsx";
import Dashboard from "../pages/Dashboard.jsx";
import NotFound from "../pages/NotFound.jsx";

export const appRoutes = [
  {
    element: <Shell />,
    children: [
      { path: "/", element: <Login /> },
      { path: "/login", element: <Login /> },
      { path: "/register", element: <Register /> },
      {
        path: "/dashboard",
        element: (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        )
      },
      { path: "*", element: <NotFound /> }
    ]
  }
];
