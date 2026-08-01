import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import { Registro } from "../../types";
import { sanitizeText } from "../../utils/sanitize";
import logoImg from "../../imports/MONTE WEB-13.png";

const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    borderBottomWidth: 1,
    borderBottomColor: "#000000",
    paddingBottom: 8,
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: "column",
  },
  title: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
  },
  subtitle: {
    fontSize: 9,
    color: "#4b5563",
    marginTop: 2,
  },
  logo: {
    height: 35,
    objectFit: "contain",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    marginTop: 8,
  },
  bullet: {
    width: 6,
    height: 12,
    backgroundColor: "#000000",
    borderRadius: 3,
    marginRight: 6,
  },
  sectionTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
  },
  card: {
    backgroundColor: "#f9fafb",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 6,
  },
  col3: {
    width: "33.33%",
    paddingRight: 8,
    marginBottom: 8,
  },
  col2: {
    width: "50%",
    paddingRight: 8,
    marginBottom: 8,
  },
  col1: {
    width: "100%",
    marginBottom: 8,
  },
  label: {
    fontSize: 7,
    color: "#4b5563",
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    marginBottom: 1,
  },
  value: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#000000",
  },
  valueNormal: {
    fontSize: 9,
    fontFamily: "Helvetica",
    color: "#374151",
    lineHeight: 1.3,
  },
  valueItalic: {
    fontSize: 9,
    fontFamily: "Helvetica-Oblique",
    color: "#6b7280",
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#d1d5db",
    paddingTop: 6,
    marginTop: 2,
  },
  badgePending: {
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#9ca3af",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  badgePaid: {
    backgroundColor: "#e5e7eb",
    borderWidth: 1,
    borderColor: "#374151",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
  },
  signatureBox: {
    borderWidth: 1,
    borderColor: "#9ca3af",
    backgroundColor: "#ffffff",
    borderRadius: 6,
    height: 45,
    width: 130,
    justifyContent: "center",
    alignItems: "center",
  },
  signatureImage: {
    maxHeight: 50,
    maxWidth: 140,
    objectFit: "contain",
  },
  signatureEmpty: {
    fontSize: 8,
    fontFamily: "Helvetica-Oblique",
    color: "#9ca3af",
  },
  checklistTitleBox: {
    backgroundColor: "#000000",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 4,
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  checklistTitleText: {
    color: "#ffffff",
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
  },
  checklistItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    marginLeft: 5,
  },
  checkbox: {
    width: 14,
    height: 14,
    borderWidth: 1.5,
    borderColor: "#000000",
    marginRight: 10,
  },
  checklistLabel: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
  },
  instructionsBox: {
    backgroundColor: "#ffffff",
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
    marginTop: 10,
  },
  instructionsHeader: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    borderBottomWidth: 1,
    borderBottomColor: "#d1d5db",
    paddingBottom: 6,
    marginBottom: 10,
  }
});

interface PdfProps {
  registro: Registro;
  isPublicForm?: boolean;
}

