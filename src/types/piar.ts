export type UserRole = 'administrador' | 'psicologa' | 'profesor';

export interface RoleProfile {
  id: UserRole;
  title: string;
  subtitle: string;
  userName: string;
  badgeColor: string;
  canEditClinicalDiagnosis: boolean;
  canSignAuditReport: boolean;
  canManageSheetsConfig: boolean;
  canEditSubjectAdaptations: boolean;
  canEditPeriodTracking: boolean;
}

export type NeedCategory =
  | 'TEA (Trastorno del Espectro Autista)'
  | 'TDAH (Déficit de Atención e Hiperactividad)'
  | 'Trastorno Específico del Aprendizaje (Lectoescritura / Dislexia)'
  | 'Trastorno Específico del Aprendizaje (Cálculo / Discalculia)'
  | 'Discapacidad Intelectual / Cognitiva'
  | 'Discapacidad Sensorial Visual'
  | 'Discapacidad Sensorial Auditiva'
  | 'Discapacidad Física / Motora'
  | 'Desempeño Superior — Capacidad Excepcional Global'
  | 'Desempeño Superior — Talento Excepcional en Ciencias y Tecnología'
  | 'Desempeño Superior — Talento Excepcional en Artes y Humanidades'
  | 'Doble Excepcionalidad (Talento Excepcional + Ajuste Razonable)'
  | 'Apoyo Pedagógico Transitorio / DUA Preventivo'
  | (string & {});

export interface CursoAnioCatalogItem {
  id: string;
  codigoCurso: string;
  curso: string;
  nombreCurso?: string;
  nivelEducativo:
    | 'Preescolar'
    | 'Básica Primaria'
    | 'Básica Secundaria'
    | 'Media Académica'
    | 'Media Vocacional';
  anioLectivo: string;
  calendarioEscolar?: 'Calendario A (Feb-Nov)' | 'Calendario B (Sep-Jun)';
  estadoAnio?: 'Año Lectivo Activo' | 'Proyección Matrícula' | 'Histórico Cerrado';
  directorGrupo: string;
  activo?: boolean;
}

export interface CategoriaSimatCatalogItem {
  id: string;
  codigoSimatMen: string;
  categoriaSimat: NeedCategory;
  categoria?: NeedCategory;
  tipoRuta:
    | 'PIAR — Ajuste Razonable (Decreto 1421/2017)'
    | 'Desempeño Superior / Talento Excepcional (MEN Doc. 19)'
    | 'Doble Excepcionalidad (Talento + Ajuste Razonable)'
    | 'DUA Preventivo / Apoyo Pedagógico'
    | (string & {});
  esDesempenoSuperior?: boolean;
  normativaReferencia?: string;
  principioDuaPrioritario: DuaPrinciple | (string & {});
  descripcionTecnica?: string;
  requisitoSoporteAuditor: string;
  requiereSoporteClinicoOPedagogico?: string;
}

export interface PreloadedSignatureConfig {
  firmaPngDataUrl: string;
  fileName: string;
  nombreProfesional: string;
  cargo: string;
  tarjetaProfesional: string;
  institucion: string;
  updatedAt: string;
}

export type DuaPrinciple =
  | 'Principio I: Múltiples formas de Implicación y Motivación'
  | 'Principio II: Múltiples formas de Representación'
  | 'Principio III: Múltiples formas de Acción y Expresión'
  | 'Enriquecimiento Curricular — Desempeño Superior (MEN)'
  | 'Evaluación Diferenciada y Flexibilizada';

export interface AdecuacionAsignatura {
  id: string;
  asignatura: string;
  indicador: string;
  indicadorAjustado: string;
  ajusteProceso: string;
  nombreDocente: string;
  principioDua: DuaPrinciple;
  barreraIdentificada?: string;
}

export interface SeguimientoPeriodo {
  periodo: 1 | 2 | 3 | 4;
  logros: string;
  evidencias: string;
  observaciones: string;
  estado:
    | 'Pendiente'
    | 'En Proceso'
    | 'Alcanzado'
    | 'Superado (Nivel Superior)'
    | 'Requiere Reformulación';
  responsable: string;
  fechaActualizacion: string;
}

export interface HistorialAnual {
  id: string;
  anioLectivo: string;
  curso: string;
  resumenDiagnosticoYContexto: string;
  logrosConsolidados: string;
  ajustesMasEfectivos: string;
  recomendacionesPromocion: string;
  estadoPromocion:
    | 'Promovido con Continuidad PIAR'
    | 'Promovido con Plan de Talentos Excepcionales'
    | 'Promovido con Autonomía DUA'
    | 'Año Lectivo en Curso';
  profesionalCargo: string;
}

export interface FirmaProfesional {
  nombreProfesional: string;
  cargo: string;
  tarjetaProfesional: string;
  institucion: string;
  firmaDataUrl: string;
  fechaFirma: string;
  hashAuditoria: string;
}

export interface StudentPIAR {
  id: string;
  codigoSimat: string;
  nombresApellidos: string;
  documentoIdentidad: string;
  edad: number;
  curso: string;
  anioLectivo: string;
  categoriaSimat: NeedCategory;
  esDesempenoSuperior: boolean;
  diagnostico: string;
  diagnosticoCifrado?: string;
  descripcion: string;
  barrerasContexto: string;
  recomendacionesFamilia: string;
  plantillaBaseId: string;
  adecuaciones: AdecuacionAsignatura[];
  seguimientos: SeguimientoPeriodo[];
  historial: HistorialAnual[];
  firmaProfesional?: FirmaProfesional;
  estadoPiar:
    | 'Vigente — Firmado para Auditoría'
    | 'En Construcción Docente'
    | 'En Valoración Psicología'
    | 'Requiere Seguimiento Periodo';
  updatedAt: string;
  lastModifiedBy: string;
}

export interface AjusteRazonableItem {
  id: string;
  titulo: string;
  categoriaNecesidad: NeedCategory;
  principioDua: DuaPrinciple;
  asignaturaSugerida: string;
  barreraQueMitiga: string;
  indicadorBaseEjemplo: string;
  indicadorAjustadoSugerido: string;
  ajusteProcesoDetallado: string;
  fundamentoNormativo: string;
}

export interface PlantillaPIAR {
  id: string;
  nombre: string;
  normativaReferencia: string;
  descripcionPlantilla: string;
  esDesempenoSuperior: boolean;
  categoriaSugerida: NeedCategory;
  diagnosticoGuia: string;
  descripcionGuia: string;
  barrerasGuia: string;
  recomendacionesFamiliaGuia: string;
  adecuacionesIniciales: Omit<AdecuacionAsignatura, 'id'>[];
}

export interface SyncStatus {
  isConnectedToGoogle: boolean;
  spreadsheetId: string;
  spreadsheetUrl: string;
  spreadsheetTitle: string;
  lastSyncTimestamp: string;
  syncIntervalMs: number;
  syncCycleCount: number;
  isSyncingNow: boolean;
  activeCollaborators: { name: string; role: string; status: string }[];
  encryptionActive: boolean;
  encryptionAlgorithm: string;
  lastError?: string | null;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  usuario: string;
  rol: UserRole;
  accion: string;
  estudianteRef?: string;
  hashIntegridad: string;
}
