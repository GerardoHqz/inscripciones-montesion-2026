import { useState, useEffect } from "react";
import { Toaster, toast } from "sonner";
import DashboardPage from "./dashboard/DashboardPage";
import DistribucionCabanas from "./cabanas/DistribucionCabanas";
import { InscripcionForm } from "./form/InscripcionForm";
import ConsultaPage from "./consulta/ConsultaPage";
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

  // Protección de ruta de cabañas (Solo admin)
  useEffect(() => {
    if ((path === "/cabanas" || path === "/distribucion-cabanas") && adminUser && adminUser.rol !== "admin") {
      toast.error("Acceso restringido: El módulo de cabañas es exclusivo para administradores.");
      window.history.replaceState({}, "", "/home");
      setPath("/home");
    }
  }, [path, adminUser]);

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

  // Rutas públicas explícitas para el formulario y consulta de asignación
  const isFormPath = path === "/form" || path === "/inscripcion" || path === "/nueva-inscripcion";
  const isConsultaPath = path === "/consulta" || path === "/mi-cabana" || path === "/consultar";

  return (
    <>
      <Toaster position="top-right" richColors closeButton />
      {isFormPath ? (
        <InscripcionForm />
      ) : isConsultaPath ? (
        <ConsultaPage
          onBack={() => {
            window.history.pushState({}, "", adminUser ? "/home" : "/login");
            setPath(adminUser ? "/home" : "/login");
          }}
        />
      ) : path === "/dashboard" && adminUser ? (
        <DashboardPage onLogout={handleLogout} adminUser={adminUser} />
      ) : (path === "/cabanas" || path === "/distribucion-cabanas") && adminUser && adminUser.rol === "admin" ? (
        <DistribucionCabanas
          onBack={() => {
            window.history.pushState({}, "", "/home");
            setPath("/home");
          }}
          onLogout={handleLogout}
          adminUser={adminUser}
        />
      ) : adminUser ? (
        <Home onLogout={handleLogout} adminUser={adminUser} />
      ) : (
        <Login onLoginSuccess={handleLoginSuccess} />
      )}
    </>
  );
}
