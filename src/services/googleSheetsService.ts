import {
  AjusteRazonableItem,
  CategoriaSimatCatalogItem,
  CursoAnioCatalogItem,
  StudentPIAR,
  UserRole,
  UsuarioPerfilCatalogItem,
} from '../types/piar';
import {
  TABLA_CATEGORIAS_SIMAT_INICIAL,
  TABLA_CURSOS_ANIOS_INICIAL,
  TABLA_USUARIOS_PERFILES_INICIAL,
} from '../data/colombianLegislationAndSeed';
import { decryptSensitiveField, encryptSensitiveField } from '../utils/crypto';

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: {
              access_token?: string;
              error?: string;
              expires_in?: number;
            }) => void;
          }) => {
            requestAccessToken: (options?: { prompt?: string }) => void;
          };
          revoke: (token: string, done: () => void) => void;
        };
      };
    };
  }
}

const SHEETS_API_BASE = 'https://sheets.googleapis.com/v4/spreadsheets';

export const EKIRAYA_REQUIRED_SHEETS = [
  { title: 'PIAR_Estudiantes', rowCount: 500, columnCount: 15 },
  { title: 'Adecuaciones_Asignaturas', rowCount: 1000, columnCount: 11 },
  { title: 'Seguimiento_Periodos', rowCount: 1000, columnCount: 10 },
  { title: 'Historial_Anual', rowCount: 1000, columnCount: 9 },
  { title: 'Banco_Ajustes', rowCount: 500, columnCount: 9 },
  { title: 'Tabla_Cursos_Anios', rowCount: 500, columnCount: 8 },
  { title: 'Tabla_Categorias_SIMAT', rowCount: 500, columnCount: 9 },
  { title: 'Usuarios_Perfiles', rowCount: 300, columnCount: 11 },
];

export function isAppsScriptUrl(input: string): boolean {
  const trimmed = (input || '').trim();
  return (
    trimmed.startsWith('https://script.google.com/macros/s/') ||
    trimmed.startsWith('https://script.googleusercontent.com/')
  );
}

export function extractSpreadsheetId(input: string): string {
  const trimmed = input.trim();
  if (isAppsScriptUrl(trimmed)) {
    return trimmed;
  }
  const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    return match[1];
  }
  return trimmed;
}

export const EKIRAYA_APPS_SCRIPT_CODE = `// ============================================================================
// SOLUCIÓN B: PUENTE GOOGLE SHEETS SIN OAUTH — COLEGIO EKIRAYÁ MONTESSORI
// ============================================================================
// INSTRUCCIONES PASO A PASO (Funciona en Vercel y cualquier dominio sin bloqueos):
// 1. Abre tu archivo de Google Sheets -> menú "Extensiones" -> "Apps Script".
// 2. Borra el código que aparece por defecto y pega TODO este código.
// 3. Haz clic en el ícono de Guardar (💾) y arriba haz clic en "Implementar" -> "Nueva implementación".
// 4. Haz clic en el engranaje (⚙️) junto a "Seleccionar tipo" y elige "Aplicación web":
//    - Descripción: "Puente PIAR DUA Ekirayá"
//    - Ejecutar como: "Yo" (tu correo)
//    - Quién tiene acceso: "Cualquier persona" (Importante para permitir sincronización CORS)
// 5. Haz clic en "Implementar", autoriza el acceso a tu hoja y copia la "URL de la aplicación web"
//    (termina en /exec). Pégala en el sistema Ekirayá y pulsa "Vincular".
// ============================================================================

const REQUIRED_SHEETS = [
  'PIAR_Estudiantes',
  'Adecuaciones_Asignaturas',
  'Seguimiento_Periodos',
  'Historial_Anual',
  'Banco_Ajustes',
  'Tabla_Cursos_Anios',
  'Tabla_Categorias_SIMAT',
  'Usuarios_Perfiles'
];

function inicializar8HojasEkiraya() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  ensureSheets(ss);
  return '8 hojas oficiales PIAR & DUA verificadas correctamente en: ' + ss.getName();
}

function ensureSheets(ss) {
  REQUIRED_SHEETS.forEach(function(title) {
    var sheet = ss.getSheetByName(title);
    if (!sheet) {
      sheet = ss.insertSheet(title);
      sheet.setFrozenRows(1);
    }
  });
}

function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  ensureSheets(ss);
  var readTabs = [
    'PIAR_Estudiantes',
    'Banco_Ajustes',
    'Tabla_Cursos_Anios',
    'Tabla_Categorias_SIMAT',
    'Usuarios_Perfiles'
  ];
  var valueRanges = readTabs.map(function(tabName) {
    var sheet = ss.getSheetByName(tabName);
    var lastRow = sheet.getLastRow();
    var lastCol = sheet.getLastColumn();
    var values = (lastRow > 1 && lastCol > 0)
      ? sheet.getRange(2, 1, lastRow - 1, lastCol).getDisplayValues()
      : [];
    return { range: tabName, values: values };
  });
  return ContentService.createTextOutput(JSON.stringify({
    ok: true,
    spreadsheetId: ss.getId(),
    spreadsheetUrl: ss.getUrl(),
    title: ss.getName(),
    valueRanges: valueRanges
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  ensureSheets(ss);
  var payload = JSON.parse(e.postData.contents || '{}');
  var dataList = payload.data || [];
  dataList.forEach(function(item) {
    var sheetName = String(item.range || '').split('!')[0];
    var rows = item.values || [];
    var sheet = ss.getSheetByName(sheetName);
    if (sheet && rows.length > 0) {
      sheet.clearContents();
      sheet.getRange(1, 1, rows.length, rows[0].length).setValues(rows);
      var headerRange = sheet.getRange(1, 1, 1, rows[0].length);
      headerRange.setBackground('#0F766E').setFontColor('#FFFFFF').setFontWeight('bold');
      sheet.setFrozenRows(1);
    }
  });
  return ContentService.createTextOutput(JSON.stringify({
    ok: true,
    spreadsheetId: ss.getId(),
    spreadsheetUrl: ss.getUrl(),
    title: ss.getName()
  })).setMimeType(ContentService.MimeType.JSON);
}`;

