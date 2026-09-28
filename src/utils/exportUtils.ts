import { AjusteRazonableItem, StudentPIAR } from '../types/piar';

function escapeXml(unsafe: string): string {
  if (!unsafe) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Exporta un libro de Excel completo (.xls SpreadsheetML Multi-Pestaña) compatible con
 * Microsoft Excel, Google Sheets y LibreOffice, con formato institucional MEN Decreto 1421.
 */
export function exportDetailedExcelWorkbook(
  students: StudentPIAR[],
  adjustmentBank: AjusteRazonableItem[],
  includeDecryptedDiagnosis: boolean = true
): void {
  const timestamp = new Date().toISOString().slice(0, 10);

  const buildRowXml = (cells: string[], styleId: string = 'sData') =>
    `<Row>${cells
      .map(
        (c) =>
          `<Cell ss:StyleID="${styleId}"><Data ss:Type="String">${escapeXml(c)}</Data></Cell>`
      )
      .join('')}</Row>`;

  // Hoja 1: Consolidado PIAR & Talentos Excepcionales
  const sheet1Header = buildRowXml(
    [
      'ID Expediente',
      'Código SIMAT',
      'Nombres y Apellidos',
      'Documento Identidad',
      'Edad',
      'Curso / Grado',
      'Año Lectivo',
      'Categoría SIMAT / Necesidad',
      'Desempeño Superior / Talento',
      'Diagnóstico / Caracterización (Ley 1581)',
      'Descripción Pedagógica y Fortalezas DUA',
      'Barreras del Contexto',
      'Estado PIAR',
      'Profesional que Firma',
      'Hash Auditoría SHA-256',
      'Última Actualización',
    ],
    'sHeaderTeal'
  );

  const sheet1Rows = students
    .map((st) =>
      buildRowXml([
        st.id,
        st.codigoSimat,
        st.nombresApellidos,
        st.documentoIdentidad,
        String(st.edad),
        st.curso,
        st.anioLectivo,
        st.categoriaSimat,
        st.esDesempenoSuperior ? 'SÍ — Plan Enriquecimiento MEN' : 'NO — PIAR Decreto 1421',
        includeDecryptedDiagnosis
          ? st.diagnostico
          : st.diagnosticoCifrado || '[Cifrado AES-256-GCM]',
        st.descripcion,
        st.barrerasContexto,
        st.estadoPiar,
        st.firmaProfesional?.nombreProfesional || 'Pendiente de Firma',
        st.firmaProfesional?.hashAuditoria || 'SIN_SELLAR',
        st.updatedAt,
      ])
    )
    .join('');

  // Hoja 2: Adecuaciones por Asignatura
  const sheet2Header = buildRowXml(
    [
      'ID PIAR',
      'Estudiante',
      'Curso',
      'Año Lectivo',
      'Nombre Asignatura',
      'Indicador Original (DBA / Estándar)',
      'Indicador Ajustado / Enriquecido',
      'Ajuste del Proceso (Metodología y Evaluación DUA)',
      'Principio DUA Aplicado',
      'Barrera Mitigada',
      'Nombre del Docente',
    ],
    'sHeaderIndigo'
  );

  const sheet2Rows = students
    .flatMap((st) =>
      st.adecuaciones.map((ad) =>
        buildRowXml([
          st.id,
          st.nombresApellidos,
          st.curso,
          st.anioLectivo,
          ad.asignatura,
          ad.indicador,
          ad.indicadorAjustado,
          ad.ajusteProceso,
          ad.principioDua,
          ad.barreraIdentificada || 'N/A',
          ad.nombreDocente,
        ])
      )
    )
    .join('');

  // Hoja 3: Seguimiento por Periodos (I, II, III, IV)
  const sheet3Header = buildRowXml(
    [
      'ID PIAR',
      'Estudiante',
      'Curso',
      'Año Lectivo',
      'Periodo Académico',
      'Logros Alcanzados',
      'Evidencias Pedagógicas',
      'Observaciones y Recomendaciones',
      'Estado de Cumplimiento',
      'Profesional / Docente Responsable',
      'Fecha de Registro',
    ],
    'sHeaderAmber'
  );

  const sheet3Rows = students
    .flatMap((st) =>
      st.seguimientos.map((seg) =>
        buildRowXml([
          st.id,
          st.nombresApellidos,
          st.curso,
          st.anioLectivo,
          `Periodo ${seg.periodo}`,
          seg.logros,
          seg.evidencias,
          seg.observaciones,
          seg.estado,
          seg.responsable,
          seg.fechaActualizacion,
        ])
      )
    )
    .join('');

  // Hoja 4: Historial Longitudinal Año tras Año
  const sheet4Header = buildRowXml(
    [
      'ID PIAR',
      'Estudiante',
      'Año Lectivo Histórico',
      'Curso Cursado',
      'Resumen Diagnóstico y Contexto',
      'Logros Consolidados en el Año',
      'Ajustes Razonables Más Efectivos',
      'Recomendaciones de Transición / Promoción',
      'Estado de Promoción',
      'Profesional a Cargo',
    ],
    'sHeaderTeal'
  );

  const sheet4Rows = students
    .flatMap((st) =>
      st.historial.map((h) =>
        buildRowXml([
          st.id,
          st.nombresApellidos,
          h.anioLectivo,
          h.curso,
          h.resumenDiagnosticoYContexto,
          h.logrosConsolidados,
          h.ajustesMasEfectivos,
          h.recomendacionesPromocion,
          h.estadoPromocion,
          h.profesionalCargo,
        ])
      )
    )
    .join('');

  // Hoja 5: Banco de Ajustes Razonables
  const sheet5Header = buildRowXml(
    [
      'ID Ajuste',
      'Título de la Estrategia',
      'Categoría de Necesidad / Talento',
      'Principio DUA',
      'Asignatura Sugerida',
      'Barrera que Mitiga',
      'Indicador Base Ejemplo',
      'Indicador Ajustado Sugerido',
      'Ajuste del Proceso Detallado',
      'Fundamento Normativo Colombiano',
    ],
    'sHeaderIndigo'
  );

  const sheet5Rows = adjustmentBank
    .map((item) =>
      buildRowXml([
        item.id,
        item.titulo,
        item.categoriaNecesidad,
        item.principioDua,
        item.asignaturaSugerida,
        item.barreraQueMitiga,
        item.indicadorBaseEjemplo,
        item.indicadorAjustadoSugerido,
        item.ajusteProcesoDetallado,
        item.fundamentoNormativo,
      ])
    )
    .join('');

  const workbookXml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Top" ss:WrapText="1"/>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#0F172A"/>
  </Style>
  <Style ss:ID="sHeaderTeal">
   <Alignment ss:Vertical="Center" ss:WrapText="1"/>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#0F766E" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="sHeaderIndigo">
   <Alignment ss:Vertical="Center" ss:WrapText="1"/>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#3730A3" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="sHeaderAmber">
   <Alignment ss:Vertical="Center" ss:WrapText="1"/>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#B45309" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="sData">
   <Alignment ss:Vertical="Top" ss:WrapText="1"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
  </Style>
 </Styles>
 <Worksheet ss:Name="1_Consolidado_PIAR">
  <Table ss:DefaultColumnWidth="140" ss:DefaultRowHeight="28">
   ${sheet1Header}
   ${sheet1Rows}
  </Table>
 </Worksheet>
 <Worksheet ss:Name="2_Adecuaciones_Asignaturas">
  <Table ss:DefaultColumnWidth="150" ss:DefaultRowHeight="32">
   ${sheet2Header}
   ${sheet2Rows}
  </Table>
 </Worksheet>
 <Worksheet ss:Name="3_Seguimiento_Periodos">
  <Table ss:DefaultColumnWidth="150" ss:DefaultRowHeight="30">
   ${sheet3Header}
   ${sheet3Rows}
  </Table>
 </Worksheet>
 <Worksheet ss:Name="4_Historial_Anual">
  <Table ss:DefaultColumnWidth="150" ss:DefaultRowHeight="30">
   ${sheet4Header}
   ${sheet4Rows}
  </Table>
 </Worksheet>
 <Worksheet ss:Name="5_Banco_Ajustes_DUA">
  <Table ss:DefaultColumnWidth="150" ss:DefaultRowHeight="30">
   ${sheet5Header}
   ${sheet5Rows}
  </Table>
 </Worksheet>
</Workbook>`;

  const blob = new Blob([workbookXml], {
    type: 'application/vnd.ms-excel;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Ekiraya_IEP_Reporte_Detallado_MEN_${timestamp}.xls`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Exporta matriz plana CSV (UTF-8 con BOM para Excel en español) de todas las adecuaciones por asignatura.
 */
export function exportSubjectAdaptationsCsv(students: StudentPIAR[]): void {
  const headers = [
    'Codigo_SIMAT',
    'Estudiante',
    'Curso',
    'Anio_Lectivo',
    'Categoria_SIMAT',
    'Nombre_Asignatura',
    'Indicador_Original',
    'Indicador_Ajustado',
    'Ajuste_Del_Proceso',
    'Nombre_Docente',
    'Principio_DUA',
    'Estado_PIAR',
  ];

  const escapeCsv = (val: string) => `"${String(val || '').replace(/"/g, '""')}"`;

  const rows: string[] = [headers.join(';')];
  for (const st of students) {
    for (const ad of st.adecuaciones) {
      rows.push(
        [
          st.codigoSimat,
          st.nombresApellidos,
          st.curso,
          st.anioLectivo,
          st.categoriaSimat,
          ad.asignatura,
          ad.indicador,
          ad.indicadorAjustado,
          ad.ajusteProceso,
          ad.nombreDocente,
          ad.principioDua,
          st.estadoPiar,
        ]
          .map(escapeCsv)
          .join(';')
      );
    }
  }

  const bom = '\uFEFF';
  const blob = new Blob([bom + rows.join('\r\n')], {
    type: 'text/csv;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Ekiraya_IEP_Matriz_Asignaturas_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Genera una firma digital caligráfica en SVG Data URL cuando el profesional
 * aún no ha trazado una firma manual en el lienzo.
 */
export function generateCalligraphicSignatureSvg(name: string, license: string): string {
  const cleanName = escapeXml(name || 'Profesional a Cargo');
  const cleanLic = escapeXml(license || 'Registro Profesional');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="380" height="110" viewBox="0 0 380 110">
    <rect width="380" height="110" fill="transparent"/>
    <path d="M25,78 C65,35 105,85 155,48 C195,22 230,75 285,52 C315,40 340,62 355,55" stroke="#0F766E" stroke-width="2.2" fill="none" stroke-linecap="round" opacity="0.85"/>
    <text x="32" y="62" font-family="Georgia, 'Fraunces', serif" font-size="22" font-style="italic" font-weight="600" fill="#0F172A">${cleanName}</text>
    <text x="34" y="96" font-family="'IBM Plex Mono', monospace" font-size="10" fill="#475569">FIRMA DIGITAL VERIFICADA • ${cleanLic}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
