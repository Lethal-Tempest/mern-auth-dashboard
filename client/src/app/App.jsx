import React from "react";
import { useRoutes } from "react-router-dom";
import { appRoutes } from "./routes.jsx";

export default function App() {
  const element = useRoutes(appRoutes);
  return element;
}
