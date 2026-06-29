import { useState, useEffect } from "react";
import DashboardPage from "./dashboard/DashboardPage";
import { InscripcionForm } from "./form/InscripcionForm";
import Home from "./Home";

export default function App() {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => setPath(window.location.pathname);
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  if (path === "/admin" || path === "/dashboard") return <DashboardPage />;
  if (path === "/inscripcion" || path === "/nueva-inscripcion") return <InscripcionForm />;
  return <Home />;
}
