import { useState } from "react";
import { supabase } from "../utils/supabase";
import { Lock, User, Eye, EyeOff, Tent, AlertCircle, RefreshCw } from "lucide-react";
import logoImg from "../imports/MONTE WEB-12-1.png";

interface LoginProps {
  onLoginSuccess: (user: { token: string; nombre: string; rol: 'admin' | 'colaborador' }) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuario.trim() || !password.trim()) {
      setError("Por favor, llene todos los campos.");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const { data, error: rpcError } = await supabase.rpc("login_admin", {
        p_usuario: usuario.trim(),
        p_password: password.trim(),
      });

      if (rpcError) throw rpcError;

      if (data && data.length > 0) {
        const session = data[0];
        onLoginSuccess({
          token: session.token_sesion,
          nombre: session.nombre_admin,
          rol: session.rol_usuario,
        });
      } else {
        setError("Usuario o contraseña incorrectos.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToInscripcion = () => {
    window.history.pushState({}, "", "/");
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  return (
    <div className="min-h-screen bg-[#f3f6f4] text-[#1f2937] font-['Inter',sans-serif] flex items-center justify-center relative overflow-hidden px-4">
      {/* Círculos decorativos de fondo */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-secondary/5 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white/70 backdrop-blur-md rounded-3xl border border-white/60 shadow-xl overflow-hidden relative z-10">
        {/* Banner Header */}
        <div className="w-full overflow-hidden">
          <img src={logoImg} alt="Monte Sion 2026" className="w-full h-auto block object-cover" />
        </div>

        <div className="p-8 pt-5 space-y-6">
          {/* Header text */}
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-black text-foreground font-['Outfit',sans-serif] tracking-tight">
              Inicio Sesión
            </h2>
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">
              Taber × Jev
            </p>
          </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-destructive/10 border border-destructive/25 text-destructive text-xs font-semibold animate-in fade-in slide-in-from-top-2 duration-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
              Usuario
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-muted-foreground/60">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                placeholder="Ingresa tu usuario"
                disabled={loading}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-white/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all disabled:opacity-60 font-semibold"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
              Contraseña
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-muted-foreground/60">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
                className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-border bg-white/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all disabled:opacity-60 font-semibold"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground/60 hover:text-foreground transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-primary hover:bg-primary/95 active:bg-primary text-white text-sm font-bold rounded-xl shadow-md cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Iniciando sesión...
              </>
            ) : (
              "Ingresar"
            )}
          </button>
        </form>

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={handleBackToInscripcion}
            className="text-xs font-semibold text-primary hover:underline cursor-pointer"
          >
            Ir al formulario público de inscripción
          </button>
        </div>
      </div>
    </div>
  </div>
  );
}
