import { UserPlus, ClipboardList, Sparkles, LogOut } from "lucide-react";
import { AdminUser } from "./App";
import bannerImg from "../imports/MONTE WEB-12.png";

interface HomeProps {
  onLogout: () => void;
  adminUser: AdminUser;
}

export default function Home({ onLogout, adminUser }: HomeProps) {
  const navigateTo = (path: string) => {
    window.history.pushState({}, "", path);
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  return (
    <div className="min-h-screen bg-[#f3f6f4] font-['Inter',sans-serif] flex flex-col justify-between relative overflow-hidden">
      {/* Elementos decorativos de fondo */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-secondary/5 blur-3xl pointer-events-none" />

      {/* Header Banner */}
      <header className="w-full relative overflow-hidden shadow-sm" style={{ height: "120px" }}>
        <img
          src={bannerImg}
          alt="Monte Sion 2026 - Taber x Jev"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute top-3 right-4 z-20">
          <button
            onClick={onLogout}
            className="px-3.5 py-1.5 bg-white/90 hover:bg-white active:bg-white/80 backdrop-blur-md text-red-600 text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer border border-white/60 hover:scale-105"
            title="Cerrar sesión"
          >
            Logout
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-6 py-12 flex-1 flex flex-col justify-center items-center gap-10 w-full relative z-10">
        <div className="text-center space-y-4 max-w-xl animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Campamento Juvenil
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-foreground font-['Outfit',sans-serif] leading-tight">
            Monte Sión 2026
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Te damos la bienvenida al portal oficial de registros. Completa tu inscripción para asegurar tu cabaña o ingresa al panel administrativo si eres organizador.
          </p>
        </div>

        {/* Botones de acción principal en GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl animate-in fade-in slide-in-from-bottom-6 duration-600 delay-200">
          {/* Tarjeta: Nueva Inscripción */}
          <button
            onClick={() => navigateTo("/inscripcion")}
            className="group text-left bg-white p-6 rounded-2xl border border-border shadow-sm hover:shadow-md hover:border-primary/30 transition-all flex flex-col justify-between gap-6 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0 duration-300"
          >
            <div className="p-4 bg-primary/10 text-primary rounded-xl w-14 h-14 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <UserPlus className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5 font-['Outfit',sans-serif]">
                Nueva Inscripción
              </h3>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                Completa los datos del campamentero, contacto de emergencia y firma la declaración jurada.
              </p>
            </div>
          </button>

          {/* Tarjeta: Ver Inscripciones */}
          <button
            onClick={() => navigateTo("/dashboard")}
            className="group text-left bg-white p-6 rounded-2xl border border-border shadow-sm hover:shadow-md hover:border-secondary/30 transition-all flex flex-col justify-between gap-6 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0 duration-300"
          >
            <div className="p-4 bg-secondary/10 text-secondary rounded-xl w-14 h-14 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <ClipboardList className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-foreground group-hover:text-secondary transition-colors flex items-center gap-1.5 font-['Outfit',sans-serif]">
                Ver Inscripciones
              </h3>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                Panel administrativo para consultar registros en tiempo real, filtrar por tallas y descargar o imprimir fichas.
              </p>
            </div>
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-border bg-white/40 text-center relative z-10">
        <p className="text-xs text-muted-foreground font-medium">
          Misión Bautista Internacional · 23 al 28 de noviembre · Monte Sión 2026
        </p>
      </footer>
    </div>
  );
}