/**
 * Verifica que las 8 pestañas oficiales (incluyendo Tabla_Cursos_Anios, Tabla_Categorias_SIMAT y Usuarios_Perfiles)
 * existan en la hoja de Google Sheets vinculada; si falta alguna, la crea automáticamente.
 */
export async function ensureRequiredSheetsExist(
  accessToken: string,
  spreadsheetId: string
): Promise<void> {
  const metaRes = await fetch(
    `${SHEETS_API_BASE}/${spreadsheetId}?fields=sheets.properties.title`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!metaRes.ok) {
    return;
  }

  const metaData = await metaRes.json();
  const existingTitles = new Set<string>(
    (metaData.sheets || []).map((s: { properties?: { title?: string } }) => s.properties?.title || '')
  );

  const missingSheets = EKIRAYA_REQUIRED_SHEETS.filter((req) => !existingTitles.has(req.title));
  if (missingSheets.length === 0) {
    return;
  }

  const requests = missingSheets.map((sheet) => ({
    addSheet: {
      properties: {
        title: sheet.title,
        gridProperties: {
          frozenRowCount: 1,
          rowCount: sheet.rowCount,
          columnCount: sheet.columnCount,
        },
      },
    },
  }));

  await fetch(`${SHEETS_API_BASE}/${spreadsheetId}:batchUpdate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ requests }),
  });
}

/**
 * Crea una nueva hoja de cálculo estructurada en la cuenta de Google del usuario
 * con las 8 pestañas oficiales de Ekirayá IEP (incluyendo Usuarios_Perfiles, Tabla_Cursos_Anios y Tabla_Categorias_SIMAT).
 */
export async function createEkirayaSpreadsheet(
  accessToken: string,
  students: StudentPIAR[],
  adjustmentBank: AjusteRazonableItem[],
  encryptionKey?: string,
  cursosCatalog: CursoAnioCatalogItem[] = TABLA_CURSOS_ANIOS_INICIAL,
  categoriasCatalog: CategoriaSimatCatalogItem[] = TABLA_CATEGORIAS_SIMAT_INICIAL,
  usuariosCatalog: UsuarioPerfilCatalogItem[] = TABLA_USUARIOS_PERFILES_INICIAL
): Promise<{ spreadsheetId: string; spreadsheetUrl: string; title: string }> {
  const title = `Ekirayá IEP — Base de Datos PIAR & DUA (2026-2027)`;

  const createPayload = {
    properties: {
      title,
      locale: 'es_CO',
    },
    sheets: EKIRAYA_REQUIRED_SHEETS.map((s) => ({
      properties: {
        title: s.title,
        gridProperties: {
          frozenRowCount: 1,
          rowCount: s.rowCount,
          columnCount: s.columnCount,
        },
      },
    })),
  };

  const response = await fetch(SHEETS_API_BASE, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(createPayload),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Error al crear Google Sheet (${response.status}): ${errText}`);
  }

  const created = await response.json();
  const spreadsheetId: string = created.spreadsheetId;
  const spreadsheetUrl: string =
    created.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  await pushAllDataToSpreadsheet(
    accessToken,
    spreadsheetId,
    students,
    adjustmentBank,
    encryptionKey,
    cursosCatalog,
    categoriasCatalog,
    usuariosCatalog
  );

  return { spreadsheetId, spreadsheetUrl, title };
}

