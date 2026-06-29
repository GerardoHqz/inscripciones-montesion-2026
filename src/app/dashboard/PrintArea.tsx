import { Registro } from "../../types";

interface Props { registro: Registro; }

export function PrintArea({ registro: r }: Props) {
  return (
    <div id="print-area" className="hidden print:block p-0 max-w-4xl mx-auto text-black">
      <div className="text-center border-b-2 border-black pb-2 mb-3.5">
        <h2 className="text-xl font-black uppercase tracking-wider">FICHA DE INSCRIPCION - MONTE SION 2026</h2>
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-600 mt-0.5">Mision Bautista Internacional - Tabernaculo Biblico Bautista</p>
        <p className="text-[10px] text-gray-500 mt-0.5">Fecha de registro: {new Date(r.created_at).toLocaleString()}</p>
      </div>

      <div className="space-y-3.5">
        {/* 1. Datos del Campamentero */}
        <div className="border border-black rounded-lg p-3">
          <h3 className="text-xs font-bold uppercase bg-black text-white px-2 py-0.5 inline-block rounded mb-2">1. Datos del Campamentero</h3>
          <div className="grid grid-cols-3 gap-4 text-xs">
            <div>
              <span className="font-bold block uppercase text-[9px] text-gray-500">Nombre Completo:</span>
              <span className="text-sm font-bold">{r.primer_nombre} {r.segundo_nombre || ""} {r.apellidos}</span>
            </div>
            <div>
              <span className="font-bold block uppercase text-[9px] text-gray-500">DUI / Pasaporte:</span>
              <span className="text-sm font-bold">{r.dui_pasaporte}</span>
            </div>
            <div>
              <span className="font-bold block uppercase text-[9px] text-gray-500">Celular:</span>
              <span className="text-sm font-bold">{r.celular}</span>
            </div>
            <div>
              <span className="font-bold block uppercase text-[9px] text-gray-500">Fecha de Nacimiento:</span>
              <span className="text-sm font-bold">{new Date(r.fecha_nacimiento).toLocaleDateString()}</span>
            </div>
            <div>
              <span className="font-bold block uppercase text-[9px] text-gray-500">Edad / Genero:</span>
              <span className="text-sm font-bold">{r.edad} anos - {r.genero}</span>
            </div>
            <div>
              <span className="font-bold block uppercase text-[9px] text-gray-500">Talla de Camisa:</span>
              <span className="text-sm font-bold">{r.talla_camisa || "-"}</span>
            </div>
            <div className="col-span-3 pt-2 border-t border-gray-300 flex justify-between text-xs">
              <span>Modalidad de pago: <strong className="uppercase">{r.tipo_pago}</strong></span>
              <span>ID de Registro: <span className="font-mono text-[10px]">{r.id}</span></span>
            </div>
          </div>
        </div>

        {/* 2. Contactos */}
        <div className="border border-black rounded-lg p-3">
          <h3 className="text-xs font-bold uppercase bg-black text-white px-2 py-0.5 inline-block rounded mb-2">2. Informacion de Contactos y Encargados</h3>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="border-r border-gray-300 pr-4">
              <span className="font-bold block uppercase text-[9px] text-gray-500">Contacto 1 (Principal):</span>
              <p className="font-bold mt-1 text-sm">{r.contacto1_nombres} {r.contacto1_apellidos}</p>
              <p className="mt-0.5">Relacion: <strong>{r.contacto1_relacion}</strong> - Telefono: <strong>{r.contacto1_telefono}</strong></p>
            </div>
            <div className="pl-4">
              <span className="font-bold block uppercase text-[9px] text-gray-500">Contacto 2 (Adicional):</span>
              {r.contacto2_nombres ? (
                <>
                  <p className="font-bold mt-1 text-sm">{r.contacto2_nombres} {r.contacto2_apellidos || ""}</p>
                  <p className="mt-0.5">Relacion: <strong>{r.contacto2_relacion}</strong> - Telefono: <strong>{r.contacto2_telefono}</strong></p>
                </>
              ) : (
                <p className="text-gray-500 italic mt-2">No se registro un segundo contacto.</p>
              )}
            </div>
          </div>
        </div>

        {/* 3. Salud y Emergencias */}
        <div className="border border-black rounded-lg p-3">
          <h3 className="text-xs font-bold uppercase bg-black text-white px-2 py-0.5 inline-block rounded mb-2">3. Salud y Contacto de Emergencia</h3>
          <div className="space-y-2 text-xs">
            <div className="bg-gray-100 p-1.5 rounded border border-gray-300">
              <span className="font-bold block uppercase text-[9px] text-red-700">En caso de emergencia notificar a:</span>
              <p className="font-bold text-sm">
                {r.emergencia_nombres} {r.emergencia_apellidos}
                <span className="font-normal text-gray-600"> ({r.emergencia_relacion})</span> - Telefono: {r.emergencia_telefono}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <span className="font-bold block uppercase text-[9px] text-gray-500">Enfermedades:</span>
                <p className="mt-0.5 whitespace-pre-line text-gray-800">
                  {r.enfermedades ? (<>{r.enfermedades}{r.tratamiento_enfermedades && <span className="block mt-1 font-semibold text-gray-600">Tratamiento: {r.tratamiento_enfermedades}</span>}</>) : "Ninguna declarada."}
                </p>
              </div>
              <div>
                <span className="font-bold block uppercase text-[9px] text-gray-500">Alergias:</span>
                <p className="mt-0.5 whitespace-pre-line text-gray-800">
                  {r.alergias ? (<>{r.alergias}{r.tratamiento_alergias && <span className="block mt-1 font-semibold text-gray-600">Tratamiento: {r.tratamiento_alergias}</span>}</>) : "Ninguna declarada."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Declaracion Jurada */}
        <div className="border border-black rounded-lg p-3">
          <h3 className="text-xs font-bold uppercase bg-black text-white px-2 py-0.5 inline-block rounded mb-2">4. Declaracion Jurada, Firma y Liberacion</h3>
          <div className="text-[9px] text-gray-700 leading-normal mb-2.5 text-justify">
            Yo, <strong>{r.declarante_nombre}</strong> con DUI: <strong>{r.declarante_dui}</strong>, por este medio BAJO JURAMENTO manifiesto: 1) Que autorizo a mi hijo/campamentero para asistir al Campamento Montesion 2026. 2) Que autorizo la toma y divulgacion oficial de fotografias/videos. 3) Me responsabilizo sobre conductas inapropiadas que afecten a terceros. 4) Me comprometo a firmar permisos migratorios correspondientes si fuera necesario. 5) Que libero de todo tipo de responsabilidad a la Mision Bautista Internacional. Acepto en su totalidad los terminos del reglamento.
          </div>
          <div className="flex justify-between items-end gap-6 pt-2 border-t border-gray-300">
            <div className="text-xs">
              <span className="font-bold block uppercase text-[9px] text-gray-500">Nombre del Declarante Responsable:</span>
              <span className="text-sm font-bold">{r.declarante_nombre}</span>
              <span className="font-bold block uppercase text-[9px] text-gray-500 mt-2">DUI del Declarante:</span>
              <span className="text-sm font-semibold font-mono">{r.declarante_dui}</span>
            </div>
            <div className="text-center w-44">
              <span className="font-bold block uppercase text-[9px] text-gray-500 mb-1">Firma del Declarante:</span>
              <div className="border border-black bg-white rounded p-0.5 flex items-center justify-center h-14 overflow-hidden">
                <img src={r.firma_url} alt="Firma" className="max-h-full max-w-full object-contain mix-blend-multiply" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