export function RegistroPdfDocument({ registro: rawRegistro, isPublicForm = false }: PdfProps) {
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

  const renderHeader = (title: string, subtitle: string) => (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      <Image src={logoImg} style={styles.logo} />
    </View>
  );

  const renderSectionTitle = (title: string) => (
    <View style={styles.sectionHeader}>
      <View style={styles.bullet} />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );

  return (
    <Document>
      {/* PÁGINA 1: Datos Principales */}
      <Page size="LETTER" style={styles.page}>
        {renderHeader("Ficha de Inscripcion", `Registrado el ${new Date(r.created_at || Date.now()).toLocaleString()}`)}

        {/* 1. DATOS DEL CAMPAMENTERO */}
        {renderSectionTitle("1. DATOS DEL CAMPAMENTERO")}
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.col3}>
              <Text style={styles.label}>NOMBRE COMPLETO</Text>
              <Text style={styles.value}>{r.primer_nombre} {r.segundo_nombre || ""} {r.primer_apellido} {r.segundo_apellido || ""}</Text>
            </View>
            <View style={styles.col3}>
              <Text style={styles.label}>NACIONALIDAD</Text>
              <Text style={styles.value}>{r.nacionalidad}</Text>
            </View>
            <View style={styles.col3}>
              <Text style={styles.label}>DOCUMENTO ({r.tipo_documento})</Text>
              <Text style={styles.value}>{r.numero_documento} {r.fecha_vencimiento_documento ? `(Vence: ${r.fecha_vencimiento_documento})` : ""}</Text>
            </View>
            <View style={styles.col3}>
              <Text style={styles.label}>CELULAR</Text>
              <Text style={styles.value}>{r.celular}</Text>
            </View>
            <View style={styles.col3}>
              <Text style={styles.label}>FECHA DE NACIMIENTO</Text>
              <Text style={styles.value}>{r.fecha_nacimiento}</Text>
            </View>
            <View style={styles.col3}>
              <Text style={styles.label}>EDAD</Text>
              <Text style={styles.value}>{r.edad} años · {r.genero}</Text>
            </View>
            <View style={styles.col3}>
              <Text style={styles.label}>TALLA CAMISA</Text>
              <Text style={styles.value}>{r.talla_camisa || "Sin registrar"}</Text>
            </View>
          </View>
          
          <View style={styles.footerRow}>
            <Text style={{ fontSize: 10, fontFamily: "Helvetica-Bold", color: "#374151" }}>Pago Registrado:</Text>
            <View style={isPublicForm || !r.tipo_pago ? styles.badgePending : styles.badgePaid}>
              <Text style={styles.badgeText}>
                {isPublicForm || !r.tipo_pago 
                  ? "PENDIENTE DE PAGO" 
                  : `${r.tipo_pago === 'becado' ? 'BECADO' : r.tipo_pago === 'medio pago' ? 'PAGO MEDIO' : `PAGO ${r.tipo_pago?.toUpperCase()}`}${r.numero_factura ? ` (Factura: ${r.numero_factura})` : ""}`}
              </Text>
            </View>
          </View>
        </View>

        {/* 2. INFORMACIÓN DE CONTACTO / ENCARGADOS */}
        {renderSectionTitle("2. INFORMACION DE CONTACTO / ENCARGADOS")}
        <View style={styles.row}>
          <View style={[styles.card, styles.col2, { marginBottom: 0 }]}>
            <Text style={[styles.label, { marginBottom: 8, fontSize: 9, letterSpacing: 1 }]}>CONTACTO 1 (PRINCIPAL)</Text>
            <View style={{ marginBottom: 6 }}>
              <Text style={styles.label}>NOMBRE</Text>
              <Text style={styles.value}>{r.contacto1_nombres} {r.contacto1_apellidos}</Text>
            </View>
            <View style={{ marginBottom: 6 }}>
              <Text style={styles.label}>RELACION / TELEFONO</Text>
              <Text style={styles.value}>{r.contacto1_relacion} - {r.contacto1_telefono}</Text>
            </View>
            <View>
              <Text style={styles.label}>DOCUMENTO (DUI/PASAPORTE)</Text>
              {r.contacto1_dui ? <Text style={styles.value}>{r.contacto1_dui}</Text> : <Text style={styles.valueItalic}>Sin registrar</Text>}
            </View>
          </View>

          <View style={[styles.card, styles.col2, { marginBottom: 0 }]}>
            <Text style={[styles.label, { marginBottom: 8, fontSize: 9, letterSpacing: 1 }]}>CONTACTO 2 (ADICIONAL)</Text>
            {r.contacto2_nombres ? (
              <>
                <View style={{ marginBottom: 6 }}>
                  <Text style={styles.label}>NOMBRE</Text>
                  <Text style={styles.value}>{r.contacto2_nombres} {r.contacto2_apellidos || ""}</Text>
                </View>
                <View style={{ marginBottom: 6 }}>
                  <Text style={styles.label}>RELACION / TELEFONO</Text>
                  <Text style={styles.value}>{r.contacto2_relacion} - {r.contacto2_telefono}</Text>
                </View>
                <View>
                  <Text style={styles.label}>DOCUMENTO (DUI/PASAPORTE)</Text>
                  {r.contacto2_dui ? <Text style={styles.value}>{r.contacto2_dui}</Text> : <Text style={styles.valueItalic}>Sin registrar</Text>}
                </View>
              </>
            ) : (
              <Text style={[styles.valueItalic, { marginTop: 15 }]}>No se registro un segundo contacto.</Text>
            )}
          </View>
        </View>

        {/* 3. SALUD Y CONTACTO DE EMERGENCIA */}
        {renderSectionTitle("3. SALUD Y CONTACTO DE EMERGENCIA")}
        <View style={[styles.card, { marginBottom: 10 }]}>
          <Text style={styles.label}>EN CASO DE EMERGENCIA AVISAR A:</Text>
          <Text style={styles.value}>{r.emergencia_nombres} {r.emergencia_apellidos} ({r.emergencia_relacion}) - {r.emergencia_telefono}</Text>
        </View>
        <View style={styles.row}>
          <View style={[styles.card, styles.col2, { marginBottom: 0 }]}>
            <Text style={[styles.label, { marginBottom: 6 }]}>ENFERMEDADES Y TRATAMIENTO</Text>
            {r.enfermedades ? (
              <>
                <Text style={styles.valueNormal}>Diagnostico: <Text style={styles.value}>{r.enfermedades}</Text></Text>
                {r.tratamiento_enfermedades && <Text style={styles.valueNormal}>Tratamiento: <Text style={styles.value}>{r.tratamiento_enfermedades}</Text></Text>}
              </>
            ) : <Text style={styles.valueNormal}>Ninguna enfermedad registrada.</Text>}
          </View>
          <View style={[styles.card, styles.col2, { marginBottom: 0 }]}>
            <Text style={[styles.label, { marginBottom: 6 }]}>ALERGIAS Y TRATAMIENTO</Text>
            {r.alergias ? (
              <>
                <Text style={styles.valueNormal}>Alergias: <Text style={styles.value}>{r.alergias}</Text></Text>
                {r.tratamiento_alergias && <Text style={styles.valueNormal}>Tratamiento: <Text style={styles.value}>{r.tratamiento_alergias}</Text></Text>}
              </>
            ) : <Text style={styles.valueNormal}>Ninguna alergia registrada.</Text>}
          </View>
        </View>

        {/* 4. DECLARACION Y FIRMA */}
        {renderSectionTitle("4. DECLARACION Y FIRMA RESPONSABLE")}
        <View style={[styles.card, { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }]}>
          <View style={{ flex: 1 }}>
            <View style={{ marginBottom: 6 }}>
              <Text style={styles.label}>DECLARANTE RESPONSABLE</Text>
              <Text style={styles.value}>{r.declarante_nombre}</Text>
            </View>
            <View style={{ marginBottom: 8 }}>
              <Text style={styles.label}>DUI DECLARANTE</Text>
              <Text style={styles.value}>{r.declarante_dui}</Text>
            </View>
            <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold" }}>✓ Acepto Declaracion Jurada y Reglamento</Text>
          </View>
          <View style={{ alignItems: "center" }}>
            <Text style={[styles.label, { marginBottom: 4 }]}>FIRMA RESPONSABLE</Text>
            <View style={styles.signatureBox}>
              {r.firma_url ? <Image src={r.firma_url} style={styles.signatureImage} /> : null}
            </View>
          </View>
        </View>
      </Page>

      {/* PÁGINA 2: Documentación */}
      <Page size="LETTER" style={styles.page}>
        {renderHeader("Documentacion Necesaria", "Requisitos obligatorios para completar tu inscripcion")}

        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.col2}>
              <Text style={styles.label}>CAMPAMENTERO:</Text>
              <Text style={styles.value}>{r.primer_nombre} {r.segundo_nombre || ""} {r.primer_apellido} {r.segundo_apellido || ""}</Text>
            </View>
            <View style={styles.col2}>
              <Text style={styles.label}>DOCUMENTO:</Text>
              <Text style={styles.value}>{r.tipo_documento}: {r.numero_documento}</Text>
            </View>
            <View style={[styles.col2, { marginBottom: 0 }]}>
              <Text style={styles.label}>CATEGORÍA:</Text>
              <Text style={styles.value}>{esMenor ? "MENOR DE EDAD" : "MAYOR DE EDAD"} ({r.edad} años)</Text>
            </View>
            <View style={[styles.col2, { marginBottom: 0 }]}>
              <Text style={styles.label}>TELÉFONO CELULAR:</Text>
              <Text style={styles.value}>{r.celular}</Text>
            </View>
          </View>
        </View>

        <View style={styles.instructionsBox}>
          <Text style={styles.instructionsHeader}>
            Para completar tu inscripción es necesario presentar los siguientes documentos:
          </Text>

          {esMenor ? (
            <View style={{ marginTop: 10 }}>
              <View style={styles.checklistTitleBox}>
                <Text style={styles.checklistTitleText}>REQUISITOS PARA MENORES DE EDAD</Text>
              </View>
              <View style={styles.checklistItem}>
                <View style={styles.checkbox} />
                <Text style={styles.checklistLabel}>Partida de nacimiento vigente</Text>
              </View>
              <View style={styles.checklistItem}>
                <View style={styles.checkbox} />
                <Text style={styles.checklistLabel}>Fotocopia partida</Text>
              </View>
              <View style={styles.checklistItem}>
                <View style={styles.checkbox} />
                <Text style={styles.checklistLabel}>DUI ambos padres</Text>
              </View>
              <View style={styles.checklistItem}>
                <View style={styles.checkbox} />
                <Text style={styles.checklistLabel}>Fotocopia de dui</Text>
              </View>
              <View style={styles.checklistItem}>
                <View style={styles.checkbox} />
                <Text style={styles.checklistLabel}>Pasaporte y copia 150%</Text>
              </View>
            </View>
          ) : (
            <View style={{ marginTop: 10 }}>
              <View style={styles.checklistTitleBox}>
                <Text style={styles.checklistTitleText}>REQUISITOS PARA MAYORES DE EDAD</Text>
              </View>
              <View style={styles.checklistItem}>
                <View style={styles.checkbox} />
                <Text style={styles.checklistLabel}>Fotocopia dui</Text>
              </View>
            </View>
          )}
        </View>

      </Page>
    </Document>
  );
}
