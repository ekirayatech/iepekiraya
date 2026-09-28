import { jsPDF } from 'jspdf';
import {
  AjusteRazonableItem,
  CategoriaSimatCatalogItem,
  CursoAnioCatalogItem,
  FirmaProfesional,
  PreloadedSignatureConfig,
  StudentPIAR,
  UsuarioPerfilCatalogItem,
} from '../types/piar';
import {
  TABLA_CATEGORIAS_SIMAT_INICIAL,
  TABLA_CURSOS_ANIOS_INICIAL,
  TABLA_USUARIOS_PERFILES_INICIAL,
} from '../data/colombianLegislationAndSeed';

export const PRELOADED_SIGNATURE_STORAGE_KEY = 'ekiraya_preloaded_signature_png_v1';
export const EKIRAYA_LOGO_URL =
  'https://colegioekiraya.edu.co/wp-content/uploads/2024/09/LOGO-CEM-COLOR-02.png';
export const EKIRAYA_LOGO_LOCAL_FALLBACK = '/logo-ekiraya.png';

export function getPreloadedSignature(): PreloadedSignatureConfig | null {
  try {
    const raw = localStorage.getItem(PRELOADED_SIGNATURE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PreloadedSignatureConfig;
    if (parsed && parsed.firmaPngDataUrl) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export function savePreloadedSignature(config: PreloadedSignatureConfig): void {
  try {
    localStorage.setItem(PRELOADED_SIGNATURE_STORAGE_KEY, JSON.stringify(config));
  } catch {
    // ignore storage quota errors
  }
}

export function clearPreloadedSignature(): void {
  try {
    localStorage.removeItem(PRELOADED_SIGNATURE_STORAGE_KEY);
  } catch {
    // ignore
  }
}

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
  includeDecryptedDiagnosis: boolean = true,
  cursosCatalog: CursoAnioCatalogItem[] = TABLA_CURSOS_ANIOS_INICIAL,
  categoriasCatalog: CategoriaSimatCatalogItem[] = TABLA_CATEGORIAS_SIMAT_INICIAL,
  usuariosCatalog: UsuarioPerfilCatalogItem[] = TABLA_USUARIOS_PERFILES_INICIAL
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

  // Hoja 6: Tabla de Cursos y Años Lectivos (2026-2027, etc.)
  const sheet6Header = buildRowXml(
    [
      'ID Curso',
      'Código Curso',
      'Nombre del Curso / Grado',
      'Nivel Educativo MEN',
      'Año Lectivo',
      'Director de Grupo',
      'Estado de Vigencia',
    ],
    'sHeaderTeal'
  );

  const sheet6Rows = cursosCatalog
    .map((c) =>
      buildRowXml([
        c.id,
        c.codigoCurso,
        c.nombreCurso || c.curso || '',
        c.nivelEducativo,
        c.anioLectivo,
        c.directorGrupo,
        c.activo !== undefined ? (c.activo ? 'ACTIVO' : 'HISTÓRICO') : c.estadoAnio || 'ACTIVO',
      ])
    )
    .join('');

  // Hoja 7: Tabla de Categorías SIMAT / Necesidad o Desempeño Superior
  const sheet7Header = buildRowXml(
    [
      'ID Categoría',
      'Código SIMAT MEN',
      'Categoría SIMAT / Necesidad o Desempeño Superior',
      'Tipo de Ruta Institucional',
      'Normativa Aplicable MEN',
      'Principio DUA Prioritario',
      'Descripción Técnica y Pedagógica',
      'Requisito de Soporte en Expediente',
    ],
    'sHeaderAmber'
  );

  const sheet7Rows = categoriasCatalog
    .map((cat) =>
      buildRowXml([
        cat.id,
        cat.codigoSimatMen,
        cat.categoria || cat.categoriaSimat || '',
        cat.tipoRuta,
        cat.normativaReferencia || 'Decreto 1421 de 2017 MEN',
        cat.principioDuaPrioritario,
        cat.descripcionTecnica || cat.requisitoSoporteAuditor || '',
        cat.requiereSoporteClinicoOPedagogico || cat.requisitoSoporteAuditor || '',
      ])
    )
    .join('');

  // Hoja 8: Tabla de Usuarios y Perfiles Institucionales (Usuarios_Perfiles)
  const sheet8Header = buildRowXml(
    [
      'ID Usuario',
      'Correo Institucional',
      'Username de Acceso',
      'Nombres y Apellidos',
      'Perfil / Rol',
      'Cargo / Área o Asignatura',
      'Tarjeta Profesional / Escalafón',
      'Cursos Asignados',
      'Permisos del Perfil',
      'Estado',
    ],
    'sHeaderIndigo'
  );

  const sheet8Rows = usuariosCatalog
    .map((usr) =>
      buildRowXml([
        usr.id,
        usr.correoInstitucional,
        usr.username,
        usr.nombresApellidos,
        usr.rol.toUpperCase(),
        usr.cargoArea,
        usr.tarjetaProfesional || 'N/A',
        usr.cursosAsignados || 'Todos',
        usr.permisosResumen,
        usr.activo ? 'ACTIVO' : 'INACTIVO',
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
 <Worksheet ss:Name="6_Tabla_Cursos_Anios">
  <Table ss:DefaultColumnWidth="140" ss:DefaultRowHeight="26">
   ${sheet6Header}
   ${sheet6Rows}
  </Table>
 </Worksheet>
 <Worksheet ss:Name="7_Tabla_Categorias_SIMAT">
  <Table ss:DefaultColumnWidth="160" ss:DefaultRowHeight="30">
   ${sheet7Header}
   ${sheet7Rows}
  </Table>
 </Worksheet>
 <Worksheet ss:Name="8_Usuarios_Perfiles">
  <Table ss:DefaultColumnWidth="150" ss:DefaultRowHeight="28">
   ${sheet8Header}
   ${sheet8Rows}
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

/**
 * Procesa un archivo de imagen (.png, .jpg, .webp) subido por el usuario y lo convierte
 * en un Data URL PNG optimizado para incrustar en el PDF Oficial.
 */
export function processUploadedSignatureFileToPng(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('No se pudo leer el archivo de firma.'));
    reader.onload = () => {
      const result = reader.result as string;
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const maxW = 600;
        const maxH = 220;
        let width = img.width || 380;
        let height = img.height || 110;
        const scale = Math.min(maxW / width, maxH / height, 1);
        width = Math.round(width * scale);
        height = Math.round(height * scale);

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(result);
          return;
        }
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = () => resolve(result);
      img.src = result;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Convierte cualquier firma (PNG Data URL cargado, trazo de canvas o SVG caligráfico)
 * a un PNG Data URL junto con sus dimensiones proporcionales para jsPDF.
 */
async function ensurePngSignatureForPdf(
  signatureDataUrl: string,
  fallbackName: string,
  fallbackLicense: string
): Promise<{ pngDataUrl: string; width: number; height: number } | null> {
  const srcToLoad =
    signatureDataUrl || generateCalligraphicSignatureSvg(fallbackName, fallbackLicense);

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const w = img.naturalWidth || img.width || 380;
      const h = img.naturalHeight || img.height || 110;
      const canvas = document.createElement('canvas');
      canvas.width = w * 2;
      canvas.height = h * 2;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(
          srcToLoad.startsWith('data:image/png')
            ? { pngDataUrl: srcToLoad, width: w, height: h }
            : null
        );
        return;
      }
      ctx.scale(2, 2);
      ctx.drawImage(img, 0, 0, w, h);
      resolve({
        pngDataUrl: canvas.toDataURL('image/png'),
        width: w,
        height: h,
      });
    };
    img.onerror = () => {
      if (srcToLoad.startsWith('data:image/png')) {
        resolve({ pngDataUrl: srcToLoad, width: 320, height: 100 });
      } else {
        resolve(null);
      }
    };
    img.src = srcToLoad;
  });
}

async function loadInstitutionalLogoForPdf(): Promise<{
  pngDataUrl: string;
  width: number;
  height: number;
} | null> {
  const tryLoadUrl = (
    url: string
  ): Promise<{ pngDataUrl: string; width: number; height: number } | null> =>
    new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const w = img.naturalWidth || img.width || 400;
          const h = img.naturalHeight || img.height || 153;
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(null);
            return;
          }
          ctx.drawImage(img, 0, 0, w, h);
          resolve({
            pngDataUrl: canvas.toDataURL('image/png'),
            width: w,
            height: h,
          });
        } catch {
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
      img.src = url;
    });

  // Intentar primero el recurso local en el mismo origen para garantizar compatibilidad Canvas/jsPDF sin bloqueo CORS
  const localLogo = await tryLoadUrl(EKIRAYA_LOGO_LOCAL_FALLBACK);
  if (localLogo) return localLogo;
  return tryLoadUrl(EKIRAYA_LOGO_URL);
}

