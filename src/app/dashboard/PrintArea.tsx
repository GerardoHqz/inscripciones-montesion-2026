import { Registro } from "../../types";
import { sanitizeText } from "../../utils/sanitize";
import logoImg from "../../imports/MONTE WEB-13.png";

interface Props {
  registro: Registro;
  isPublicForm?: boolean;
}

export function PrintArea({ registro: rawRegistro, isPublicForm = false }: Props) {
  const r: Registro = {
    ...rawRegistro,
    primer_nombre: sanitizeText(rawRegistro.primer_nombre),
    segundo_nombre: rawRegistro.segundo_nombre ? sanitizeText(rawRegistro.segundo_nombre) : null,
    primer_apellido: sanitizeText(rawRegistro.primer_apellido),
    segundo_apellido: rawRegistro.segundo_apellido ? sanitizeText(rawRegistro.segundo_apellido) : null,
    nacionalidad: sanitizeText(rawRegistro.nacionalidad),
    contacto1_nombres: sanitizeText(rawRegistro.contacto1_nombres),
    contacto1_apellidos: sanitizeText(rawRegistro.contacto1_apellidos),
    contacto1_relacion: sanitizeText(rawRegistro.contacto1_relacion),
    contacto2_nombres: rawRegistro.contacto2_nombres ? sanitizeText(rawRegistro.contacto2_nombres) : null,
    contacto2_apellidos: rawRegistro.contacto2_apellidos ? sanitizeText(rawRegistro.contacto2_apellidos) : null,
    contacto2_relacion: rawRegistro.contacto2_relacion ? sanitizeText(rawRegistro.contacto2_relacion) : null,
    emergencia_nombres: sanitizeText(rawRegistro.emergencia_nombres),
    emergencia_apellidos: sanitizeText(rawRegistro.emergencia_apellidos),
    emergencia_relacion: sanitizeText(rawRegistro.emergencia_relacion),
    enfermedades: rawRegistro.enfermedades ? sanitizeText(rawRegistro.enfermedades) : null,
    tratamiento_enfermedades: rawRegistro.tratamiento_enfermedades ? sanitizeText(rawRegistro.tratamiento_enfermedades) : null,
    alergias: rawRegistro.alergias ? sanitizeText(rawRegistro.alergias) : null,
    tratamiento_alergias: rawRegistro.tratamiento_alergias ? sanitizeText(rawRegistro.tratamiento_alergias) : null,
    declarante_nombre: sanitizeText(rawRegistro.declarante_nombre),
  };

  const esMenor = r.edad < 18;

  return (
    <div id="print-area" className="p-6 w-[780px] max-w-full mx-auto text-black font-sans bg-white space-y-6">
      
      {/* ─────────────────── PÁGINA 1: FICHA DE INSCRIPCIÓN (MODAL ADMIN STYLE) ─────────────────── */}
      <div id="pdf-page-1" className="pdf-page bg-white p-2 space-y-5">
        
        {/* Encabezado Principal */}
        <div className="border-b border-black pb-3 flex justify-between items-end">
          <div>
            <h3 className="font-extrabold text-xl text-black uppercase tracking-wide">
              Ficha de Inscripcion
            </h3>
            <p className="text-xs text-gray-600 mt-0.5">
              Registrado el {new Date(r.created_at || Date.now()).toLocaleString()}
            </p>
          </div>
          <div className="text-right flex items-center justify-end">
            <img src={logoImg} alt="Monte Sion 2026" className="h-14 w-auto object-contain" />
          </div>
        </div>

        {/* Sección 1: Datos del Campamentero */}
        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <div className="w-1.5 h-4 bg-black rounded-full" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-black">
              1. DATOS DEL CAMPAMENTERO
            </h4>
          </div>
          
          <div className="grid grid-cols-3 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-300 text-xs">
            <div>
              <label className="text-[10px] uppercase font-bold text-gray-600 tracking-wider block mb-1">
                NOMBRE COMPLETO
              </label>
              <p className="text-sm font-bold text-black leading-tight">
                {r.primer_nombre} {r.segundo_nombre || ""} {r.primer_apellido} {r.segundo_apellido || ""}
              </p>
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-gray-600 tracking-wider block mb-1">
                NACIONALIDAD
              </label>
              <p className="text-sm font-bold text-black leading-tight">
                {r.nacionalidad}
              </p>
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-gray-600 tracking-wider block mb-1">
                DOCUMENTO ({r.tipo_documento})
              </label>
              <p className="text-sm font-bold text-black leading-tight">
                {r.numero_documento}
                {r.fecha_vencimiento_documento && (
                  <span className="text-xs font-normal text-gray-600 ml-1">
                    (Vence: {r.fecha_vencimiento_documento})
                  </span>
                )}
              </p>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-gray-600 tracking-wider block mb-1">
                CELULAR
              </label>
              <p className="text-sm font-bold text-black leading-tight">
                {r.celular}
              </p>
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-gray-600 tracking-wider block mb-1">
                FECHA DE NACIMIENTO
              </label>
              <p className="text-sm font-bold text-black leading-tight">
                {r.fecha_nacimiento}
              </p>
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-gray-600 tracking-wider block mb-1">
                EDAD
              </label>
              <p className="text-sm font-bold text-black leading-tight">
                {r.edad} años · {r.genero}
              </p>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-gray-600 tracking-wider block mb-1">
                TALLA CAMISA
              </label>
              <p className="text-sm font-bold text-black leading-tight">
                {r.talla_camisa || "Sin registrar"}
              </p>
            </div>
            <div></div>
            <div></div>

            <div className="col-span-3 pt-3 border-t border-gray-300 flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-700">Pago Registrado:</span>
              <div className="flex items-center gap-2">
                {isPublicForm || !r.tipo_pago ? (
                  <span className="text-xs font-bold uppercase px-3 py-1 rounded-full bg-gray-100 text-black border border-gray-400">
                    PENDIENTE DE PAGO
                  </span>
                ) : (
                  <span className="text-xs font-bold uppercase px-3 py-1 rounded-full bg-gray-200 text-black border border-gray-700">
                    {r.tipo_pago === 'becado' ? 'BECADO' : r.tipo_pago === 'media beca' ? 'MEDIA BECA' : r.tipo_pago === 'medio pago' ? 'PAGO MEDIO' : `PAGO ${r.tipo_pago.toUpperCase()}`}
                    {r.numero_factura && ` (Factura: ${r.numero_factura})`}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sección 2: Informacion de Contacto / Encargados */}
        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <div className="w-1.5 h-4 bg-black rounded-full" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-black">
              2. INFORMACION DE CONTACTO / ENCARGADOS
            </h4>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-xs">
            {/* Contacto 1 */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-300">
              <p className="text-xs font-black text-black uppercase tracking-widest mb-2">
                CONTACTO 1 (PRINCIPAL)
              </p>
              <div className="space-y-1.5">
                <div>
                  <span className="text-[9px] uppercase font-bold text-gray-600 block mb-0.5">NOMBRE</span>
                  <span className="text-sm font-semibold text-black">{r.contacto1_nombres} {r.contacto1_apellidos}</span>
                </div>
                 <div>
                  <span className="text-[9px] uppercase font-bold text-gray-600 block mb-0.5">RELACION / TELEFONO</span>
                  <span className="text-sm font-semibold text-black">{r.contacto1_relacion} - {r.contacto1_telefono}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-gray-600 block mb-0.5">DOCUMENTO DE IDENTIDAD (DUI/PASAPORTE)</span>
                  <span className="text-sm font-semibold text-black">
                    {r.contacto1_dui || <span style={{fontStyle:'italic', color:'#9ca3af'}}>Sin registrar</span>}
                    {r.contacto1_dui_vencimiento && ` (Vence: ${r.contacto1_dui_vencimiento})`}
                  </span>
                </div>
              </div>
            </div>

            {/* Contacto 2 */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-300">
              <p className="text-xs font-black text-black uppercase tracking-widest mb-2">
                CONTACTO 2 (ADICIONAL)
              </p>
              {r.contacto2_nombres ? (
                <div className="space-y-1.5">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-gray-600 block mb-0.5">NOMBRE</span>
                    <span className="text-sm font-semibold text-black">{r.contacto2_nombres} {r.contacto2_apellidos || ""}</span>
                  </div>
                   <div>
                    <span className="text-[9px] uppercase font-bold text-gray-600 block mb-0.5">RELACION / TELEFONO</span>
                    <span className="text-sm font-semibold text-black">{r.contacto2_relacion} - {r.contacto2_telefono}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-gray-600 block mb-0.5">DOCUMENTO DE IDENTIDAD (DUI/PASAPORTE)</span>
                    <span className="text-sm font-semibold text-black">
                      {r.contacto2_dui || <span style={{fontStyle:'italic', color:'#9ca3af'}}>Sin registrar</span>}
                      {r.contacto2_dui_vencimiento && ` (Vence: ${r.contacto2_dui_vencimiento})`}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-gray-500 italic flex items-center h-12">No se registro un segundo contacto.</p>
              )}
            </div>
          </div>
        </div>

        {/* Sección 3: Salud y Contacto de Emergencia */}
        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <div className="w-1.5 h-4 bg-black rounded-full" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-black">
              3. SALUD Y CONTACTO DE EMERGENCIA
            </h4>
          </div>

          <div className="space-y-3">
            <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-300">
              <label className="text-[9px] uppercase font-black text-black tracking-widest block mb-1">
                EN CASO DE EMERGENCIA AVISAR A:
              </label>
              <p className="text-sm font-bold text-black">
                {r.emergencia_nombres} {r.emergencia_apellidos}
                <span className="font-normal text-gray-700 ml-1.5">({r.emergencia_relacion})</span> - <span className="font-mono">{r.emergencia_telefono}</span>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-300">
                <p className="text-xs font-bold text-black mb-1 uppercase tracking-wider">ENFERMEDADES Y TRATAMIENTO</p>
                <p className="text-xs text-gray-700 whitespace-pre-line leading-relaxed">
                  {r.enfermedades ? (<><strong>Diagnostico:</strong> {r.enfermedades}{r.tratamiento_enfermedades && <span className="block mt-1"><strong>Tratamiento:</strong> {r.tratamiento_enfermedades}</span>}</>) : "Ninguna enfermedad registrada."}
                </p>
              </div>
              <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-300">
                <p className="text-xs font-bold text-black mb-1 uppercase tracking-wider">ALERGIAS Y TRATAMIENTO</p>
                <p className="text-xs text-gray-700 whitespace-pre-line leading-relaxed">
                  {r.alergias ? (<><strong>Alergias:</strong> {r.alergias}{r.tratamiento_alergias && <span className="block mt-1"><strong>Tratamiento:</strong> {r.tratamiento_alergias}</span>}</>) : "Ninguna alergia registrada."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sección 4: Declaracion y Firma Responsable */}
        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <div className="w-1.5 h-4 bg-black rounded-full" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-black">
              4. DECLARACION Y FIRMA RESPONSABLE
            </h4>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl border border-gray-300 flex items-center gap-6 justify-between">
            <div className="space-y-1.5 flex-1 text-xs">
              <div>
                <span className="text-[9px] uppercase font-bold text-gray-600 block mb-0.5">DECLARANTE RESPONSABLE</span>
                <span className="text-sm font-bold text-black">{r.declarante_nombre}</span>
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold text-gray-600 block mb-0.5">DUI DECLARANTE</span>
                <span className="text-sm font-semibold text-black font-mono">{r.declarante_dui}</span>
              </div>
              <p className="text-[10px] text-black font-bold pt-1">✓ Acepto Declaracion Jurada y Reglamento</p>
            </div>
            
            <div className="w-44 text-center shrink-0">
              <span className="text-[9px] uppercase font-bold text-gray-600 block mb-1">FIRMA RESPONSABLE</span>
              <div className="border border-gray-400 bg-white rounded-lg p-1 flex items-center justify-center h-20 overflow-hidden shadow-inner">
                {r.firma_url ? (
                  <img src={r.firma_url} alt="Firma" className="max-h-full max-w-full object-contain mix-blend-multiply filter grayscale" />
                ) : null}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ─────────────────── PÁGINA 2: CHECKLIST DOCUMENTACIÓN ─────────────────── */}
      <div id="pdf-page-2" className="pdf-page page-break-before pt-6 space-y-5 text-black bg-white p-2" style={{ pageBreakBefore: 'always', breakBefore: 'page' }}>
        
        <div className="border-b border-black pb-3 flex justify-between items-end">
          <div>
            <h3 className="font-extrabold text-xl text-black uppercase tracking-wide">
              Documentacion Necesaria
            </h3>
            <p className="text-xs text-gray-600 mt-0.5">
              Requisitos obligatorios para completar tu inscripcion
            </p>
          </div>
          <div className="text-right flex items-center justify-end">
            <img src={logoImg} alt="Monte Sion 2026" className="h-14 w-auto object-contain" />
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-xl border border-gray-300">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[9px] uppercase font-bold text-gray-600 block mb-0.5">CAMPAMENTERO:</span>
              <span className="text-sm font-bold text-black">{r.primer_nombre} {r.segundo_nombre || ""} {r.primer_apellido} {r.segundo_apellido || ""}</span>
            </div>
            <div>
              <span className="text-[9px] uppercase font-bold text-gray-600 block mb-0.5">DOCUMENTO:</span>
              <span className="text-sm font-bold text-black">{r.tipo_documento}: {r.numero_documento}</span>
            </div>
            <div>
              <span className="text-[9px] uppercase font-bold text-gray-600 block mb-0.5">CATEGORÍA:</span>
              <span className="text-sm font-bold text-black">{esMenor ? "MENOR DE EDAD" : "MAYOR DE EDAD"} ({r.edad} años)</span>
            </div>
            <div>
              <span className="text-[9px] uppercase font-bold text-gray-600 block mb-0.5">TELÉFONO CELULAR:</span>
              <span className="text-sm font-bold text-black">{r.celular}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-300 space-y-4">
          <p className="text-xs font-bold text-black uppercase tracking-wide border-b border-gray-300 pb-2">
            Para completar tu inscripción es necesario que presentes los siguientes documentos de manera obligatoria:
          </p>

          {esMenor ? (
            <div className="space-y-4 pt-1">
              <div className="inline-block bg-black text-white text-xs font-bold px-3 py-1 rounded-md uppercase tracking-wider">
                Requisitos para Menores de Edad
              </div>
              <div className="space-y-3.5 pl-1 text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-black rounded-sm shrink-0"></div>
                  <span className="font-semibold text-black">Partida de nacimiento vigente</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-black rounded-sm shrink-0"></div>
                  <span className="font-semibold text-black">Fotocopia partida</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-black rounded-sm shrink-0"></div>
                  <span className="font-semibold text-black">DUI ambos padres</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-black rounded-sm shrink-0"></div>
                  <span className="font-semibold text-black">Fotocopia de dui</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-black rounded-sm shrink-0"></div>
                  <span className="font-semibold text-black">Pasaporte y copia 150%</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 pt-1">
              <div className="inline-block bg-black text-white text-xs font-bold px-3 py-1 rounded-md uppercase tracking-wider">
                Requisitos para Mayores de Edad
              </div>
              <div className="space-y-3.5 pl-1 text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-black rounded-sm shrink-0"></div>
                  <span className="font-semibold text-black">Fotocopia dui</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
