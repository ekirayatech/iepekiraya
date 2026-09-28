import { AjusteRazonableItem, StudentPIAR } from '../types/piar';
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

export function extractSpreadsheetId(input: string): string {
  const trimmed = input.trim();
  const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    return match[1];
  }
  return trimmed;
}

/**
 * Crea una nueva hoja de cálculo estructurada en la cuenta de Google del usuario
 * con las 5 pestañas oficiales de Ekirayá IEP y carga los datos actuales.
 */
export async function createEkirayaSpreadsheet(
  accessToken: string,
  students: StudentPIAR[],
  adjustmentBank: AjusteRazonableItem[],
  encryptionKey?: string
): Promise<{ spreadsheetId: string; spreadsheetUrl: string; title: string }> {
  const title = `Ekirayá IEP — Base de Datos PIAR & DUA (${new Date().getFullYear()})`;

  const createPayload = {
    properties: {
      title,
      locale: 'es_CO',
    },
    sheets: [
      {
        properties: {
          title: 'PIAR_Estudiantes',
          gridProperties: { frozenRowCount: 1, rowCount: 500, columnCount: 15 },
        },
      },
      {
        properties: {
          title: 'Adecuaciones_Asignaturas',
          gridProperties: { frozenRowCount: 1, rowCount: 1000, columnCount: 11 },
        },
      },
      {
        properties: {
          title: 'Seguimiento_Periodos',
          gridProperties: { frozenRowCount: 1, rowCount: 1000, columnCount: 10 },
        },
      },
      {
        properties: {
          title: 'Historial_Anual',
          gridProperties: { frozenRowCount: 1, rowCount: 1000, columnCount: 9 },
        },
      },
      {
        properties: {
          title: 'Banco_Ajustes',
          gridProperties: { frozenRowCount: 1, rowCount: 500, columnCount: 9 },
        },
      },
    ],
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
    encryptionKey
  );

  return { spreadsheetId, spreadsheetUrl, title };
}

/**
 * Sincroniza (escribe) todos los registros PIAR, adecuaciones, seguimientos,
 * historial y banco de ajustes hacia el Google Sheet vinculado, cifrando el diagnóstico con AES-256-GCM.
 */
export async function pushAllDataToSpreadsheet(
  accessToken: string,
  spreadsheetId: string,
  students: StudentPIAR[],
  adjustmentBank: AjusteRazonableItem[],
  encryptionKey?: string
): Promise<void> {
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

  const batchUpdateUrl = `${SHEETS_API_BASE}/${spreadsheetId}/values:batchUpdate`;
  const body = {
    valueInputOption: 'RAW',
    data: [
      { range: 'PIAR_Estudiantes!A1', values: studentRows },
      { range: 'Adecuaciones_Asignaturas!A1', values: adecuacionesRows },
      { range: 'Seguimiento_Periodos!A1', values: seguimientoRows },
      { range: 'Historial_Anual!A1', values: historialRows },
      { range: 'Banco_Ajustes!A1', values: bancoRows },
    ],
  };

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
 * Lee los registros en tiempo real desde el Google Sheet vinculado y descifra
 * los diagnósticos con la clave institucional AES-256-GCM.
 */
export async function pullDataFromSpreadsheet(
  accessToken: string,
  spreadsheetId: string,
  encryptionKey?: string
): Promise<{
  students: StudentPIAR[] | null;
  adjustmentBank: AjusteRazonableItem[] | null;
}> {
  const batchGetUrl = `${SHEETS_API_BASE}/${spreadsheetId}/values:batchGet?ranges=PIAR_Estudiantes!A2:O500&ranges=Banco_Ajustes!A2:I500`;
  const res = await fetch(batchGetUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    if (res.status === 400) {
      // Si el Google Sheet existente no tiene aún las pestañas creadas, retornamos null para inicializarlas
      return { students: null, adjustmentBank: null };
    }
    const errText = await res.text();
    throw new Error(`Error al leer Google Sheet (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const valueRanges = data.valueRanges || [];
  const rawStudentRows: string[][] = valueRanges[0]?.values || [];
  const rawBankRows: string[][] = valueRanges[1]?.values || [];

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

  return {
    students: parsedStudents.length > 0 ? parsedStudents : null,
    adjustmentBank: parsedBank.length > 0 ? parsedBank : null,
  };
}
