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

  // Redirigir /admin a /dashboard
  useEffect(() => {
    if (path === "/admin") {
      window.history.replaceState({}, "", "/dashboard");
      setPath("/dashboard");
    }
  }, [path]);

  const handleLoginSuccess = (user: AdminUser) => {
    localStorage.setItem("ms_admin_session", JSON.stringify(user));
    setAdminUser(user);
    window.history.pushState({}, "", "/home");
    setPath("/home");
  };

  const handleLogout = () => {
    localStorage.removeItem("ms_admin_session");
    setAdminUser(null);
    window.history.pushState({}, "", "/login");
    setPath("/login");
  };

  // Rutas públicas explícitas para el formulario
  const isFormPath = path === "/form" || path === "/inscripcion" || path === "/nueva-inscripcion";

  return (
    <>
      <Toaster position="top-right" richColors closeButton />
      {isFormPath ? (
        <InscripcionForm />
      ) : path === "/dashboard" && adminUser ? (
        <DashboardPage onLogout={handleLogout} adminUser={adminUser} />
      ) : adminUser ? (
        <Home onLogout={handleLogout} adminUser={adminUser} />
      ) : (
        <Login onLoginSuccess={handleLoginSuccess} />
      )}
    </>
  );
}
