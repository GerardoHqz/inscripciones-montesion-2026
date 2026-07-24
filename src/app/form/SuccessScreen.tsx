
import { CheckCircle2, Store, Download, Home, Loader2 } from "lucide-react";
import { FormData, Registro } from "../../types";
import { PrintArea } from "../dashboard/PrintArea";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { RegistroPdfDocument } from "./RegistroPdfDocument";

interface Props {
  data: FormData;
  sig: string | null;
}

function formDataToRegistro(data: FormData, sig: string | null): Registro {
  const esMayor = parseInt(data.edad, 10) >= 18;
  return {
    id: "PENDIENTE",
    created_at: new Date().toISOString(),
    primer_nombre: data.primerNombre,
    segundo_nombre: data.segundoNombre || null,
    primer_apellido: data.primerApellido,
    segundo_apellido: data.segundoApellido || null,
    nacionalidad: data.nacionalidad,
    fecha_nacimiento: data.fechaNacimiento,
    edad: parseInt(data.edad, 10) || 0,
    genero: data.genero || "Sin especificar",
    talla_camisa: data.tallaCamisa || null,
    tipo_documento: (data.tipoDocumento as any) || "DUI",
    numero_documento: data.numeroDocumento,
    fecha_vencimiento_documento: data.fechaVencimientoDocumento || null,
    celular: data.celular,
    tipo_pago: null,
    numero_factura: null,
    contacto1_nombres: esMayor ? (data.contacto1Nombres || data.primerNombre) : data.contacto1Nombres,
    contacto1_apellidos: esMayor ? (data.contacto1Apellidos || data.primerApellido) : data.contacto1Apellidos,
    contacto1_relacion: esMayor ? (data.contacto1Relacion || "Mismo") : data.contacto1Relacion,
    contacto1_telefono: esMayor ? (data.contacto1Telefono || data.celular) : data.contacto1Telefono,
    contacto1_dui: esMayor ? null : data.contacto1Dui,
    contacto2_nombres: esMayor ? null : (data.contacto2Nombres || null),
    contacto2_apellidos: esMayor ? null : (data.contacto2Apellidos || null),
    contacto2_relacion: esMayor ? null : (data.contacto2Relacion || null),
    contacto2_telefono: esMayor ? null : (data.contacto2Telefono || null),
    contacto2_dui: esMayor ? null : (data.contacto2Dui || null),
    emergencia_nombres: data.emergenciaNombres,
    emergencia_apellidos: data.emergenciaApellidos,
    emergencia_telefono: data.emergenciaTelefono,
    emergencia_relacion: data.emergenciaRelacion,
    enfermedades: data.enfermedades || null,
    tratamiento_enfermedades: data.tratamientoEnfermedades || null,
    alergias: data.alergias || null,
    tratamiento_alergias: data.tratamientoAlergias || null,
    declarante_nombre: data.declaranteNombre,
    declarante_dui: data.declaranteDui,
    acepta_terminos: data.aceptaTerminos,
    firma_url: sig || "",
  };
}

export function SuccessScreen({ data, sig }: Props) {
  const registro = formDataToRegistro(data, sig);

  const goHome = () => {
    window.location.href = "/";
  };

  const sanitizedNombre = (data.primerNombre || "Campamentero").replace(/[^a-zA-Z0-9]/g, "_");
  const sanitizedApellido = (data.primerApellido || "").replace(/[^a-zA-Z0-9]/g, "_");
  const filename = `Ficha_Inscripcion_${sanitizedNombre}_${sanitizedApellido}.pdf`;

  return (
    <>
      <style>{`
        @media print {
          @page { margin: 0; }
          html, body, .min-h-screen {
            background: white !important;
            color: black !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          body {
            padding: 1.2cm 1.4cm !important;
          }
          .no-print { display: none !important; }
          main {
            padding: 0 !important;
            margin: 0 !important;
            max-width: 100% !important;
            background: transparent !important;
          }
          #print-area {
            display: block !important;
            padding: 0 !important;
            margin: 0 !important;
            max-width: 100% !important;
            filter: grayscale(100%) !important;
          }
        }
      `}</style>

      {/* Interfaz de Confirmación (Pantalla) */}
      <div className="no-print relative flex flex-col items-center justify-center py-6 text-center space-y-6 animate-in fade-in zoom-in-95 duration-400">
        <div className="w-20 h-20 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shadow-xs">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-2 max-w-md">
          <h2 className="text-2xl font-black text-foreground font-['Outfit',sans-serif]">
            ¡Solicitud Completada!
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Gracias por completar el formulario futuro campamentero.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-amber-900 text-xs sm:text-sm text-left flex items-start gap-3.5 max-w-md shadow-2xs">
          <div className="p-2 bg-amber-500/15 text-amber-700 rounded-lg shrink-0 mt-0.5">
            <Store className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <p className="font-bold text-amber-950">Próximo paso importante:</p>
            <p className="text-amber-900/90 leading-relaxed">
              Descarga tu <strong>Ficha de Registro</strong> con el listado de documentos requeridos y preséntalos en <strong>Taber Store (Librería)</strong> para completar tu pago y reservar tu cupo.
            </p>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col items-center gap-3 w-full max-w-sm pt-2">
          <PDFDownloadLink
            document={<RegistroPdfDocument registro={registro} isPublicForm={true} />}
            fileName={filename}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl text-sm transition-all shadow-md hover:shadow-lg active:scale-[0.99] cursor-pointer"
          >
            {({ loading }) =>
              loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generando PDF nativo...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Descargar Ficha PDF</span>
                </>
              )
            }
          </PDFDownloadLink>

          <button
            type="button"
            onClick={goHome}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-muted hover:bg-muted/80 text-foreground font-semibold rounded-xl text-sm transition-all cursor-pointer border border-border"
          >
            <Home className="w-4 h-4" />
            <span>Volver al Inicio</span>
          </button>
        </div>
      </div>
    </>
  );
}
