import { useState, useEffect } from "react";
import { Toaster } from "sonner";
import DashboardPage from "./dashboard/DashboardPage";
import { InscripcionForm } from "./form/InscripcionForm";
import Home from "./Home";
import Login from "./Login";

import { RolUsuario } from "../types";

export interface AdminUser {
  token: string;
  nombre: string;
  rol: RolUsuario;
}

export default function App() {
  const [path, setPath] = useState(window.location.pathname);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => {
    const saved = localStorage.getItem("ms_admin_session");
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const handlePopState = () => setPath(window.location.pathname);
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const handleLoginSuccess = (user: AdminUser) => {
    localStorage.setItem("ms_admin_session", JSON.stringify(user));
    setAdminUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem("ms_admin_session");
    setAdminUser(null);
    window.history.pushState({}, "", "/admin");
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  return (
    <>
      <Toaster position="top-right" richColors closeButton />
      {path === "/" || path === "" || path === "/inscripcion" || path === "/nueva-inscripcion" ? (
        <InscripcionForm />
      ) : path === "/admin" || path === "/dashboard" || path === "/login" ? (
        !adminUser ? <Login onLoginSuccess={handleLoginSuccess} /> : <DashboardPage onLogout={handleLogout} adminUser={adminUser} />
      ) : path === "/home" && adminUser ? (
        <Home onLogout={handleLogout} adminUser={adminUser} />
      ) : (
        <InscripcionForm />
      )}
    </>
  );
}
