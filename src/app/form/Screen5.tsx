import { useState, useRef, useEffect, useCallback } from "react";
import { Pen, Trash2, AlertCircle } from "lucide-react";
import { SectionTitle } from "./SectionTitle";

interface Props { onSign: (dataUrl: string | null) => void; error?: string; }

export function Screen5({ onSign, error }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const [hasSig, setHasSig] = useState(false);

  const getPos = (e: MouseEvent | TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ("touches" in e) {
      return { x: (e.touches[0].clientX - rect.left) * scaleX, y: (e.touches[0].clientY - rect.top) * scaleY };
    }
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  };

  const startDraw = useCallback((e: MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current; if (!canvas) return;
    e.preventDefault(); isDrawing.current = true;
    const ctx = canvas.getContext("2d")!;
    const pos = getPos(e, canvas);
    ctx.beginPath(); ctx.moveTo(pos.x, pos.y);
  }, []);

  const draw = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDrawing.current) return;
    const canvas = canvasRef.current; if (!canvas) return;
    e.preventDefault();
    const ctx = canvas.getContext("2d")!;
    const pos = getPos(e, canvas);
    ctx.lineWidth = 2.5; ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.strokeStyle = "#0d2b20"; ctx.lineTo(pos.x, pos.y); ctx.stroke();
    setHasSig(true);
  }, []);

  const endDraw = useCallback(() => {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    const canvas = canvasRef.current;
    if (canvas) onSign(canvas.toDataURL());
  }, [onSign]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    canvas.addEventListener("mousedown", startDraw);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mouseup", endDraw);
    canvas.addEventListener("mouseleave", endDraw);
    canvas.addEventListener("touchstart", startDraw, { passive: false });
    canvas.addEventListener("touchmove", draw, { passive: false });
    canvas.addEventListener("touchend", endDraw);
    return () => {
      canvas.removeEventListener("mousedown", startDraw);
      canvas.removeEventListener("mousemove", draw);
      canvas.removeEventListener("mouseup", endDraw);
      canvas.removeEventListener("mouseleave", endDraw);
      canvas.removeEventListener("touchstart", startDraw);
      canvas.removeEventListener("touchmove", draw);
      canvas.removeEventListener("touchend", endDraw);
    };
  }, [startDraw, draw, endDraw]);

  const clear = () => {
    const canvas = canvasRef.current; if (!canvas) return;
    canvas.getContext("2d")!.clearRect(0, 0, canvas.width, canvas.height);
    setHasSig(false); onSign(null);
  };

  return (
    <div className="space-y-5">
      <SectionTitle>Firma del Padre/Madre Responsable</SectionTitle>

      <p className="text-sm text-muted-foreground">Por favor dibuje su firma en el recuadro. Use el mouse o toque la pantalla.</p>

      <div className={`relative rounded-xl border-2 border-dashed overflow-hidden transition-all ${error ? "border-destructive bg-destructive/5 animate-pulse" : "border-primary/40 bg-white"}`}>
        <div className="absolute inset-x-4 bottom-8 h-px bg-primary/15 pointer-events-none" />
        <div className="absolute left-4 bottom-8 text-[10px] text-primary/30 pointer-events-none font-medium tracking-widest">FIRMA</div>
        <canvas ref={canvasRef} width={800} height={240} className="w-full touch-none cursor-crosshair" style={{ height: "240px" }} />
        {!hasSig && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="flex flex-col items-center gap-2 text-primary/25">
              <Pen className="w-8 h-8" />
              <span className="text-sm font-medium">Firme aqui</span>
            </div>
          </div>
        )}
      </div>

      {error && (
        <span className="text-destructive text-[11px] font-semibold flex items-center gap-1 mt-1 animate-in fade-in slide-in-from-top-1 duration-200">
          <AlertCircle className="w-3.5 h-3.5" /> {error}
        </span>
      )}

      <button type="button" onClick={clear} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive transition-colors">
        <Trash2 className="w-4 h-4" /> Limpiar firma
      </button>
    </div>
  );
}