/**
 * Sincroniza (escribe) todos los registros PIAR, adecuaciones, seguimientos,
 * historial, banco de ajustes, Tabla_Cursos_Anios, Tabla_Categorias_SIMAT y Usuarios_Perfiles hacia el Google Sheet vinculado.
 */
export async function pushAllDataToSpreadsheet(
  accessToken: string,
  spreadsheetId: string,
  students: StudentPIAR[],
  adjustmentBank: AjusteRazonableItem[],
  encryptionKey?: string,
  cursosCatalog: CursoAnioCatalogItem[] = TABLA_CURSOS_ANIOS_INICIAL,
  categoriasCatalog: CategoriaSimatCatalogItem[] = TABLA_CATEGORIAS_SIMAT_INICIAL,
  usuariosCatalog: UsuarioPerfilCatalogItem[] = TABLA_USUARIOS_PERFILES_INICIAL
): Promise<void> {
  const usingAppsScript = isAppsScriptUrl(spreadsheetId);
  if (!usingAppsScript) {
    // Asegurar que las 8 pestañas existan (incluyendo Usuarios_Perfiles)
    await ensureRequiredSheetsExist(accessToken, spreadsheetId);
  }

  // 1. Construir filas de PIAR_Estudiantes con Diagnóstico Cifrado AES-256-GCM
  const studentRows: string[][] = [
    [
      'ID_PIAR',
      'Codigo_SIMAT',
      'Nombres_Apellidos',
      'Documento',
      'Curso',
      'Anio_Lectivo',
      'Categoria_SIMAT',
      'Desempeno_Superior',
      'Diagnostico_Cifrado_AES256',
      'Descripcion_Pedagogica',
      'Estado_PIAR',
      'Ultima_Actualizacion_ISO',
      'Modificado_Por',
      'Firma_Hash_SHA256',
      'Payload_JSON_Sincronizacion',
    ],
  ];

  for (const st of students) {
    const encryptedDiag = await encryptSensitiveField(st.diagnostico, encryptionKey);
    const storedStudent: StudentPIAR = {
      ...st,
      diagnostico: encryptedDiag,
      diagnosticoCifrado: encryptedDiag,
    };

    studentRows.push([
      st.id,
      st.codigoSimat,
      st.nombresApellidos,
      st.documentoIdentidad,
      st.curso,
      st.anioLectivo,
      st.categoriaSimat,
      st.esDesempenoSuperior ? 'SÍ (Talento/Capacidad Excepcional)' : 'NO (PIAR Ajuste Razonable)',
      encryptedDiag,
      st.descripcion,
      st.estadoPiar,
      st.updatedAt,
      st.lastModifiedBy,
      st.firmaProfesional?.hashAuditoria || 'SIN_FIRMAR',
      JSON.stringify(storedStudent),
    ]);
  }

  // 2. Construir filas de Adecuaciones_Asignaturas
  const adecuacionesRows: string[][] = [
    [
      'ID_Adecuacion',
      'ID_PIAR',
      'Estudiante',
      'Curso',
      'Anio_Lectivo',
      'Nombre_Asignatura',
      'Indicador_Original',
      'Indicador_Ajustado',
      'Ajuste_Del_Proceso',
      'Nombre_Docente',
      'Principio_DUA',
    ],
  ];

  for (const st of students) {
    for (const ad of st.adecuaciones) {
      adecuacionesRows.push([
        ad.id,
        st.id,
        st.nombresApellidos,
        st.curso,
        st.anioLectivo,
        ad.asignatura,
        ad.indicador,
        ad.indicadorAjustado,
        ad.ajusteProceso,
        ad.nombreDocente,
        ad.principioDua,
      ]);
    }
  }

  // 3. Construir filas de Seguimiento_Periodos
  const seguimientoRows: string[][] = [
    [
      'ID_PIAR',
      'Estudiante',
      'Curso',
      'Anio_Lectivo',
      'Periodo',
      'Logros_Alcanzados',
      'Evidencias_Pedagogicas',
      'Observaciones_Y_Recomendaciones',
      'Estado_Cumplimiento',
      'Profesional_Responsable',
    ],
  ];

  for (const st of students) {
    for (const seg of st.seguimientos) {
      seguimientoRows.push([
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
      ]);
    }
  }

  // 4. Construir filas de Historial_Anual
  const historialRows: string[][] = [
    [
      'ID_Historial',
      'ID_PIAR',
      'Estudiante',
      'Anio_Lectivo',
      'Curso',
      'Contexto_Y_Valoracion',
      'Logros_Consolidados',
      'Ajustes_Efectivos',
      'Estado_Promocion',
    ],
  ];

  for (const st of students) {
    for (const h of st.historial) {
      historialRows.push([
        h.id,
        st.id,
        st.nombresApellidos,
        h.anioLectivo,
        h.curso,
        h.resumenDiagnosticoYContexto,
        h.logrosConsolidados,
        h.ajustesMasEfectivos,
        h.estadoPromocion,
      ]);
    }
  }

  // 5. Construir filas de Banco_Ajustes
  const bancoRows: string[][] = [
    [
      'ID_Ajuste',
      'Titulo_Estrategia',
      'Categoria_Necesidad',
      'Principio_DUA',
      'Asignatura_Sugerida',
      'Indicador_Base',
      'Indicador_Ajustado_Sugerido',
      'Ajuste_Del_Proceso',
      'Payload_JSON',
    ],
  ];

  for (const item of adjustmentBank) {
    bancoRows.push([
      item.id,
      item.titulo,
      item.categoriaNecesidad,
      item.principioDua,
      item.asignaturaSugerida,
      item.indicadorBaseEjemplo,
      item.indicadorAjustadoSugerido,
      item.ajusteProcesoDetallado,
      JSON.stringify(item),
    ]);
  }

  // 6. Construir filas de Tabla_Cursos_Anios (Cursos y Años Lectivos 2026-2027, etc.)
  const cursosRows: string[][] = [
    [
      'ID_Curso',
      'Codigo_Curso',
      'Nombre_Curso',
      'Nivel_Educativo',
      'Anio_Lectivo',
      'Director_Grupo',
      'Estado_Vigencia',
      'Payload_JSON',
    ],
  ];

  for (const c of cursosCatalog) {
    cursosRows.push([
      c.id,
      c.codigoCurso,
      c.nombreCurso || c.curso || '',
      c.nivelEducativo,
      c.anioLectivo,
      c.directorGrupo,
      c.activo !== undefined ? (c.activo ? 'ACTIVO' : 'HISTÓRICO') : c.estadoAnio || 'ACTIVO',
      JSON.stringify(c),
    ]);
  }

  // 7. Construir filas de Tabla_Categorias_SIMAT (Categorías SIMAT / Necesidad o Desempeño Superior)
  const categoriasRows: string[][] = [
    [
      'ID_Categoria',
      'Codigo_SIMAT_MEN',
      'Categoria_SIMAT_Necesidad_O_Desempeno_Superior',
      'Tipo_Ruta',
      'Normativa_Aplicable_MEN',
      'Principio_DUA_Prioritario',
      'Descripcion_Tecnica',
      'Requisito_Soporte_Expediente',
      'Payload_JSON',
    ],
  ];

  for (const cat of categoriasCatalog) {
    categoriasRows.push([
      cat.id,
      cat.codigoSimatMen,
      cat.categoria || cat.categoriaSimat || '',
      cat.tipoRuta,
      cat.normativaReferencia || 'Decreto 1421 de 2017 MEN',
      cat.principioDuaPrioritario,
      cat.descripcionTecnica || cat.requisitoSoporteAuditor || '',
      cat.requiereSoporteClinicoOPedagogico || cat.requisitoSoporteAuditor || '',
      JSON.stringify(cat),
    ]);
  }

  // 8. Construir filas de Usuarios_Perfiles (Usuarios, Perfiles, Roles y Credenciales Institucionales)
  const usuariosRows: string[][] = [
    [
      'ID_Usuario',
      'Correo_Institucional',
      'Username_Acceso',
      'Nombres_Apellidos',
      'Perfil_Rol',
      'Cargo_Area_Asignatura',
      'Tarjeta_Profesional_Registro',
      'Clave_O_Pin_Acceso',
      'Permisos_Perfil',
      'Estado_Usuario',
      'Payload_JSON',
    ],
  ];

  for (const usr of usuariosCatalog) {
    usuariosRows.push([
      usr.id,
      usr.correoInstitucional,
      usr.username,
      usr.nombresApellidos,
      usr.rol,
      usr.cargoArea,
      usr.tarjetaProfesional || 'N/A',
      usr.claveAcceso,
      usr.permisosResumen,
      usr.activo ? 'ACTIVO' : 'INACTIVO',
      JSON.stringify(usr),
    ]);
  }

  const body = {
    valueInputOption: 'RAW',
    data: [
      { range: 'PIAR_Estudiantes!A1', values: studentRows },
      { range: 'Adecuaciones_Asignaturas!A1', values: adecuacionesRows },
      { range: 'Seguimiento_Periodos!A1', values: seguimientoRows },
      { range: 'Historial_Anual!A1', values: historialRows },
      { range: 'Banco_Ajustes!A1', values: bancoRows },
      { range: 'Tabla_Cursos_Anios!A1', values: cursosRows },
      { range: 'Tabla_Categorias_SIMAT!A1', values: categoriasRows },
      { range: 'Usuarios_Perfiles!A1', values: usuariosRows },
    ],
  };

  if (usingAppsScript) {
    const res = await fetch(spreadsheetId, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      throw new Error(`Error al sincronizar mediante Puente Apps Script (${res.status})`);
    }
    return;
  }

  const batchUpdateUrl = `${SHEETS_API_BASE}/${spreadsheetId}/values:batchUpdate`;
  const res = await fetch(batchUpdateUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Error al sincronizar datos con Google Sheets (${res.status}): ${errText}`);
  }
}

/**
 * Lee los registros en tiempo real desde el Google Sheet vinculado (incluyendo
 * Tabla_Cursos_Anios, Tabla_Categorias_SIMAT y Usuarios_Perfiles) y descifra los diagnósticos con AES-256-GCM.
 */
export async function pullDataFromSpreadsheet(
  accessToken: string,
  spreadsheetId: string,
  encryptionKey?: string
): Promise<{
  students: StudentPIAR[] | null;
  adjustmentBank: AjusteRazonableItem[] | null;
  cursosCatalog: CursoAnioCatalogItem[] | null;
  categoriasCatalog: CategoriaSimatCatalogItem[] | null;
  usuariosCatalog: UsuarioPerfilCatalogItem[] | null;
  spreadsheetUrl?: string;
  spreadsheetTitle?: string;
}> {
  let data: {
    valueRanges?: { values?: string[][] }[];
    spreadsheetUrl?: string;
    title?: string;
  } = {};

  if (isAppsScriptUrl(spreadsheetId)) {
    const res = await fetch(spreadsheetId, { method: 'GET' });
    if (!res.ok) {
      throw new Error(`Error al leer desde Puente Apps Script (${res.status})`);
    }
    data = await res.json();
  } else {
    const rangesQuery = [
      'ranges=PIAR_Estudiantes!A2:O500',
      'ranges=Banco_Ajustes!A2:I500',
      'ranges=Tabla_Cursos_Anios!A2:H500',
      'ranges=Tabla_Categorias_SIMAT!A2:I500',
      'ranges=Usuarios_Perfiles!A2:K300',
    ].join('&');

    const batchGetUrl = `${SHEETS_API_BASE}/${spreadsheetId}/values:batchGet?${rangesQuery}`;
    const res = await fetch(batchGetUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) {
      if (res.status === 400) {
        await ensureRequiredSheetsExist(accessToken, spreadsheetId);
        return {
          students: null,
          adjustmentBank: null,
          cursosCatalog: null,
          categoriasCatalog: null,
          usuariosCatalog: null,
        };
      }
      const errText = await res.text();
      throw new Error(`Error al leer Google Sheet (${res.status}): ${errText}`);
    }

    data = await res.json();
  }
  const valueRanges = data.valueRanges || [];
  const rawStudentRows: string[][] = valueRanges[0]?.values || [];
  const rawBankRows: string[][] = valueRanges[1]?.values || [];
  const rawCursosRows: string[][] = valueRanges[2]?.values || [];
  const rawCategoriasRows: string[][] = valueRanges[3]?.values || [];
  const rawUsuariosRows: string[][] = valueRanges[4]?.values || [];

  const parsedStudents: StudentPIAR[] = [];
  for (const row of rawStudentRows) {
    const jsonCol = row[14];
    if (jsonCol) {
      try {
        const parsed = JSON.parse(jsonCol) as StudentPIAR;
        const encryptedDiag = parsed.diagnosticoCifrado || row[8] || parsed.diagnostico;
        const decryptedDiag = await decryptSensitiveField(encryptedDiag, encryptionKey);
        parsedStudents.push({
          ...parsed,
          diagnostico: decryptedDiag,
          diagnosticoCifrado: encryptedDiag,
        });
      } catch {
        // Ignorar fila corrupta
      }
    }
  }

  const parsedBank: AjusteRazonableItem[] = [];
  for (const row of rawBankRows) {
    const jsonCol = row[8];
    if (jsonCol) {
      try {
        parsedBank.push(JSON.parse(jsonCol) as AjusteRazonableItem);
      } catch {
        // Ignorar fila corrupta
      }
    }
  }

  const parsedCursos: CursoAnioCatalogItem[] = [];
  for (const row of rawCursosRows) {
    const jsonCol = row[7];
    if (jsonCol) {
      try {
        const parsed = JSON.parse(jsonCol) as CursoAnioCatalogItem;
        const label = row[2] || parsed.nombreCurso || parsed.curso;
        parsedCursos.push({
          ...parsed,
          codigoCurso: row[1] || parsed.codigoCurso,
          curso: label,
          nombreCurso: label,
          nivelEducativo: (row[3] as CursoAnioCatalogItem['nivelEducativo']) || parsed.nivelEducativo,
          anioLectivo: row[4] || parsed.anioLectivo,
          directorGrupo: row[5] || parsed.directorGrupo,
          activo: row[6] ? row[6].toUpperCase() !== 'HISTÓRICO' : parsed.activo,
        });
      } catch {
        // Ignorar fila corrupta
      }
    } else if (row[2] && row[4]) {
      parsedCursos.push({
        id: row[0] || `cur-${Math.random().toString(36).slice(2, 7)}`,
        codigoCurso: row[1] || 'CUR',
        curso: row[2],
        nombreCurso: row[2],
        nivelEducativo: (row[3] as CursoAnioCatalogItem['nivelEducativo']) || 'Básica Secundaria',
        anioLectivo: row[4],
        directorGrupo: row[5] || 'Por asignar',
        activo: row[6] ? row[6].toUpperCase() !== 'HISTÓRICO' : true,
      });
    }
  }

  const parsedCategorias: CategoriaSimatCatalogItem[] = [];
  for (const row of rawCategoriasRows) {
    const jsonCol = row[8];
    if (jsonCol) {
      try {
        const parsed = JSON.parse(jsonCol) as CategoriaSimatCatalogItem;
        const catLabel = (row[2] || parsed.categoria || parsed.categoriaSimat) as CategoriaSimatCatalogItem['categoriaSimat'];
        parsedCategorias.push({
          ...parsed,
          codigoSimatMen: row[1] || parsed.codigoSimatMen,
          categoriaSimat: catLabel,
          categoria: catLabel,
          tipoRuta: (row[3] as CategoriaSimatCatalogItem['tipoRuta']) || parsed.tipoRuta,
          normativaReferencia: row[4] || parsed.normativaReferencia,
          principioDuaPrioritario: row[5] || parsed.principioDuaPrioritario,
          descripcionTecnica: row[6] || parsed.descripcionTecnica,
          requisitoSoporteAuditor:
            row[7] || parsed.requiereSoporteClinicoOPedagogico || parsed.requisitoSoporteAuditor || '',
          requiereSoporteClinicoOPedagogico:
            row[7] || parsed.requiereSoporteClinicoOPedagogico || parsed.requisitoSoporteAuditor || '',
        });
      } catch {
        // Ignorar fila corrupta
      }
    } else if (row[2]) {
      parsedCategorias.push({
        id: row[0] || `simat-${Math.random().toString(36).slice(2, 7)}`,
        codigoSimatMen: row[1] || 'SIMAT-CUSTOM',
        categoriaSimat: row[2] as CategoriaSimatCatalogItem['categoriaSimat'],
        categoria: row[2] as CategoriaSimatCatalogItem['categoria'],
        tipoRuta: (row[3] as CategoriaSimatCatalogItem['tipoRuta']) || 'PIAR (Ajuste Razonable — Decreto 1421)',
        normativaReferencia: row[4] || 'Decreto 1421 de 2017 MEN',
        principioDuaPrioritario: row[5] || 'Principios I, II y III DUA',
        descripcionTecnica: row[6] || '',
        requisitoSoporteAuditor: row[7] || '',
        requiereSoporteClinicoOPedagogico: row[7] || '',
      });
    }
  }

  const parsedUsuarios: UsuarioPerfilCatalogItem[] = [];
  for (const row of rawUsuariosRows) {
    const jsonCol = row[10];
    const normalizeRole = (rawRole?: string): UserRole => {
      const lower = (rawRole || '').toLowerCase();
      if (lower.includes('admin') || lower.includes('rector') || lower.includes('coord')) {
        return 'administrador';
      }
      if (lower.includes('psico') || lower.includes('orient')) {
        return 'psicologa';
      }
      return 'profesor';
    };

    if (jsonCol) {
      try {
        const parsed = JSON.parse(jsonCol) as UsuarioPerfilCatalogItem;
        parsedUsuarios.push({
          ...parsed,
          correoInstitucional: row[1] || parsed.correoInstitucional,
          username: row[2] || parsed.username,
          nombresApellidos: row[3] || parsed.nombresApellidos,
          rol: row[4] ? normalizeRole(row[4]) : parsed.rol,
          cargoArea: row[5] || parsed.cargoArea,
          tarjetaProfesional: row[6] || parsed.tarjetaProfesional,
          claveAcceso: row[7] || parsed.claveAcceso,
          permisosResumen: row[8] || parsed.permisosResumen,
          activo: row[9] ? row[9].toUpperCase() !== 'INACTIVO' : parsed.activo,
        });
      } catch {
        // Ignorar fila corrupta
      }
    } else if (row[1] || row[2]) {
      const roleVal = normalizeRole(row[4]);
      parsedUsuarios.push({
        id: row[0] || `usr-${Math.random().toString(36).slice(2, 7)}`,
        correoInstitucional: row[1] || `${row[2]}@cem.edu.co`,
        username: row[2] || (row[1] ? row[1].split('@')[0] : 'usuario'),
        nombresApellidos: row[3] || 'Usuario Institucional CEM',
        rol: roleVal,
        cargoArea: row[5] || 'Docente / Profesional Institucional',
        tarjetaProfesional: row[6] || 'N/A',
        claveAcceso: row[7] || 'Ekiraya2026*',
        permisosResumen:
          row[8] ||
          (roleVal === 'administrador'
            ? 'Acceso total institucional'
            : roleVal === 'psicologa'
              ? 'Diagnóstico Clínico Ley 1581, Firma Auditoría y Seguimiento'
              : 'Adecuaciones por Asignatura y Seguimiento por Periodos'),
        activo: row[9] ? row[9].toUpperCase() !== 'INACTIVO' : true,
      });
    }
  }

  return {
    students: parsedStudents.length > 0 ? parsedStudents : null,
    adjustmentBank: parsedBank.length > 0 ? parsedBank : null,
    cursosCatalog: parsedCursos.length > 0 ? parsedCursos : null,
    categoriasCatalog: parsedCategorias.length > 0 ? parsedCategorias : null,
    usuariosCatalog: parsedUsuarios.length > 0 ? parsedUsuarios : null,
    spreadsheetUrl: data.spreadsheetUrl,
    spreadsheetTitle: data.title,
  };
}