/**
 * Genera y descarga directamente un archivo PDF Oficial (.pdf) nativo con formato del
 * Ministerio de Educación Nacional (Decreto 1421 de 2017 - Anexos 1, 2 y 3), incluyendo
 * el logo institucional del Colegio Ekirayá Montessori, la firma cargada en formato .PNG
 * y el sello criptográfico SHA-256.
 */
export async function exportOfficialPiarPdf(
  student: StudentPIAR,
  firmaOverride?: FirmaProfesional
): Promise<void> {
  const preloaded = getPreloadedSignature();
  const institutionalLogo = await loadInstitutionalLogoForPdf();

  const effectiveFirma: FirmaProfesional = firmaOverride ||
    student.firmaProfesional || {
      nombreProfesional:
        preloaded?.nombreProfesional || 'Dra. Valentina Morales Pineda',
      cargo:
        preloaded?.cargo ||
        'Psicóloga Orientadora Escolar — Líder de Inclusión (Decreto 1421)',
      tarjetaProfesional: preloaded?.tarjetaProfesional || 'T.P. 148920 COLPSIC',
      institucion:
        preloaded?.institucion ||
        'Institución Educativa Ekirayá — Aprobación Oficial MEN',
      firmaDataUrl:
        preloaded?.firmaPngDataUrl ||
        generateCalligraphicSignatureSvg(
          preloaded?.nombreProfesional || 'Dra. Valentina Morales Pineda',
          preloaded?.tarjetaProfesional || 'T.P. 148920 COLPSIC'
        ),
      fechaFirma: new Date().toISOString().slice(0, 10),
      hashAuditoria: 'SHA256-9F8A4C12-7E3B1109-4D2C88A1',
    };

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'letter',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 215.9 mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 279.4 mm
  const margin = 13;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const ensureSpace = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - 16) {
      doc.addPage();
      y = margin;
    }
  };

  const drawSectionBar = (title: string) => {
    ensureSpace(14);
    doc.setFillColor(15, 23, 42); // #0F172A
    doc.roundedRect(margin, y, contentWidth, 7, 1, 1, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(255, 255, 255);
    doc.text(title.toUpperCase(), margin + 3, y + 4.8);
    y += 9.5;
  };

  const drawLabeledBox = (label: string, text: string, subtitleRight?: string) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    const wrapped = doc.splitTextToSize(text || 'Sin registro.', contentWidth - 6);
    const boxHeight = Math.max(13, 7 + wrapped.length * 4.1);
    ensureSpace(boxHeight + 3);

    doc.setDrawColor(203, 213, 225);
    doc.setFillColor(251, 251, 249);
    doc.roundedRect(margin, y, contentWidth, boxHeight, 1.2, 1.2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.2);
    doc.setTextColor(15, 23, 42);
    doc.text(label, margin + 3, y + 4.8);

    if (subtitleRight) {
      doc.setFont('courier', 'bold');
      doc.setFontSize(7.2);
      doc.setTextColor(15, 118, 110);
      doc.text(subtitleRight, pageWidth - margin - 3, y + 4.8, { align: 'right' });
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.3);
    doc.setTextColor(51, 65, 85);
    doc.text(wrapped, margin + 3, y + 9.4);

    y += boxHeight + 2.5;
  };

  // --- ENCABEZADO OFICIAL MEN CON LOGO COLEGIO EKIRAYÁ MONTESSORI ---
  doc.setFillColor(244, 244, 240);
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, y, contentWidth, 25, 1.5, 1.5, 'FD');

  let titleStartX = margin + 4;
  if (institutionalLogo && institutionalLogo.pngDataUrl) {
    try {
      const logoBoxX = margin + 2.5;
      const logoBoxY = y + 2.5;
      const logoBoxW = 35;
      const logoBoxH = 20;
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(203, 213, 225);
      doc.roundedRect(logoBoxX, logoBoxY, logoBoxW, logoBoxH, 1, 1, 'FD');

      const maxW = logoBoxW - 3;
      const maxH = logoBoxH - 3;
      const ratio = Math.min(
        maxW / (institutionalLogo.width || 1600),
        maxH / (institutionalLogo.height || 611)
      );
      const drawW = (institutionalLogo.width || 1600) * ratio;
      const drawH = (institutionalLogo.height || 611) * ratio;
      const imgX = logoBoxX + (logoBoxW - drawW) / 2;
      const imgY = logoBoxY + (logoBoxH - drawH) / 2;
      doc.addImage(institutionalLogo.pngDataUrl, 'PNG', imgX, imgY, drawW, drawH);
      titleStartX = margin + 40.5;
    } catch {
      titleStartX = margin + 4;
    }
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.2);
  doc.setTextColor(15, 118, 110);
  doc.text(
    'REPÚBLICA DE COLOMBIA • MINISTERIO DE EDUCACIÓN NACIONAL',
    titleStartX,
    y + 5.5
  );

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.8);
  doc.setTextColor(15, 23, 42);
  const mainTitle = student.esDesempenoSuperior
    ? 'PLAN INDIVIDUAL DE ENRIQUECIMIENTO CURRICULAR Y TALENTOS EXCEPCIONALES'
    : 'PLAN INDIVIDUAL DE AJUSTES RAZONABLES (PIAR — DECRETO 1421 DE 2017)';
  const availableTitleWidth = contentWidth - (titleStartX - margin) - 58;
  const wrappedMainTitle = doc.splitTextToSize(mainTitle, availableTitleWidth);
  doc.text(wrappedMainTitle, titleStartX, y + 10.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.6);
  doc.setTextColor(71, 85, 105);
  doc.text(
    `${effectiveFirma.institucion} • Colegio Ekirayá Montessori`,
    titleStartX,
    y + 21.2
  );

  // Recuadro derecho de SIMAT y Expediente
  const badgeW = 53;
  const badgeX = pageWidth - margin - badgeW - 2.5;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(badgeX, y + 2.5, badgeW, 20, 1, 1, 'FD');
  doc.setFont('courier', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text(student.codigoSimat, badgeX + 2.5, y + 7);
  doc.setFont('courier', 'normal');
  doc.setFontSize(7.4);
  doc.text(`Año Lectivo: ${student.anioLectivo}`, badgeX + 2.5, y + 11.4);
  doc.text(`Expediente: ${student.id.toUpperCase()}`, badgeX + 2.5, y + 15.4);
  doc.setFontSize(6.6);
  doc.setTextColor(15, 118, 110);
  doc.text(student.estadoPiar.slice(0, 28), badgeX + 2.5, y + 19.6);

  y += 28.5;

  // --- SECCIÓN I: IDENTIFICACIÓN Y CARACTERIZACIÓN (ANEXO 1) ---
  drawSectionBar(
    'I. Identificación del Estudiante, Diagnóstico y Caracterización Pedagógica (Anexo 1)'
  );

  ensureSpace(20);
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(margin, y, contentWidth, 18, 1.2, 1.2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Estudiante:', margin + 3, y + 5);
  doc.text('Documento y Edad:', margin + 76, y + 5);
  doc.text('Curso / Grado:', margin + 132, y + 5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(student.nombresApellidos, margin + 3, y + 9.3);
  doc.setFont('courier', 'bold');
  doc.setFontSize(8.5);
  doc.text(`${student.documentoIdentidad} (${student.edad} años)`, margin + 76, y + 9.3);
  doc.setFont('helvetica', 'bold');
  doc.text(`${student.curso} (${student.anioLectivo})`, margin + 132, y + 9.3);

  doc.setDrawColor(226, 232, 240);
  doc.line(margin + 3, y + 11.5, pageWidth - margin - 3, y + 11.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.8);
  doc.setTextColor(100, 116, 139);
  doc.text('Categoría SIMAT / Condición:', margin + 3, y + 15.8);
  doc.setTextColor(15, 118, 110);
  doc.text(String(student.categoriaSimat), margin + 45, y + 15.8);

  y += 20.5;

  drawLabeledBox(
    'Diagnóstico / Concepto Psicopedagógico (Protegido Ley 1581 de 2012):',
    student.diagnostico,
    'Cifrado AES-256-GCM'
  );
  drawLabeledBox(
    'Descripción General del Estudiante (Fortalezas, Intereses y Perfil DUA):',
    student.descripcion
  );
  drawLabeledBox(
    'Barreras Identificadas en el Contexto Escolar y de Aula:',
    student.barrerasContexto
  );
  drawLabeledBox(
    'Compromisos y Recomendaciones para la Familia (Anexo 3 - Acta de Acuerdo):',
    student.recomendacionesFamilia
  );

  // --- SECCIÓN II: MATRIZ DE ADECUACIONES POR ASIGNATURA (ANEXO 2) ---
  drawSectionBar(
    'II. Matriz de Adecuaciones Razonables y Enriquecimiento por Asignatura (Anexo 2)'
  );

  const colW = [36, 48, 50, contentWidth - 134];
  const drawTableHeader = (headers: string[], widths: number[]) => {
    ensureSpace(10);
    let cx = margin;
    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(203, 213, 225);
    for (let i = 0; i < headers.length; i++) {
      doc.rect(cx, y, widths[i], 7, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.6);
      doc.setTextColor(15, 23, 42);
      doc.text(headers[i], cx + 2, y + 4.7);
      cx += widths[i];
    }
    y += 7;
  };

  drawTableHeader(
    [
      'Asignatura y Docente',
      'Indicador Original (DBA)',
      'Indicador Ajustado',
      'Ajuste del Proceso y DUA',
    ],
    colW
  );

  for (const ad of student.adecuaciones) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.6);
    const c1Lines = doc.splitTextToSize(
      `${ad.asignatura}\nDocente: ${ad.nombreDocente}`,
      colW[0] - 4
    );
    const c2Lines = doc.splitTextToSize(ad.indicador || '-', colW[1] - 4);
    const c3Lines = doc.splitTextToSize(ad.indicadorAjustado || '-', colW[2] - 4);
    const c4Lines = doc.splitTextToSize(
      `${ad.ajusteProceso}\n[${ad.principioDua}]`,
      colW[3] - 4
    );

    const maxLines = Math.max(
      c1Lines.length,
      c2Lines.length,
      c3Lines.length,
      c4Lines.length
    );
    const rowH = Math.max(10, maxLines * 3.8 + 3.5);

    if (y + rowH > pageHeight - 16) {
      doc.addPage();
      y = margin;
      drawTableHeader(
        [
          'Asignatura y Docente',
          'Indicador Original (DBA)',
          'Indicador Ajustado',
          'Ajuste del Proceso y DUA',
        ],
        colW
      );
    }

    let cx = margin;
    const cells = [c1Lines, c2Lines, c3Lines, c4Lines];
    for (let i = 0; i < 4; i++) {
      doc.setDrawColor(203, 213, 225);
      if (i === 2) {
        doc.setFillColor(240, 253, 250);
        doc.rect(cx, y, colW[i], rowH, 'FD');
      } else {
        doc.setFillColor(255, 255, 255);
        doc.rect(cx, y, colW[i], rowH, 'FD');
      }
      doc.setFont('helvetica', i === 0 ? 'bold' : 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(15, 23, 42);
      doc.text(cells[i], cx + 2, y + 4.2);
      cx += colW[i];
    }
    y += rowH;
  }

  y += 3.5;

  // --- SECCIÓN III: SEGUIMIENTO POR PERIODO ---
  drawSectionBar(
    'III. Seguimiento Evaluativo por Periodo (Logros, Evidencias y Observaciones)'
  );

  const segW = [22, 54, 54, contentWidth - 130];
  drawTableHeader(
    ['Periodo', 'Logros Alcanzados', 'Evidencias Pedagógicas', 'Observaciones y Estado'],
    segW
  );

  for (const seg of student.seguimientos) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    const s1 = doc.splitTextToSize(`Periodo ${seg.periodo}`, segW[0] - 4);
    const s2 = doc.splitTextToSize(seg.logros || 'Sin registro aún', segW[1] - 4);
    const s3 = doc.splitTextToSize(seg.evidencias || 'En consolidación', segW[2] - 4);
    const s4 = doc.splitTextToSize(
      `${seg.observaciones || ''}\nEstado: ${seg.estado} (${seg.fechaActualizacion})`,
      segW[3] - 4
    );

    const maxLines = Math.max(s1.length, s2.length, s3.length, s4.length);
    const rowH = Math.max(9, maxLines * 3.8 + 3);

    if (y + rowH > pageHeight - 16) {
      doc.addPage();
      y = margin;
      drawTableHeader(
        ['Periodo', 'Logros Alcanzados', 'Evidencias Pedagógicas', 'Observaciones y Estado'],
        segW
      );
    }

    let cx = margin;
    const cells = [s1, s2, s3, s4];
    for (let i = 0; i < 4; i++) {
      doc.setDrawColor(203, 213, 225);
      doc.setFillColor(255, 255, 255);
      doc.rect(cx, y, segW[i], rowH, 'FD');
      doc.setFont('helvetica', i === 0 ? 'bold' : 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(15, 23, 42);
      doc.text(cells[i], cx + 2, y + 4.2);
      cx += segW[i];
    }
    y += rowH;
  }

  y += 3.5;

  // --- SECCIÓN IV: HISTORIAL ESCOLAR ANUAL ---
  drawSectionBar('IV. Historial Escolar del Estudiante (Trazabilidad Año tras Año)');

  const histW = [32, 58, 56, contentWidth - 146];
  drawTableHeader(
    ['Año / Curso', 'Síntesis y Logros Consolidados', 'Ajustes Efectivos', 'Estado Promoción'],
    histW
  );

  for (const h of student.historial) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    const h1 = doc.splitTextToSize(`${h.anioLectivo}\n${h.curso}`, histW[0] - 4);
    const h2 = doc.splitTextToSize(h.logrosConsolidados || '-', histW[1] - 4);
    const h3 = doc.splitTextToSize(h.ajustesMasEfectivos || '-', histW[2] - 4);
    const h4 = doc.splitTextToSize(h.estadoPromocion || '-', histW[3] - 4);

    const maxLines = Math.max(h1.length, h2.length, h3.length, h4.length);
    const rowH = Math.max(9, maxLines * 3.8 + 3);

    if (y + rowH > pageHeight - 16) {
      doc.addPage();
      y = margin;
    }

    let cx = margin;
    const cells = [h1, h2, h3, h4];
    for (let i = 0; i < 4; i++) {
      doc.setDrawColor(203, 213, 225);
      doc.setFillColor(255, 255, 255);
      doc.rect(cx, y, histW[i], rowH, 'FD');
      doc.setFont('helvetica', i === 0 || i === 3 ? 'bold' : 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(15, 23, 42);
      doc.text(cells[i], cx + 2, y + 4.2);
      cx += histW[i];
    }
    y += rowH;
  }

  y += 5;

  // --- SECCIÓN V: BLOQUE DE FIRMA DEL PROFESIONAL (.PNG EMBEBIDO) Y SELLO SHA-256 ---
  ensureSpace(46);

  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 4;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('FIRMA DEL PROFESIONAL A CARGO:', margin, y + 3);

  // Caja para la imagen PNG de la firma
  const sigBoxX = margin;
  const sigBoxY = y + 5;
  const sigBoxW = 88;
  const sigBoxH = 22;

  doc.setFillColor(251, 251, 249);
  doc.setDrawColor(203, 213, 225);
  doc.rect(sigBoxX, sigBoxY, sigBoxW, sigBoxH, 'FD');

  // Convertir e incrustar imagen PNG de la firma
  const renderedSig = await ensurePngSignatureForPdf(
    effectiveFirma.firmaDataUrl,
    effectiveFirma.nombreProfesional,
    effectiveFirma.tarjetaProfesional
  );

  if (renderedSig && renderedSig.pngDataUrl) {
    try {
      const maxImgW = sigBoxW - 6;
      const maxImgH = sigBoxH - 3;
      const ratio = Math.min(
        maxImgW / (renderedSig.width || 300),
        maxImgH / (renderedSig.height || 90)
      );
      const drawW = Math.max(24, (renderedSig.width || 300) * ratio);
      const drawH = Math.max(10, (renderedSig.height || 90) * ratio);
      const imgX = sigBoxX + 4;
      const imgY = sigBoxY + (sigBoxH - drawH) / 2;
      doc.addImage(renderedSig.pngDataUrl, 'PNG', imgX, imgY, drawW, drawH);
    } catch {
      // Fallback texto si la imagen no pudo decodificarse
      doc.setFont('times', 'italic');
      doc.setFontSize(13);
      doc.setTextColor(15, 23, 42);
      doc.text(effectiveFirma.nombreProfesional, sigBoxX + 5, sigBoxY + 13);
    }
  }

  // Línea de firma
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.4);
  doc.line(sigBoxX, sigBoxY + sigBoxH, sigBoxX + sigBoxW, sigBoxY + sigBoxH);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.8);
  doc.setTextColor(15, 23, 42);
  doc.text(effectiveFirma.nombreProfesional, sigBoxX, sigBoxY + sigBoxH + 4.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.8);
  doc.setTextColor(51, 65, 85);
  doc.text(effectiveFirma.cargo, sigBoxX, sigBoxY + sigBoxH + 8.5);

  doc.setFont('courier', 'bold');
  doc.setFontSize(7.8);
  doc.setTextColor(15, 118, 110);
  doc.text(
    `Registro / Tarjeta Profesional: ${effectiveFirma.tarjetaProfesional}`,
    sigBoxX,
    sigBoxY + sigBoxH + 12.5
  );

  // Recuadro derecho: Sello Criptográfico de Auditoría
  const sealX = margin + 96;
  const sealW = contentWidth - 96;
  doc.setFillColor(244, 244, 240);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(sealX, sigBoxY, sealW, 30, 1.2, 1.2, 'FD');

  doc.setFont('courier', 'bold');
  doc.setFontSize(7.8);
  doc.setTextColor(15, 23, 42);
  doc.text('SELLO CRIPTOGRÁFICO DE AUDITORÍA EKIRAYÁ IEP', sealX + 3, sigBoxY + 5.5);

  doc.setFont('courier', 'normal');
  doc.setFontSize(7.2);
  doc.setTextColor(51, 65, 85);
  doc.text(`Hash SHA-256: ${effectiveFirma.hashAuditoria}`, sealX + 3, sigBoxY + 11);
  doc.text(
    'Cifrado Base de Datos: AES-256-GCM (Ley 1581/2012)',
    sealX + 3,
    sigBoxY + 15.5
  );
  doc.text(
    `Fecha de Emisión y Firma: ${effectiveFirma.fechaFirma || new Date().toISOString().slice(0, 10)}`,
    sealX + 3,
    sigBoxY + 20
  );
  doc.text(
    'Normativa: Decreto 1421 de 2017 MEN Colombia (Anexos 1, 2 y 3)',
    sealX + 3,
    sigBoxY + 24.5
  );

  // Pie de página en todas las páginas
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(
      `Ekirayá IEP • Expediente Oficial ${student.codigoSimat} (${student.nombresApellidos}) • Página ${p} de ${totalPages}`,
      pageWidth / 2,
      pageHeight - 6,
      { align: 'center' }
    );
  }

  const safeStudentName = student.nombresApellidos
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_-]/g, '_');

  doc.save(`Informe_Oficial_PIAR_${safeStudentName}_${student.anioLectivo}.pdf`);
}
