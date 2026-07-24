import { useState, useEffect } from "react";
import DashboardPage from "./dashboard/DashboardPage";
import { InscripcionForm } from "./form/InscripcionForm";
import Home from "./Home";
import Login from "./Login";

export interface AdminUser {
  token: string;
  nombre: string;
  rol: 'admin' | 'colaborador';
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

  // Rutas públicas de formulario
  if (path === "/" || path === "" || path === "/inscripcion" || path === "/nueva-inscripcion") {
    return <InscripcionForm />;
  }

  // Rutas protegidas (Panel administrativo y login)
  if (path === "/admin" || path === "/dashboard" || path === "/login") {
    if (!adminUser) {
      return <Login onLoginSuccess={handleLoginSuccess} />;
    }
    return <DashboardPage onLogout={handleLogout} adminUser={adminUser} />;
  }

  // Menú home si está autenticado
  if (path === "/home" && adminUser) {
    return <Home onLogout={handleLogout} adminUser={adminUser} />;
  }

  // Para cualquier otra ruta incorrecta o no existente, se limpia la URL a "/" y se muestra el formulario
  if (window.location.pathname !== "/") {
    window.history.replaceState({}, "", "/");
  }

  return <InscripcionForm />;
}
