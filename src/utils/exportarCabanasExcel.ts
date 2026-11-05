import ExcelJS from "exceljs";
import { Cabana } from "../app/cabanas/DistribucionCabanas";
import { CONFIG_EVENTO_DEFAULT } from "./constants";

export interface CampamenteroExport {
  id: string;
  primer_nombre: string;
  segundo_nombre?: string | null;
  primer_apellido: string;
  segundo_apellido?: string | null;
  tipo_documento?: string | null;
  numero_documento?: string | null;
  celular?: string | null;
  genero: string;
  edad?: number | null;
  cabana_id: string | null;
  es_lider?: boolean | null;
  es_exclusion?: boolean | null;
}

/**
 * Genera y descarga un libro de Excel con formato profesional,
 * donde cada cabaña es una hoja individual con colores según género,
 * encabezado con número de bus, líderes, campamenteros/as y camas vacías.
 */
export async function exportarCabanasExcel(
  cabanas: Cabana[],
  campamenteros: CampamenteroExport[],
  nombreEvento: string = CONFIG_EVENTO_DEFAULT.nombreEvento
): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = nombreEvento;
  workbook.created = new Date();

  // Estilos reutilizables
  const superHeaderFill: ExcelJS.Fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFFCE4D6" }, // Peach / Naranja suave idéntico al requerimiento
  };

  const emptyBedFill: ExcelJS.Fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFFFC000" }, // Ámbar / Naranja para camas vacías
  };

  const thinBorder: Partial<ExcelJS.Borders> = {
    top: { style: "thin", color: { argb: "FF000000" } },
    left: { style: "thin", color: { argb: "FF000000" } },
    bottom: { style: "thin", color: { argb: "FF000000" } },
    right: { style: "thin", color: { argb: "FF000000" } },
  };

  const fontSuperHeader: Partial<ExcelJS.Font> = {
    name: "Calibri",
    size: 13,
    bold: true,
    color: { argb: "FF000000" },
  };

  const fontColumnHeader: Partial<ExcelJS.Font> = {
    name: "Calibri",
    size: 11,
    bold: true,
    color: { argb: "FF000000" },
  };

  const fontSection: Partial<ExcelJS.Font> = {
    name: "Calibri",
    size: 11,
    bold: true,
    color: { argb: "FF000000" },
  };

  const fontData: Partial<ExcelJS.Font> = {
    name: "Calibri",
    size: 10,
    color: { argb: "FF000000" },
  };

  const fontDataBold: Partial<ExcelJS.Font> = {
    name: "Calibri",
    size: 10,
    bold: true,
    color: { argb: "FF000000" },
  };

  // Nombres de hojas utilizados para evitar duplicados en Excel (máx 31 caracteres)
  const nombresHojasUsados = new Set<string>();

  for (const cabana of cabanas) {
    const esFemenina = cabana.genero.toLowerCase().startsWith("fem");

    // Limpiar y asegurar nombre de hoja único y válido para Excel (máx 31 caracteres, sin caracteres especiales)
    let nombreHoja = cabana.nombre
      .replace(/[\\/?*[\]:]/g, "")
      .trim()
      .toUpperCase();
    if (!nombreHoja) nombreHoja = "CABANA";
    if (nombreHoja.length > 28) nombreHoja = nombreHoja.substring(0, 28);

    let nombreFinal = nombreHoja;
    let contador = 2;
    while (nombresHojasUsados.has(nombreFinal)) {
      nombreFinal = `${nombreHoja.substring(0, 25)} (${contador})`;
      contador++;
    }
    nombresHojasUsados.add(nombreFinal);

    const ws = workbook.addWorksheet(nombreFinal);

    // Color de la pestaña según género: Azul para masculino, Rosa/Rojo para femenino
    ws.properties.tabColor = {
      argb: esFemenina ? "FFE11D48" : "FF2563EB",
    };

    // Asegurar que las cuadrículas de Excel sean visibles
    ws.views = [{ showGridLines: true }];

    // Configurar anchos de columna: Columna A como margen
    ws.getColumn(1).width = 3;   // Columna A (margen)
    ws.getColumn(2).width = 7;   // Columna B: N°
    ws.getColumn(3).width = 38;  // Columna C: NOMBRE COMPLETO
    ws.getColumn(4).width = 9;   // Columna D: EDAD
    ws.getColumn(5).width = 18;  // Columna E: PASAPORTE/ DUI
    ws.getColumn(6).width = 30;  // Columna F: CONTACTO

    // Extraer ocupantes de la cabaña
    const ocupantes = campamenteros.filter((p) => p.cabana_id === cabana.id);
    const lideres = ocupantes.filter((p) => p.es_lider);
    const campistas = ocupantes.filter((p) => !p.es_lider);

    // Formatear texto del bus
    let busTexto = "SIN BUS";
    if (cabana.bus) {
      const match = cabana.bus.match(/\d+/);
      busTexto = match ? match[0] : cabana.bus.toUpperCase().replace(/^BUS\s*#?/i, "").trim();
    }

    // -------------------------------------------------------------
    // FILA 3: SUPER HEADER (CABAÑA: [NOMBRE] | BUS: [N°])
    // -------------------------------------------------------------
    const rowHeader = ws.getRow(3);
    rowHeader.height = 26;

    // Combinar B3:E3 para el nombre de cabaña
    ws.mergeCells("B3:E3");
    const cellCabana = ws.getCell("B3");
    cellCabana.value = `CABAÑA: ${cabana.nombre.toUpperCase()}`;
    cellCabana.font = fontSuperHeader;
    cellCabana.alignment = { horizontal: "center", vertical: "middle" };

    // F3: Bus
    const cellBus = ws.getCell("F3");
    cellBus.value = `BUS: ${busTexto}`;
    cellBus.font = fontSuperHeader;
    cellBus.alignment = { horizontal: "center", vertical: "middle" };

    // Aplicar fondo y bordes a toda la fila 3 (B3 a F3)
    for (let col = 2; col <= 6; col++) {
      const cell = ws.getRow(3).getCell(col);
      cell.fill = superHeaderFill;
      cell.border = thinBorder;
    }

    // -------------------------------------------------------------
    // FILA 4: ENCABEZADOS DE COLUMNA
    // -------------------------------------------------------------
    const rowCols = ws.getRow(4);
    rowCols.height = 22;

    const columnas = [
      { col: 2, label: "N°" },
      { col: 3, label: "NOMBRE COMPLETO" },
      { col: 4, label: "EDAD" },
      { col: 5, label: "PASAPORTE/ DUI" },
      { col: 6, label: "CONTACTO" },
    ];

    columnas.forEach(({ col, label }) => {
      const cell = rowCols.getCell(col);
      cell.value = label;
      cell.font = fontColumnHeader;
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.border = thinBorder;
    });

    let currentRow = 5;
    let bedNumber = 1;

    // -------------------------------------------------------------
    // SECCIÓN 1: LÍDERES
    // -------------------------------------------------------------
    ws.mergeCells(`B${currentRow}:F${currentRow}`);
    const rowLideresHeader = ws.getRow(currentRow);
    rowLideresHeader.height = 20;
    const cellLideresTitle = ws.getCell(`B${currentRow}`);
    cellLideresTitle.value = "LÍDERES";
    cellLideresTitle.font = fontSection;
    cellLideresTitle.alignment = { horizontal: "center", vertical: "middle" };

    for (let c = 2; c <= 6; c++) {
      rowLideresHeader.getCell(c).border = thinBorder;
    }
    currentRow++;

    // Filas de líderes
    if (lideres.length === 0) {
      const row = ws.getRow(currentRow);
      row.height = 20;

      const cellNum = row.getCell(2);
      cellNum.value = "-";
      cellNum.font = fontData;
      cellNum.alignment = { horizontal: "center", vertical: "middle" };
      cellNum.border = thinBorder;

      const cellNom = row.getCell(3);
      cellNom.value = "(SIN LÍDER ASIGNADO)";
      cellNom.font = { name: "Calibri", size: 10, italic: true, color: { argb: "FF888888" } };
      cellNom.alignment = { horizontal: "left", vertical: "middle" };
      cellNom.border = thinBorder;

      for (let c = 4; c <= 6; c++) {
        const cell = row.getCell(c);
        cell.value = "-";
        cell.font = fontData;
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.border = thinBorder;
      }

      currentRow++;
    } else {
      for (const lid of lideres) {
        const row = ws.getRow(currentRow);
        row.height = 20;

        const nombreCompleto = `${lid.primer_nombre || ""} ${lid.segundo_nombre || ""} ${lid.primer_apellido || ""} ${lid.segundo_apellido || ""}`
          .replace(/\s+/g, " ")
          .trim()
          .toUpperCase();

        // Col B: N°
        const cellNum = row.getCell(2);
        cellNum.value = bedNumber;
        cellNum.font = fontData;
        cellNum.alignment = { horizontal: "center", vertical: "middle" };
        cellNum.border = thinBorder;

        // Col C: Nombre
        const cellNom = row.getCell(3);
        cellNom.value = nombreCompleto;
        cellNom.font = fontData;
        cellNom.alignment = { horizontal: "left", vertical: "middle" };
        cellNom.border = thinBorder;

        // Col D: Edad
        const cellEdad = row.getCell(4);
        cellEdad.value = typeof lid.edad === "number" ? lid.edad : "";
        cellEdad.font = fontData;
        cellEdad.alignment = { horizontal: "center", vertical: "middle" };
        cellEdad.border = thinBorder;

        // Col E: Documento
        const cellDoc = row.getCell(5);
        cellDoc.value = lid.numero_documento || "-";
        cellDoc.font = fontData;
        cellDoc.alignment = { horizontal: "center", vertical: "middle" };
        cellDoc.border = thinBorder;

        // Col F: Contacto
        const cellTel = row.getCell(6);
        cellTel.value = lid.celular || "-";
        cellTel.font = fontData;
        cellTel.alignment = { horizontal: "center", vertical: "middle" };
        cellTel.border = thinBorder;

        currentRow++;
        bedNumber++;
      }
    }

    // -------------------------------------------------------------
    // SECCIÓN 2: CAMPAMENTEROS / CAMPAMENTERAS
    // -------------------------------------------------------------
    ws.mergeCells(`B${currentRow}:F${currentRow}`);
    const rowCampHeader = ws.getRow(currentRow);
    rowCampHeader.height = 20;
    const cellCampTitle = ws.getCell(`B${currentRow}`);
    cellCampTitle.value = esFemenina ? "CAMPAMENTERAS" : "CAMPAMENTEROS";
    cellCampTitle.font = fontSection;
    cellCampTitle.alignment = { horizontal: "center", vertical: "middle" };

    for (let c = 2; c <= 6; c++) {
      rowCampHeader.getCell(c).border = thinBorder;
    }
    currentRow++;

    // Filas de campamenteros
    for (const camp of campistas) {
      const row = ws.getRow(currentRow);
      row.height = 20;

      const nombreCompleto = `${camp.primer_nombre || ""} ${camp.segundo_nombre || ""} ${camp.primer_apellido || ""} ${camp.segundo_apellido || ""}`
        .replace(/\s+/g, " ")
        .trim()
        .toUpperCase();

      // Col B: N°
      const cellNum = row.getCell(2);
      cellNum.value = bedNumber;
      cellNum.font = fontData;
      cellNum.alignment = { horizontal: "center", vertical: "middle" };
      cellNum.border = thinBorder;

      // Col C: Nombre
      const cellNom = row.getCell(3);
      cellNom.value = nombreCompleto;
      cellNom.font = fontData;
      cellNom.alignment = { horizontal: "left", vertical: "middle" };
      cellNom.border = thinBorder;

      // Col D: Edad
      const cellEdad = row.getCell(4);
      cellEdad.value = typeof camp.edad === "number" ? camp.edad : "";
      cellEdad.font = fontData;
      cellEdad.alignment = { horizontal: "center", vertical: "middle" };
      cellEdad.border = thinBorder;

      // Col E: Documento
      const cellDoc = row.getCell(5);
      cellDoc.value = camp.numero_documento || "-";
      cellDoc.font = fontData;
      cellDoc.alignment = { horizontal: "center", vertical: "middle" };
      cellDoc.border = thinBorder;

      // Col F: Contacto
      const cellTel = row.getCell(6);
      cellTel.value = camp.celular || "-";
      cellTel.font = fontData;
      cellTel.alignment = { horizontal: "center", vertical: "middle" };
      cellTel.border = thinBorder;

      currentRow++;
      bedNumber++;
    }

    // -------------------------------------------------------------
    // SECCIÓN 3: CAMAS VACÍAS (en fondo ámbar / naranja)
    // -------------------------------------------------------------
    while (bedNumber <= cabana.capacidad) {
      const row = ws.getRow(currentRow);
      row.height = 20;

      // Col B: Número de cama
      const cellNum = row.getCell(2);
      cellNum.value = bedNumber;
      cellNum.font = fontDataBold;
      cellNum.alignment = { horizontal: "center", vertical: "middle" };
      cellNum.fill = emptyBedFill;
      cellNum.border = thinBorder;

      // Columnas C..F vacías con fondo naranja
      for (let c = 3; c <= 6; c++) {
        const cell = row.getCell(c);
        cell.value = "";
        cell.fill = emptyBedFill;
        cell.border = thinBorder;
      }

      currentRow++;
      bedNumber++;
    }
  }

  // Generar Buffer del libro y disparar descarga nativa del navegador
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  const safeName = nombreEvento.replace(/\s+/g, "_");
  anchor.download = `Distribucion_Cabanas_${safeName}.xlsx`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
