import { useState, useEffect } from "react";
import { X, Pen, Save, Printer, FileCheck, AlertCircle } from "lucide-react";
import { Registro } from "../../types";

const inputClass = "w-full px-2.5 py-1.5 border border-border rounded-lg bg-input-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all";
const labelClass = "text-[9px] uppercase font-bold text-muted-foreground tracking-wider block mb-1";

interface Props {
  registro: Registro;
  isEditing: boolean;
  isSaving: boolean;
  saveError: string | null;
  editForm: Partial<Registro>;
  onInputChange: (field: keyof Registro, value: any) => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onClose: () => void;
  onPrint: () => void;
  onConfirmarPago?: (id: string, tipoPago: 'completo' | 'medio pago' | 'media beca' | 'becado', numeroFactura: string) => Promise<void>;
  rol: 'admin' | 'colaborador';
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="w-1.5 h-4 bg-primary rounded-full" />
      <h4 className="text-xs font-bold uppercase tracking-wider text-primary">{title}</h4>
    </div>
  );
}

export function RegistroModal({
  registro, isEditing, isSaving, saveError, editForm,
  onInputChange, onStartEdit, onCancelEdit, onSaveEdit, onClose, onPrint,
  onConfirmarPago, rol,
}: Props) {
  const [pagoTipo, setPagoTipo] = useState<string>('pendiente');
  const [pagoFactura, setPagoFactura] = useState('');
  const [cargandoPago, setCargandoPago] = useState(false);
  const [errorPago, setErrorPago] = useState<string | null>(null);
  const [modoEditarPago, setModoEditarPago] = useState(false);

  const canEditFicha = rol === 'admin' || rol === 'operador';
  const canEditPago = rol === 'admin' || rol === 'cajero' || rol === 'libreria';

  useEffect(() => {
    setPagoTipo(registro.tipo_pago || 'pendiente');
    setPagoFactura(registro.numero_factura || '');
    setErrorPago(null);
    setModoEditarPago(false);
  }, [registro.id, registro.tipo_pago, registro.numero_factura]);

  const handleConfirmar = async () => {
    if (pagoTipo === 'pendiente' || !pagoTipo) {
      setErrorPago("Seleccione una modalidad de pago válida (Completo, Medio Pago, Media Beca o Becado).");
      return;
    }
    const facturaFinal = pagoFactura.trim() || (pagoTipo === 'becado' ? 'BECADO' : '');
    if (!facturaFinal) {
      setErrorPago("Ingrese el número de factura.");
      return;
    }
    setErrorPago(null);
    setCargandoPago(true);
    try {
      await onConfirmarPago(registro.id, pagoTipo as 'completo' | 'medio pago' | 'media beca' | 'becado', facturaFinal);
      setModoEditarPago(false);
    } catch (err: any) {
      setErrorPago(err.message || "Error al procesar el pago.");
    } finally {
      setCargandoPago(false);
    }
  };

  const labelClass = "text-[10px] uppercase font-bold text-muted-foreground tracking-wider block mb-1";
  const inputClass = "w-full px-2.5 py-1.5 border border-border rounded-lg bg-input-background text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 no-print">
      <div className="bg-card w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-xl border border-border flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/40">
          <div>
            <h2 className="text-lg font-bold text-foreground font-['Outfit',sans-serif]">
              {isEditing ? "Editando Ficha de Inscripción" : "Ficha de Inscripción Detallada"}
            </h2>
            <p className="text-xs text-muted-foreground">
              Registrado el {new Date(registro.created_at || Date.now()).toLocaleString()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <button onClick={onSaveEdit} disabled={isSaving} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors disabled:opacity-75 cursor-pointer">
                  <Save className="w-3.5 h-3.5" /> {isSaving ? "Guardando..." : "Guardar"}
                </button>
                <button onClick={onCancelEdit} disabled={isSaving} className="px-3 py-1.5 text-xs font-bold bg-muted hover:bg-muted/80 text-foreground rounded-lg transition-colors cursor-pointer">
                  Cancelar
                </button>
              </>
            ) : (
              <>
                {canEditFicha && (
                  <button onClick={onStartEdit} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-[#1e40af] hover:bg-[#1e40af]/90 text-white rounded-lg transition-colors cursor-pointer">
                    <Pen className="w-3.5 h-3.5" /> Editar Ficha
                  </button>
                )}
                <button onClick={onPrint} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-[#0d2b20] hover:bg-[#0d2b20]/90 text-white rounded-lg transition-colors cursor-pointer">
                  <Printer className="w-3.5 h-3.5" /> Imprimir Ficha
                </button>
                <button onClick={onClose} className="p-1.5 hover:bg-muted rounded-full transition-colors cursor-pointer">
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          {saveError && (
            <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> <span>{saveError}</span>
            </div>
          )}

          {/* Seccion 1: Datos Generales */}
          <div>
            <SectionHeader title="1. Datos del Campamentero" />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 bg-muted/20 p-4 rounded-xl border border-border">
              {isEditing ? (
                <>
                  <div><label className={labelClass}>Primer Nombre</label><input type="text" value={editForm.primer_nombre || ""} onChange={(e) => onInputChange("primer_nombre", e.target.value)} className={inputClass} /></div>
                  <div><label className={labelClass}>Segundo Nombre</label><input type="text" value={editForm.segundo_nombre || ""} onChange={(e) => onInputChange("segundo_nombre", e.target.value)} className={inputClass} /></div>
                  <div><label className={labelClass}>Primer Apellido</label><input type="text" value={editForm.primer_apellido || ""} onChange={(e) => onInputChange("primer_apellido", e.target.value)} className={inputClass} /></div>
                  <div><label className={labelClass}>Segundo Apellido</label><input type="text" value={editForm.segundo_apellido || ""} onChange={(e) => onInputChange("segundo_apellido", e.target.value)} className={inputClass} /></div>
                  <div><label className={labelClass}>Nacionalidad</label><input type="text" value={editForm.nacionalidad || ""} onChange={(e) => onInputChange("nacionalidad", e.target.value)} className={inputClass} /></div>
                  <div><label className={labelClass}>Tipo Documento</label>
                    <select value={editForm.tipo_documento || ""} onChange={(e) => onInputChange("tipo_documento", e.target.value)} className={inputClass}>
                      <option value="DUI">DUI</option>
                      <option value="PASAPORTE">PASAPORTE</option>
                    </select>
                  </div>
                  <div><label className={labelClass}>Número Documento</label><input type="text" value={editForm.numero_documento || ""} onChange={(e) => onInputChange("numero_documento", e.target.value)} className={inputClass} /></div>
                  <div><label className={labelClass}>Vencimiento Documento</label><input type="date" min="2027-05-28" value={editForm.fecha_vencimiento_documento || ""} onChange={(e) => onInputChange("fecha_vencimiento_documento", e.target.value)} className={inputClass} /></div>
                  <div><label className={labelClass}>Celular</label><input type="tel" value={editForm.celular || ""} onChange={(e) => onInputChange("celular", e.target.value)} className={inputClass} /></div>
                  <div><label className={labelClass}>Fecha de Nacimiento</label><input type="date" value={editForm.fecha_nacimiento || ""} onChange={(e) => onInputChange("fecha_nacimiento", e.target.value)} className={inputClass} /></div>
                  <div><label className={labelClass}>Edad</label><input type="number" value={editForm.edad || 0} onChange={(e) => onInputChange("edad", parseInt(e.target.value, 10))} className={inputClass} /></div>
                  <div><label className={labelClass}>Genero</label>
                    <select value={editForm.genero || ""} onChange={(e) => onInputChange("genero", e.target.value)} className={inputClass}>
                      <option value="Masculino">Masculino</option><option value="Femenino">Femenino</option>
                    </select>
                  </div>
                  <div><label className={labelClass}>Talla Camisa</label>
                    <select value={editForm.talla_camisa || ""} onChange={(e) => onInputChange("talla_camisa", e.target.value)} className={inputClass}>
                      <option value="">Sin registrar</option><option value="S">S</option><option value="M">M</option><option value="L">L</option><option value="XL">XL</option><option value="XXL">XXL</option>
                    </select>
                  </div>
                  {canEditPago && (
                    <div className="col-span-1 sm:grid-cols-2 md:col-span-3 pt-3 border-t border-border/60 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block mb-1">Modalidad de Pago</label>
                        <select value={editForm.tipo_pago || "completo"} onChange={(e) => onInputChange("tipo_pago", e.target.value)} className="w-full px-2.5 py-1.5 border border-border rounded-lg bg-input-background text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40">
                          <option value="completo">Completo</option>
                          <option value="medio pago">Medio Pago</option>
                          <option value="media beca">Media Beca</option>
                          <option value="becado">Becado</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block mb-1">Número de Factura</label>
                        <input
                          type="text"
                          value={editForm.numero_factura || ""}
                          onChange={(e) => onInputChange("numero_factura", e.target.value || null)}
                          placeholder="Ej. FAC-00123"
                          className="w-full px-2.5 py-1.5 border border-border rounded-lg bg-input-background text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                        />
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div><label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Nombre Completo</label><p className="text-sm font-semibold text-foreground">{registro.primer_nombre} {registro.segundo_nombre || ""} {registro.primer_apellido} {registro.segundo_apellido || ""}</p></div>
                  <div><label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Nacionalidad</label><p className="text-sm font-semibold text-foreground">{registro.nacionalidad}</p></div>
                  <div><label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Documento ({registro.tipo_documento})</label><p className="text-sm font-semibold text-foreground">{registro.numero_documento}{registro.fecha_vencimiento_documento && <span className="text-[11px] font-normal text-muted-foreground ml-1.5">(Vence: {registro.fecha_vencimiento_documento})</span>}</p></div>
                  <div><label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Celular</label><p className="text-sm font-semibold text-foreground">{registro.celular}</p></div>
                  <div><label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Fecha de Nacimiento</label><p className="text-sm font-semibold text-foreground">{registro.fecha_nacimiento}</p></div>
                  <div><label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Edad</label><p className="text-sm font-semibold text-foreground">{registro.edad} años · {registro.genero}</p></div>
                  <div><label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Talla Camisa</label><p className="text-sm font-semibold text-foreground">{registro.talla_camisa || "Sin registrar"}</p></div>
                  {registro.tipo_pago !== null && !modoEditarPago ? (
                    <div className="col-span-1 sm:col-span-2 md:col-span-3 pt-3 border-t border-border/60 flex items-center justify-between flex-wrap gap-2">
                      <span className="text-xs font-semibold text-muted-foreground">Pago Registrado:</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold uppercase px-2.5 py-0.5 rounded-full ${
                          registro.tipo_pago === "completo"
                            ? "bg-secondary/15 text-secondary"
                            : registro.tipo_pago === "medio pago"
                            ? "bg-amber-500/15 text-amber-700"
                            : registro.tipo_pago === "media beca"
                            ? "bg-teal-500/15 text-teal-700"
                            : registro.tipo_pago === "becado"
                            ? "bg-purple-500/15 text-purple-700"
                            : "bg-muted text-muted-foreground"
                        }`}>
                          {registro.tipo_pago === "becado" ? "Becado" : registro.tipo_pago === "media beca" ? "Media Beca" : registro.tipo_pago === "medio pago" ? "Medio Pago" : `Pago ${registro.tipo_pago}`}
                        </span>
                        {registro.numero_factura && (
                          <span className="text-xs font-mono text-muted-foreground">
                            (Factura: <span className="font-bold text-foreground">{registro.numero_factura}</span>)
                          </span>
                        )}
                        {canEditPago && (
                          <button
                            type="button"
                            onClick={() => {
                              setPagoTipo(registro.tipo_pago || 'completo');
                              setPagoFactura(registro.numero_factura || '');
                              setModoEditarPago(true);
                            }}
                            className="ml-2 px-2.5 py-1 text-xs font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 border border-amber-500/30 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <Pen className="w-3 h-3" /> Modificar Pago
                          </button>
                        )}
                      </div>
                    </div>
                  ) : canEditPago ? (
                    <div className="col-span-1 sm:col-span-2 md:col-span-3 pt-3 border-t border-border/60 bg-amber-500/5 p-4 rounded-xl border border-amber-500/20 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-800 uppercase tracking-wide flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                          {registro.tipo_pago !== null ? "Modificar Registro de Pago" : "Registrar Pago en Librería (Taber Store)"}
                        </span>
                        {errorPago && <span className="text-xs text-red-600 font-semibold">{errorPago}</span>}
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3 items-end">
                        <div className="flex-1 w-full space-y-1">
                          <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Tipo Pago</label>
                          <select
                            value={pagoTipo}
                            onChange={(e) => setPagoTipo(e.target.value)}
                            className="w-full px-2.5 py-1.5 border border-border rounded-lg bg-white text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
                          >
                            <option value="pendiente">Pago Pendiente</option>
                            <option value="completo">Pago Completo</option>
                            <option value="medio pago">Medio Pago</option>
                            <option value="media beca">Media Beca</option>
                            <option value="becado">Becado</option>
                          </select>
                        </div>
                        <div className="flex-1 w-full space-y-1">
                          <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Número Factura</label>
                          <input
                            type="text"
                            placeholder="Ej. FAC-00123"
                            value={pagoFactura}
                            onChange={(e) => setPagoFactura(e.target.value)}
                            className="w-full px-2.5 py-1.5 border border-border rounded-lg bg-white text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-muted-foreground/30"
                          />
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <button
                            type="button"
                            onClick={handleConfirmar}
                            disabled={cargandoPago}
                            className="px-4 py-1.5 bg-primary hover:bg-primary-hover active:bg-primary/95 text-white text-xs font-bold rounded-lg shadow-sm cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed h-[32px] flex items-center justify-center gap-1.5 flex-1 sm:flex-none"
                          >
                            {cargandoPago ? "Guardando..." : registro.tipo_pago !== null ? "Guardar Pago" : "Confirmar e Inscribir"}
                          </button>
                          {registro.tipo_pago !== null && (
                            <button
                              type="button"
                              onClick={() => setModoEditarPago(false)}
                              disabled={cargandoPago}
                              className="px-3 py-1.5 bg-muted hover:bg-muted/80 text-foreground text-xs font-bold rounded-lg transition-colors h-[32px]"
                            >
                              Cancelar
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="col-span-1 sm:col-span-2 md:col-span-3 pt-3 border-t border-border/60 bg-amber-500/5 p-3 rounded-xl border border-amber-500/20 flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-800 uppercase tracking-wide flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                        Pendiente de Pago en Librería (Taber Store)
                      </span>
                      <span className="text-xs font-bold uppercase px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700">
                        Pendiente
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Seccion 2: Contactos */}
          <div>
            <SectionHeader title="2. Informacion de Contacto / Encargados" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Contacto 1 */}
              <div className="bg-muted/20 p-4 rounded-xl border border-border">
                <p className="text-xs font-black text-primary uppercase tracking-widest mb-2">Contacto 1 (Principal)</p>
                {isEditing ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div><label className={labelClass}>Nombres</label><input type="text" value={editForm.contacto1_nombres || ""} onChange={(e) => onInputChange("contacto1_nombres", e.target.value)} className={inputClass} /></div>
                      <div><label className={labelClass}>Apellidos</label><input type="text" value={editForm.contacto1_apellidos || ""} onChange={(e) => onInputChange("contacto1_apellidos", e.target.value)} className={inputClass} /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div><label className={labelClass}>Relacion</label><input type="text" value={editForm.contacto1_relacion || ""} onChange={(e) => onInputChange("contacto1_relacion", e.target.value)} className={inputClass} /></div>
                      <div><label className={labelClass}>Telefono</label><input type="tel" value={editForm.contacto1_telefono || ""} onChange={(e) => onInputChange("contacto1_telefono", e.target.value)} className={inputClass} /></div>
                    </div>
                    <div><label className={labelClass}>Documento de Identidad</label><input type="text" value={editForm.contacto1_dui || ""} onChange={(e) => onInputChange("contacto1_dui", e.target.value)} className={inputClass} /></div>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <div><span className="text-[9px] uppercase font-bold text-muted-foreground block">Nombre</span><span className="text-sm font-semibold text-foreground">{registro.contacto1_nombres} {registro.contacto1_apellidos}</span></div>
                    <div><span className="text-[9px] uppercase font-bold text-muted-foreground block">Relacion / Telefono</span><span className="text-sm font-semibold text-foreground">{registro.contacto1_relacion} - {registro.contacto1_telefono}</span></div>
                    <div>
                      <span className="text-[9px] uppercase font-bold text-muted-foreground block">Documento de Identidad (DUI/Pasaporte)</span>
                      <span className={`text-sm font-semibold ${registro.contacto1_dui ? 'text-foreground' : 'text-muted-foreground italic'}`}>
                        {registro.contacto1_dui || 'Sin registrar'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Contacto 2 */}
              <div className="bg-muted/20 p-4 rounded-xl border border-border">
                <p className="text-xs font-black text-secondary uppercase tracking-widest mb-2">Contacto 2 (Adicional)</p>
                {isEditing ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div><label className={labelClass}>Nombres</label><input type="text" value={editForm.contacto2_nombres || ""} onChange={(e) => onInputChange("contacto2_nombres", e.target.value)} className={inputClass} /></div>
                      <div><label className={labelClass}>Apellidos</label><input type="text" value={editForm.contacto2_apellidos || ""} onChange={(e) => onInputChange("contacto2_apellidos", e.target.value)} className={inputClass} /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div><label className={labelClass}>Relacion</label><input type="text" value={editForm.contacto2_relacion || ""} onChange={(e) => onInputChange("contacto2_relacion", e.target.value)} className={inputClass} /></div>
                      <div><label className={labelClass}>Telefono</label><input type="tel" value={editForm.contacto2_telefono || ""} onChange={(e) => onInputChange("contacto2_telefono", e.target.value)} className={inputClass} /></div>
                    </div>
                    <div><label className={labelClass}>Documento de Identidad</label><input type="text" value={editForm.contacto2_dui || ""} onChange={(e) => onInputChange("contacto2_dui", e.target.value)} className={inputClass} /></div>
                  </div>
                ) : registro.contacto2_nombres ? (
                  <div className="space-y-1.5">
                    <div><span className="text-[9px] uppercase font-bold text-muted-foreground block">Nombre</span><span className="text-sm font-semibold text-foreground">{registro.contacto2_nombres} {registro.contacto2_apellidos || ""}</span></div>
                    <div><span className="text-[9px] uppercase font-bold text-muted-foreground block">Relacion / Telefono</span><span className="text-sm font-semibold text-foreground">{registro.contacto2_relacion} - {registro.contacto2_telefono}</span></div>
                    <div>
                      <span className="text-[9px] uppercase font-bold text-muted-foreground block">Documento de Identidad (DUI/Pasaporte)</span>
                      <span className={`text-sm font-semibold ${registro.contacto2_dui ? 'text-foreground' : 'text-muted-foreground italic'}`}>
                        {registro.contacto2_dui || 'Sin registrar'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic flex items-center h-12">No se registro un segundo contacto.</p>
                )}
              </div>
            </div>
          </div>

          {/* Seccion 3: Salud y Emergencia */}
          <div>
            <SectionHeader title="3. Salud y Contacto de Emergencia" />
            <div className="space-y-4">
              <div className="bg-muted/20 p-4 rounded-xl border border-border">
                <label className="text-[9px] uppercase font-bold text-[#b91c1c] tracking-widest block mb-1">En caso de emergencia avisar a:</label>
                {isEditing ? (
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-2">
                    <div className="sm:col-span-1"><label className={labelClass}>Nombres</label><input type="text" value={editForm.emergencia_nombres || ""} onChange={(e) => onInputChange("emergencia_nombres", e.target.value)} className={inputClass} /></div>
                    <div className="sm:col-span-1"><label className={labelClass}>Apellidos</label><input type="text" value={editForm.emergencia_apellidos || ""} onChange={(e) => onInputChange("emergencia_apellidos", e.target.value)} className={inputClass} /></div>
                    <div className="sm:col-span-1"><label className={labelClass}>Relacion</label><input type="text" value={editForm.emergencia_relacion || ""} onChange={(e) => onInputChange("emergencia_relacion", e.target.value)} className={inputClass} /></div>
                    <div className="sm:col-span-1"><label className={labelClass}>Telefono</label><input type="tel" value={editForm.emergencia_telefono || ""} onChange={(e) => onInputChange("emergencia_telefono", e.target.value)} className={inputClass} /></div>
                  </div>
                ) : (
                  <p className="text-sm font-bold text-foreground">{registro.emergencia_nombres} {registro.emergencia_apellidos}<span className="font-normal text-muted-foreground ml-1.5">({registro.emergencia_relacion})</span> - <span className="font-mono">{registro.emergencia_telefono}</span></p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-muted/20 p-4 rounded-xl border border-border">
                  <p className="text-xs font-bold text-foreground mb-1 uppercase tracking-wider">Enfermedades y Tratamiento</p>
                  {isEditing ? (
                    <div className="space-y-3 mt-2">
                      <div><label className={labelClass}>Enfermedades conocidas</label><textarea value={editForm.enfermedades || ""} onChange={(e) => onInputChange("enfermedades", e.target.value)} rows={2} className={`${inputClass} resize-none`} /></div>
                      <div><label className={labelClass}>Tratamiento</label><textarea value={editForm.tratamiento_enfermedades || ""} onChange={(e) => onInputChange("tratamiento_enfermedades", e.target.value)} rows={2} className={`${inputClass} resize-none`} /></div>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground whitespace-pre-line leading-relaxed">
                      {registro.enfermedades ? (<><strong>Diagnostico:</strong> {registro.enfermedades}{registro.tratamiento_enfermedades && <span className="block mt-1"><strong>Tratamiento:</strong> {registro.tratamiento_enfermedades}</span>}</>) : "Ninguna enfermedad registrada."}
                    </p>
                  )}
                </div>
                <div className="bg-muted/20 p-4 rounded-xl border border-border">
                  <p className="text-xs font-bold text-foreground mb-1 uppercase tracking-wider">Alergias y Tratamiento</p>
                  {isEditing ? (
                    <div className="space-y-3 mt-2">
                      <div><label className={labelClass}>Alergias conocidas</label><textarea value={editForm.alergias || ""} onChange={(e) => onInputChange("alergias", e.target.value)} rows={2} className={`${inputClass} resize-none`} /></div>
                      <div><label className={labelClass}>Tratamiento</label><textarea value={editForm.tratamiento_alergias || ""} onChange={(e) => onInputChange("tratamiento_alergias", e.target.value)} rows={2} className={`${inputClass} resize-none`} /></div>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground whitespace-pre-line leading-relaxed">
                      {registro.alergias ? (<><strong>Alergias:</strong> {registro.alergias}{registro.tratamiento_alergias && <span className="block mt-1"><strong>Tratamiento:</strong> {registro.tratamiento_alergias}</span>}</>) : "Ninguna alergia registrada."}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Seccion 4: Declaracion y Firma */}
          <div>
            <SectionHeader title="4. Declaracion y Firma Responsable" />
            <div className="bg-muted/20 p-4 rounded-xl border border-border flex flex-col md:flex-row items-center gap-6 justify-between">
              <div className="space-y-1.5 flex-1 w-full">
                {isEditing ? (
                  <div className="space-y-2 max-w-sm">
                    <div><label className={labelClass}>Nombre del Declarante Responsable</label><input type="text" value={editForm.declarante_nombre || ""} onChange={(e) => onInputChange("declarante_nombre", e.target.value)} className={inputClass} /></div>
                    <div><label className={labelClass}>DUI del Declarante</label><input type="text" value={editForm.declarante_dui || ""} onChange={(e) => onInputChange("declarante_dui", e.target.value)} className={inputClass} /></div>
                  </div>
                ) : (
                  <>
                    <div><span className="text-[9px] uppercase font-bold text-muted-foreground block">Declarante Responsable</span><span className="text-sm font-bold text-foreground">{registro.declarante_nombre}</span></div>
                    <div><span className="text-[9px] uppercase font-bold text-muted-foreground block">DUI Declarante</span><span className="text-sm font-semibold text-foreground font-mono">{registro.declarante_dui}</span></div>
                    <div className="flex items-center gap-1.5 text-xs text-secondary font-semibold pt-1"><FileCheck className="w-4 h-4" /> Acepto Declaracion Jurada y Reglamento</div>
                  </>
                )}
              </div>
              <div className="w-full max-w-[240px] text-center">
                <span className="text-[9px] uppercase font-bold text-muted-foreground block mb-1.5">Firma Registrada</span>
                <div className="border border-border bg-white rounded-lg p-2 flex items-center justify-center shadow-inner h-24 overflow-hidden">
                  <img src={registro.firma_url} alt="Firma del Declarante" className="max-h-full max-w-full object-contain mix-blend-multiply" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
