import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  History,
  Scale,
  FileSpreadsheet,
  PlusCircle,
  Search,
  Lock,
  ShieldCheck,
  Brain,
  GraduationCap,
  FileCheck2,
  Edit3,
  Sparkles,
  Download,
  RefreshCw,
  Calendar,
  Trash2,
  Layers,
  Upload,
  FileDown,
  CheckCircle2,
  LogIn,
  LogOut,
} from 'lucide-react';
import {
  AjusteRazonableItem,
  AuditLogEntry,
  CategoriaSimatCatalogItem,
  CursoAnioCatalogItem,
  FirmaProfesional,
  PreloadedSignatureConfig,
  RoleProfile,
  StudentPIAR,
  SyncStatus,
  UserRole,
  UsuarioPerfilCatalogItem,
} from './types/piar';
import {
  ANIOS_LECTIVOS_COLOMBIA,
  BANCO_AJUSTES_INICIAL,
  CURSOS_COLOMBIA,
  INITIAL_STUDENTS_PIAR,
  ROLE_PROFILES,
  TABLA_CATEGORIAS_SIMAT_INICIAL,
  TABLA_CURSOS_ANIOS_INICIAL,
  TABLA_USUARIOS_PERFILES_INICIAL,
} from './data/colombianLegislationAndSeed';
import {
  createEkirayaSpreadsheet,
  extractSpreadsheetId,
  isAppsScriptUrl,
  pullDataFromSpreadsheet,
  pushAllDataToSpreadsheet,
} from './services/googleSheetsService';
import {
  getAccessToken,
  googleSignIn,
  initAuth,
} from './services/firebaseAuthService';
import {
  EKIRAYA_LOGO_LOCAL_FALLBACK,
  EKIRAYA_LOGO_URL,
  exportDetailedExcelWorkbook,
  exportOfficialPiarPdf,
  exportSubjectAdaptationsCsv,
  getPreloadedSignature,
  processUploadedSignatureFileToPng,
  savePreloadedSignature,
} from './utils/exportUtils';
import { generateAuditHash } from './utils/crypto';
import { RoleDashboard } from './components/RoleDashboard';
import { PiarEditorModal } from './components/PiarEditorModal';
import { AuditPdfModal } from './components/AuditPdfModal';
import { AdjustmentBankView } from './components/AdjustmentBankView';
import { SheetsSyncModal } from './components/SheetsSyncModal';
import { LegislationGuideView } from './components/LegislationGuideView';
import { CatalogTablesView } from './components/CatalogTablesView';
import { LoginView } from './components/LoginView';

const firebaseConfigModules = import.meta.glob<{ oAuthClientId?: string }>(
  '../firebase-applet-config.json',
  { eager: true, import: 'default' }
);
const firebaseAppletConfig =
  Object.values(firebaseConfigModules)[0] || {
    oAuthClientId: '995821229747-42oilhngiqduavvq12rt7g8g6k1hujmu.apps.googleusercontent.com',
  };

const STORAGE_STUDENTS_KEY = 'ekiraya_iep_students_v1';
const STORAGE_BANK_KEY = 'ekiraya_iep_bank_v1';
const STORAGE_CURSOS_KEY = 'ekiraya_iep_cursos_v1';
const STORAGE_CATEGORIAS_KEY = 'ekiraya_iep_categorias_v1';
const STORAGE_USUARIOS_KEY = 'ekiraya_iep_usuarios_v1';
const STORAGE_ACTIVE_USER_KEY = 'ekiraya_iep_active_user_v1';
const STORAGE_SHEET_META_KEY = 'ekiraya_iep_sheet_meta_v1';
const STORAGE_CUSTOM_CLIENT_ID_KEY = 'ekiraya_iep_custom_client_id_v1';
const DEFAULT_OAUTH_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  firebaseAppletConfig.oAuthClientId ||
  '995821229747-42oilhngiqduavvq12rt7g8g6k1hujmu.apps.googleusercontent.com';

export default function App() {
  // Hoja Maestra Usuarios_Perfiles sincronizada con Google Sheets
  const [usuariosCatalog, setUsuariosCatalog] = useState<UsuarioPerfilCatalogItem[]>(
    () => {
      try {
        const saved = localStorage.getItem(STORAGE_USUARIOS_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {
        // fallback
      }
      return TABLA_USUARIOS_PERFILES_INICIAL;
    }
  );

  // Usuario autenticado actualmente mediante el Formulario de Login
  const [currentUser, setCurrentUser] = useState<UsuarioPerfilCatalogItem | null>(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_ACTIVE_USER_KEY);
      if (saved) {
        return JSON.parse(saved) as UsuarioPerfilCatalogItem;
      }
    } catch {
      // ignore
    }
    return null;
  });

  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(() => {
    try {
      return !sessionStorage.getItem(STORAGE_ACTIVE_USER_KEY);
    } catch {
      return true;
    }
  });

  // Rol de usuario activo: Administrador, Psicóloga o Profesor
  const [activeRole, setActiveRole] = useState<UserRole>(
    () => currentUser?.rol || 'administrador'
  );
  const baseRoleProfile = ROLE_PROFILES[activeRole];
  const roleProfile: RoleProfile = currentUser && currentUser.rol === activeRole
    ? {
        ...baseRoleProfile,
        userName: currentUser.nombresApellidos,
        subtitle: `${currentUser.cargoArea} (${currentUser.correoInstitucional})`,
      }
    : baseRoleProfile;

  // Navegación principal
  const [activeView, setActiveView] = useState<
    'panel' | 'estudiantes' | 'banco' | 'catalogos' | 'historial' | 'normativa'
  >('panel');

  // Base de datos de Estudiantes PIAR y Banco de Ajustes
  const [students, setStudents] = useState<StudentPIAR[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_STUDENTS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback a datos semilla
    }
    return INITIAL_STUDENTS_PIAR;
  });

  const [adjustmentBank, setAdjustmentBank] = useState<AjusteRazonableItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_BANK_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return BANCO_AJUSTES_INICIAL;
  });

  // Tablas Maestras: Cursos / Años Lectivos (2026-2027, etc.) y Categorías SIMAT
  const [cursosCatalog, setCursosCatalog] = useState<CursoAnioCatalogItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CURSOS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return TABLA_CURSOS_ANIOS_INICIAL;
  });

  const [categoriasCatalog, setCategoriasCatalog] = useState<CategoriaSimatCatalogItem[]>(
    () => {
      try {
        const saved = localStorage.getItem(STORAGE_CATEGORIAS_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {
        // fallback
      }
      return TABLA_CATEGORIAS_SIMAT_INICIAL;
    }
  );

  // Estado de OAuth en memoria (nunca en localStorage/sessionStorage) y Google Sheets
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [customClientId, setCustomClientId] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_CUSTOM_CLIENT_ID_KEY) || '';
    } catch {
      return '';
    }
  });
  const [encryptionKey, setEncryptionKey] = useState<string>(
    'EKIRAYA-IEP-MEN-1421-COLOMBIA-2026-KEY'
  );

  const [syncStatus, setSyncStatus] = useState<SyncStatus>(() => {
    let savedSheet = { id: '', url: '', title: '' };
    try {
      const raw = localStorage.getItem(STORAGE_SHEET_META_KEY);
      if (raw) savedSheet = JSON.parse(raw);
    } catch {
      // ignore
    }
    const connectedViaBridge = isAppsScriptUrl(savedSheet.id || '');
    return {
      isConnectedToGoogle: connectedViaBridge,
      spreadsheetId: savedSheet.id || '',
      spreadsheetUrl: savedSheet.url || '',
      spreadsheetTitle:
        savedSheet.title || 'Ekirayá IEP — Base de Datos PIAR & DUA (2026)',
      lastSyncTimestamp: new Date().toLocaleTimeString('es-CO'),
      syncIntervalMs: 2000,
      syncCycleCount: 1,
      isSyncingNow: false,
      activeCollaborators: [
        {
          name: 'Dra. Valentina Morales Pineda',
          role: 'Psicóloga Orientadora',
          status: 'En línea (Sync 2s)',
        },
        {
          name: 'Mg. Esteban Bolaños Rodríguez',
          role: 'Administrador',
          status: 'En línea (Sync 2s)',
        },
        {
          name: 'Lic. Carlos Andrés Restrepo',
          role: 'Profesor Matemáticas',
          status: 'Editando Anexo 2',
        },
      ],
      encryptionActive: true,
      encryptionAlgorithm: 'AES-256-GCM + SHA-256',
      lastError: null,
    };
  });

  // Inicializar listener de Firebase Auth con caché en memoria
  useEffect(() => {
    const unsubscribe = initAuth(
      (_user, token) => {
        setAccessToken(token);
        setSyncStatus((prev) => ({
          ...prev,
          isConnectedToGoogle: true,
          lastError: null,
        }));
      },
      () => {
        setAccessToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // Bitácora de Auditoría
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([
    {
      id: 'log-1',
      timestamp: new Date().toLocaleTimeString('es-CO'),
      usuario: 'Dra. Valentina Morales Pineda',
      rol: 'psicologa',
      accion: 'Verificación de integridad AES-256-GCM en expedientes PIAR 2026',
      estudianteRef: 'Todos los expedientes',
      hashIntegridad: 'SHA256-EKI-89A2F10C',
    },
    {
      id: 'log-2',
      timestamp: new Date().toLocaleTimeString('es-CO'),
      usuario: 'Lic. Carlos Andrés Restrepo',
      rol: 'profesor',
      accion: 'Actualización de indicadores ajustados en Matemáticas y Física',
      estudianteRef: 'Mariana Sofía Velásquez Ochoa',
      hashIntegridad: 'SHA256-EKI-3B7E91A0',
    },
  ]);

  // Modales activos
  const [editorModalState, setEditorModalState] = useState<{
    isOpen: boolean;
    student: StudentPIAR | null;
    presetSuperior: boolean;
    initialTab: 'general' | 'asignaturas' | 'seguimiento' | 'historial';
  }>({
    isOpen: false,
    student: null,
    presetSuperior: false,
    initialTab: 'general',
  });

  const [auditPdfStudent, setAuditPdfStudent] = useState<StudentPIAR | null>(null);
  const [isSheetsModalOpen, setIsSheetsModalOpen] = useState(false);
  const [preloadedSignature, setPreloadedSignature] =
    useState<PreloadedSignatureConfig | null>(() => getPreloadedSignature());
  const [sigBannerMsg, setSigBannerMsg] = useState<string | null>(null);
  const globalSigInputRef = useRef<HTMLInputElement | null>(null);

  // Filtros del Directorio de Estudiantes
  const [searchStudent, setSearchStudent] = useState('');
  const [filterCurso, setFilterCurso] = useState('TODOS');
  const [filterAnio, setFilterAnio] = useState('TODOS');
  const [filterTipo, setFilterTipo] = useState<'TODOS' | 'PIAR' | 'SUPERIOR'>('TODOS');

  // Referencias para el ciclo en tiempo real de 2 segundos
  const studentsRef = useRef(students);
  studentsRef.current = students;
  const bankRef = useRef(adjustmentBank);
  bankRef.current = adjustmentBank;
  const cursosRef = useRef(cursosCatalog);
  cursosRef.current = cursosCatalog;
  const categoriasRef = useRef(categoriasCatalog);
  categoriasRef.current = categoriasCatalog;
  const usuariosRef = useRef(usuariosCatalog);
  usuariosRef.current = usuariosCatalog;
  const isDirtyForSheetsRef = useRef(true);
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);

  const appendAuditLog = useCallback(
    async (accion: string, estudianteRef?: string) => {
      const hash = await generateAuditHash(`${accion}|${Date.now()}`);
      setAuditLogs((prev) => [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString('es-CO'),
          usuario: roleProfile.userName,
          rol: activeRole,
          accion,
          estudianteRef,
          hashIntegridad: hash.slice(0, 19),
        },
        ...prev.slice(0, 24),
      ]);
    },
    [activeRole, roleProfile.userName]
  );

  // Canal BroadcastChannel para sincronización multi-pestaña en tiempo real
  useEffect(() => {
    if (typeof BroadcastChannel !== 'undefined') {
      const channel = new BroadcastChannel('ekiraya_iep_realtime_sync');
      channel.onmessage = (event) => {
        const data = event.data;
        if (data?.type === 'SYNC_STATE_UPDATE') {
          if (Array.isArray(data.students)) {
            setStudents(data.students);
          }
          if (Array.isArray(data.adjustmentBank)) {
            setAdjustmentBank(data.adjustmentBank);
          }
        }
      };
      broadcastChannelRef.current = channel;
      return () => channel.close();
    }
  }, []);

  // Persistencia local inmediata y difusión
  const persistAndBroadcast = useCallback(
    (nextStudents: StudentPIAR[], nextBank: AjusteRazonableItem[]) => {
      try {
        localStorage.setItem(STORAGE_STUDENTS_KEY, JSON.stringify(nextStudents));
        localStorage.setItem(STORAGE_BANK_KEY, JSON.stringify(nextBank));
      } catch {
        // ignore quota errors
      }
      isDirtyForSheetsRef.current = true;
      broadcastChannelRef.current?.postMessage({
        type: 'SYNC_STATE_UPDATE',
        students: nextStudents,
        adjustmentBank: nextBank,
      });
    },
    []
  );

  // MOTOR DE SINCRONIZACIÓN EN TIEMPO REAL CADA 2 SEGUNDOS (2000ms)
  useEffect(() => {
    const intervalId = setInterval(async () => {
      setSyncStatus((prev) => ({
        ...prev,
        isSyncingNow: true,
        syncCycleCount: prev.syncCycleCount + 1,
        lastSyncTimestamp: new Date().toLocaleTimeString('es-CO'),
      }));

      // 1. Verificar si otra pestaña/usuario actualizó el almacenamiento compartido
      try {
        const externalStudentsRaw = localStorage.getItem(STORAGE_STUDENTS_KEY);
        if (externalStudentsRaw && !editorModalState.isOpen) {
          const parsedExt = JSON.parse(externalStudentsRaw) as StudentPIAR[];
          if (JSON.stringify(parsedExt) !== JSON.stringify(studentsRef.current)) {
            setStudents(parsedExt);
          }
        }
      } catch {
        // ignore
      }

      // 2. Si hay conexión activa con Google Sheets (OAuth o Puente Apps Script) y un Spreadsheet vinculado, sincronizar cada 2s
      const canSyncNow =
        Boolean(syncStatus.spreadsheetId) &&
        (Boolean(accessToken) || isAppsScriptUrl(syncStatus.spreadsheetId));
      if (canSyncNow) {
        try {
          const activeToken = (await getAccessToken()) || accessToken || '';
          if (isDirtyForSheetsRef.current) {
            isDirtyForSheetsRef.current = false;
            await pushAllDataToSpreadsheet(
              activeToken,
              syncStatus.spreadsheetId,
              studentsRef.current,
              bankRef.current,
              encryptionKey,
              cursosRef.current,
              categoriasRef.current,
              usuariosRef.current
            );
          } else if (!editorModalState.isOpen) {
            const remote = await pullDataFromSpreadsheet(
              activeToken,
              syncStatus.spreadsheetId,
              encryptionKey
            );
            if (remote.cursosCatalog && remote.cursosCatalog.length > 0) {
              setCursosCatalog(remote.cursosCatalog);
              localStorage.setItem(STORAGE_CURSOS_KEY, JSON.stringify(remote.cursosCatalog));
            }
            if (remote.categoriasCatalog && remote.categoriasCatalog.length > 0) {
              setCategoriasCatalog(remote.categoriasCatalog);
              localStorage.setItem(
                STORAGE_CATEGORIAS_KEY,
                JSON.stringify(remote.categoriasCatalog)
              );
            }
            if (remote.usuariosCatalog && remote.usuariosCatalog.length > 0) {
              setUsuariosCatalog(remote.usuariosCatalog);
              localStorage.setItem(
                STORAGE_USUARIOS_KEY,
                JSON.stringify(remote.usuariosCatalog)
              );
            }
            if (remote.students && remote.students.length > 0) {
              // Merge inteligente por updatedAt para trabajo simultáneo de múltiples usuarios
              const mergedMap = new Map<string, StudentPIAR>();
              for (const localSt of studentsRef.current) {
                mergedMap.set(localSt.id, localSt);
              }
              let changedFromRemote = false;
              for (const remSt of remote.students) {
                const existing = mergedMap.get(remSt.id);
                if (
                  !existing ||
                  new Date(remSt.updatedAt).getTime() >
                    new Date(existing.updatedAt).getTime()
                ) {
                  mergedMap.set(remSt.id, remSt);
                  changedFromRemote = true;
                }
              }
              if (changedFromRemote) {
                const mergedList = Array.from(mergedMap.values());
                setStudents(mergedList);
                localStorage.setItem(STORAGE_STUDENTS_KEY, JSON.stringify(mergedList));
              }
            }
          }
          setSyncStatus((prev) => ({ ...prev, isSyncingNow: false, lastError: null }));
        } catch (err) {
          setSyncStatus((prev) => ({
            ...prev,
            isSyncingNow: false,
            lastError: err instanceof Error ? err.message : 'Error de red en Google Sheets',
          }));
        }
      } else {
        setTimeout(() => {
          setSyncStatus((prev) => ({ ...prev, isSyncingNow: false }));
        }, 350);
      }
    }, 2000);

    return () => clearInterval(intervalId);
  }, [accessToken, syncStatus.spreadsheetId, encryptionKey, editorModalState.isOpen]);

  const handleSaveCustomClientId = (newClientId: string) => {
    setCustomClientId(newClientId);
    try {
      if (newClientId) {
        localStorage.setItem(STORAGE_CUSTOM_CLIENT_ID_KEY, newClientId);
      } else {
        localStorage.removeItem(STORAGE_CUSTOM_CLIENT_ID_KEY);
      }
    } catch {
      // ignore
    }
  };

  // Autenticación OAuth 2.0 con Firebase Auth (GoogleAuthProvider) o Client ID personalizado
  const handleConnectGoogleOAuth = async (
    autoCreateOrCustomClientId?: boolean | string
  ) => {
    const autoCreateSheetAfterAuth =
      typeof autoCreateOrCustomClientId === 'boolean'
        ? autoCreateOrCustomClientId
        : true;
    const overrideClientId =
      typeof autoCreateOrCustomClientId === 'string'
        ? autoCreateOrCustomClientId
        : customClientId || DEFAULT_OAUTH_CLIENT_ID;

    try {
      const result = await googleSignIn(
        overrideClientId !== firebaseAppletConfig.oAuthClientId
          ? overrideClientId
          : undefined
      );
      if (result?.accessToken) {
        const token = result.accessToken;
        setAccessToken(token);
        setSyncStatus((prev) => ({
          ...prev,
          isConnectedToGoogle: true,
          lastError: null,
        }));
        appendAuditLog('Conexión OAuth 2.0 establecida con Google Sheets API');

        if (autoCreateSheetAfterAuth && !syncStatus.spreadsheetId) {
          try {
            const created = await createEkirayaSpreadsheet(
              token,
              studentsRef.current,
              bankRef.current,
              encryptionKey,
              cursosRef.current,
              categoriasRef.current,
              usuariosRef.current
            );
            localStorage.setItem(
              STORAGE_SHEET_META_KEY,
              JSON.stringify({
                id: created.spreadsheetId,
                url: created.spreadsheetUrl,
                title: created.title,
              })
            );
            setSyncStatus((prev) => ({
              ...prev,
              isConnectedToGoogle: true,
              spreadsheetId: created.spreadsheetId,
              spreadsheetUrl: created.spreadsheetUrl,
              spreadsheetTitle: created.title,
              lastError: null,
            }));
            appendAuditLog(
              `Hoja de cálculo creada en Google Drive (${created.spreadsheetId})`
            );
          } catch (err) {
            setSyncStatus((prev) => ({
              ...prev,
              lastError:
                err instanceof Error
                  ? err.message
                  : 'Autenticado, pero ocurrió un error al crear la hoja automáticamente.',
            }));
          }
        }
      }
    } catch (err) {
      setSyncStatus((prev) => ({
        ...prev,
        lastError:
          err instanceof Error
            ? err.message
            : 'No fue posible completar la autenticación con Google OAuth 2.0.',
      }));
    }
  };

  // Crear nueva Hoja de Cálculo Google Sheets con las 8 pestañas de Ekirayá IEP
  const handleCreateNewGoogleSheet = async () => {
    const activeToken = (await getAccessToken()) || accessToken;
    if (!activeToken) {
      await handleConnectGoogleOAuth(true);
      return;
    }
    try {
      const created = await createEkirayaSpreadsheet(
        activeToken,
        students,
        adjustmentBank,
        encryptionKey,
        cursosCatalog,
        categoriasCatalog,
        usuariosCatalog
      );
      localStorage.setItem(
        STORAGE_SHEET_META_KEY,
        JSON.stringify({
          id: created.spreadsheetId,
          url: created.spreadsheetUrl,
          title: created.title,
        })
      );
      setSyncStatus((prev) => ({
        ...prev,
        spreadsheetId: created.spreadsheetId,
        spreadsheetUrl: created.spreadsheetUrl,
        spreadsheetTitle: created.title,
        lastError: null,
      }));
      appendAuditLog(
        `Creada nueva base de datos Google Sheets (${created.spreadsheetId})`
      );
    } catch (err) {
      setSyncStatus((prev) => ({
        ...prev,
        lastError:
          err instanceof Error ? err.message : 'No fue posible crear el Google Sheet.',
      }));
    }
  };

  // Vincular un Google Sheet existente o una URL de Puente Google Apps Script (/exec)
  const handleConnectExistingSheet = async (sheetIdOrUrl: string) => {
    const extractedId = extractSpreadsheetId(sheetIdOrUrl);
    const usingBridge = isAppsScriptUrl(extractedId);
    const url = usingBridge
      ? extractedId
      : `https://docs.google.com/spreadsheets/d/${extractedId}/edit`;
    const titleLabel = usingBridge
      ? 'Google Sheet Conectado vía Puente Apps Script (Sin OAuth)'
      : `Google Sheet Institucional (${extractedId.slice(0, 8)}...)`;

    localStorage.setItem(
      STORAGE_SHEET_META_KEY,
      JSON.stringify({
        id: extractedId,
        url,
        title: titleLabel,
      })
    );
    setSyncStatus((prev) => ({
      ...prev,
      isConnectedToGoogle: usingBridge ? true : prev.isConnectedToGoogle,
      spreadsheetId: extractedId,
      spreadsheetUrl: url,
      spreadsheetTitle: titleLabel,
      lastError: null,
    }));

    const activeToken = (await getAccessToken()) || accessToken || '';
    if (activeToken || usingBridge) {
      try {
        const remote = await pullDataFromSpreadsheet(
          activeToken,
          extractedId,
          encryptionKey
        );
        if (remote.spreadsheetUrl || remote.spreadsheetTitle) {
          const resolvedUrl = remote.spreadsheetUrl || url;
          const resolvedTitle = remote.spreadsheetTitle || titleLabel;
          localStorage.setItem(
            STORAGE_SHEET_META_KEY,
            JSON.stringify({
              id: extractedId,
              url: resolvedUrl,
              title: resolvedTitle,
            })
          );
          setSyncStatus((prev) => ({
            ...prev,
            spreadsheetUrl: resolvedUrl,
            spreadsheetTitle: resolvedTitle,
          }));
        }
        if (remote.usuariosCatalog && remote.usuariosCatalog.length > 0) {
          setUsuariosCatalog(remote.usuariosCatalog);
          localStorage.setItem(STORAGE_USUARIOS_KEY, JSON.stringify(remote.usuariosCatalog));
        }
        if (remote.students && remote.students.length > 0) {
          setStudents(remote.students);
          localStorage.setItem(STORAGE_STUDENTS_KEY, JSON.stringify(remote.students));
        }
        if (
          !remote.students ||
          remote.students.length === 0 ||
          !remote.usuariosCatalog ||
          remote.usuariosCatalog.length === 0
        ) {
          await pushAllDataToSpreadsheet(
            activeToken,
            extractedId,
            remote.students && remote.students.length > 0 ? remote.students : students,
            remote.adjustmentBank && remote.adjustmentBank.length > 0
              ? remote.adjustmentBank
              : adjustmentBank,
            encryptionKey,
            remote.cursosCatalog && remote.cursosCatalog.length > 0
              ? remote.cursosCatalog
              : cursosCatalog,
            remote.categoriasCatalog && remote.categoriasCatalog.length > 0
              ? remote.categoriasCatalog
              : categoriasCatalog,
            remote.usuariosCatalog && remote.usuariosCatalog.length > 0
              ? remote.usuariosCatalog
              : usuariosCatalog
          );
        }
        appendAuditLog(
          usingBridge
            ? 'Vinculado y sincronizado Google Sheet mediante Puente Apps Script (Sin OAuth)'
            : `Vinculado y sincronizado Google Sheet ID: ${extractedId}`
        );
      } catch (err) {
        setSyncStatus((prev) => ({
          ...prev,
          lastError:
            err instanceof Error
              ? err.message
              : 'Verifica que el Sheet o Puente Apps Script tenga permisos de edición.',
        }));
      }
    }
  };

  const handleForceManualSync = async () => {
    isDirtyForSheetsRef.current = true;
    setSyncStatus((prev) => ({
      ...prev,
      isSyncingNow: true,
      lastSyncTimestamp: new Date().toLocaleTimeString('es-CO'),
    }));
    const activeToken = (await getAccessToken()) || accessToken || '';
    const canSync =
      Boolean(syncStatus.spreadsheetId) &&
      (Boolean(activeToken) || isAppsScriptUrl(syncStatus.spreadsheetId));
    if (canSync) {
      try {
        await pushAllDataToSpreadsheet(
          activeToken,
          syncStatus.spreadsheetId,
          students,
          adjustmentBank,
          encryptionKey,
          cursosCatalog,
          categoriasCatalog,
          usuariosCatalog
        );
      } catch {
        // handled in status
      }
    }
    setTimeout(() => {
      setSyncStatus((prev) => ({ ...prev, isSyncingNow: false }));
    }, 400);
  };

  // Guardar o Crear Estudiante PIAR
  const handleSaveStudentPiar = (savedStudent: StudentPIAR) => {
    setStudents((prev) => {
      const exists = prev.some((s) => s.id === savedStudent.id);
      const next = exists
        ? prev.map((s) => (s.id === savedStudent.id ? savedStudent : s))
        : [savedStudent, ...prev];
      persistAndBroadcast(next, adjustmentBank);
      return next;
    });
    appendAuditLog(
      `Guardado y cifrado AES-256 del expediente PIAR (${savedStudent.curso})`,
      savedStudent.nombresApellidos
    );
    setEditorModalState({
      isOpen: false,
      student: null,
      presetSuperior: false,
      initialTab: 'general',
    });
  };

  const handleDeleteStudentPiar = (studentId: string, name: string) => {
    setStudents((prev) => {
      const next = prev.filter((s) => s.id !== studentId);
      persistAndBroadcast(next, adjustmentBank);
      return next;
    });
    appendAuditLog('Eliminación de expediente PIAR', name);
  };

  // Guardar Firma Digital en Informe PDF de Auditoría
  const handleSaveSignature = (studentId: string, firma: FirmaProfesional) => {
    setPreloadedSignature(getPreloadedSignature());
    setStudents((prev) => {
      const next = prev.map((st) =>
        st.id === studentId
          ? {
              ...st,
              firmaProfesional: firma,
              estadoPiar: 'Vigente — Firmado para Auditoría' as const,
              updatedAt: new Date().toISOString(),
              lastModifiedBy: firma.nombreProfesional,
            }
          : st
      );
      persistAndBroadcast(next, adjustmentBank);
      const updatedTarget = next.find((s) => s.id === studentId) || null;
      setAuditPdfStudent(updatedTarget);
      return next;
    });
    appendAuditLog(
      `Firma de auditoría estampada (${firma.hashAuditoria})`,
      auditPdfStudent?.nombresApellidos
    );
  };

  // Cargar archivo .PNG de firma previamente desde la barra superior
  const handleGlobalPngUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const pngDataUrl = await processUploadedSignatureFileToPng(file);
      const newConfig: PreloadedSignatureConfig = {
        firmaPngDataUrl: pngDataUrl,
        fileName: file.name,
        nombreProfesional:
          preloadedSignature?.nombreProfesional ||
          (roleProfile.canSignAuditReport
            ? roleProfile.userName
            : 'Dra. Valentina Morales Pineda'),
        cargo:
          preloadedSignature?.cargo ||
          'Psicóloga Orientadora Escolar — Líder de Inclusión (Decreto 1421)',
        tarjetaProfesional:
          preloadedSignature?.tarjetaProfesional || 'T.P. 148920 COLPSIC',
        institucion:
          preloadedSignature?.institucion ||
          'Institución Educativa Ekirayá — Aprobación Oficial MEN',
        updatedAt: new Date().toISOString(),
      };
      savePreloadedSignature(newConfig);
      setPreloadedSignature(newConfig);
      setSigBannerMsg(
        `Firma "${file.name}" cargada previamente en formato .PNG y lista para exportar en todos los PDFs Oficiales.`
      );
      setTimeout(() => setSigBannerMsg(null), 5000);
      appendAuditLog(`Firma profesional cargada previamente como archivo .PNG (${file.name})`);
    } catch {
      // ignore
    } finally {
      if (globalSigInputRef.current) {
        globalSigInputRef.current.value = '';
      }
    }
  };

  // Gestión del Banco de Ajustes Razonables
  const handleAddAdjustmentToBank = (newItem: AjusteRazonableItem) => {
    setAdjustmentBank((prev) => {
      const next = [newItem, ...prev];
      persistAndBroadcast(students, next);
      return next;
    });
    appendAuditLog(`Nuevo ajuste agregado al Banco DUA: ${newItem.titulo}`);
  };

  const handleDeleteAdjustmentFromBank = (id: string) => {
    setAdjustmentBank((prev) => {
      const next = prev.filter((i) => i.id !== id);
      persistAndBroadcast(students, next);
      return next;
    });
  };

  // Gestión de Tablas Maestras: Cursos/Años Lectivos y Categorías SIMAT
  const handleAddCursoCatalog = (newCurso: CursoAnioCatalogItem) => {
    setCursosCatalog((prev) => {
      const next = [newCurso, ...prev];
      localStorage.setItem(STORAGE_CURSOS_KEY, JSON.stringify(next));
      isDirtyForSheetsRef.current = true;
      return next;
    });
    appendAuditLog(`Nuevo curso/año lectivo agregado a Tabla_Cursos_Anios: ${newCurso.nombreCurso} (${newCurso.anioLectivo})`);
  };

  const handleDeleteCursoCatalog = (id: string) => {
    setCursosCatalog((prev) => {
      const next = prev.filter((c) => c.id !== id);
      localStorage.setItem(STORAGE_CURSOS_KEY, JSON.stringify(next));
      isDirtyForSheetsRef.current = true;
      return next;
    });
  };

  const handleAddCategoriaSimat = (newCat: CategoriaSimatCatalogItem) => {
    setCategoriasCatalog((prev) => {
      const next = [newCat, ...prev];
      localStorage.setItem(STORAGE_CATEGORIAS_KEY, JSON.stringify(next));
      isDirtyForSheetsRef.current = true;
      return next;
    });
    appendAuditLog(`Nueva categoría agregada a Tabla_Categorias_SIMAT: ${newCat.categoria}`);
  };

  const handleDeleteCategoriaSimat = (id: string) => {
    setCategoriasCatalog((prev) => {
      const next = prev.filter((c) => c.id !== id);
      localStorage.setItem(STORAGE_CATEGORIAS_KEY, JSON.stringify(next));
      isDirtyForSheetsRef.current = true;
      return next;
    });
  };

  // Gestión de Hoja Usuarios_Perfiles y Autenticación en el Sitio
  const handleAddUsuarioCatalog = (newUsr: UsuarioPerfilCatalogItem) => {
    setUsuariosCatalog((prev) => {
      const next = [newUsr, ...prev];
      localStorage.setItem(STORAGE_USUARIOS_KEY, JSON.stringify(next));
      isDirtyForSheetsRef.current = true;
      return next;
    });
    appendAuditLog(
      `Nuevo usuario registrado en hoja Usuarios_Perfiles: ${newUsr.correoInstitucional} (${newUsr.rol})`
    );
  };

  const handleDeleteUsuarioCatalog = (id: string) => {
    setUsuariosCatalog((prev) => {
      const next = prev.filter((u) => u.id !== id);
      localStorage.setItem(STORAGE_USUARIOS_KEY, JSON.stringify(next));
      isDirtyForSheetsRef.current = true;
      return next;
    });
  };

  const handleLoginSuccess = (loggedUser: UsuarioPerfilCatalogItem) => {
    setCurrentUser(loggedUser);
    setActiveRole(loggedUser.rol);
    try {
      sessionStorage.setItem(STORAGE_ACTIVE_USER_KEY, JSON.stringify(loggedUser));
    } catch {
      // ignore
    }
    setUsuariosCatalog((prev) => {
      const next = prev.map((u) => (u.id === loggedUser.id ? loggedUser : u));
      localStorage.setItem(STORAGE_USUARIOS_KEY, JSON.stringify(next));
      isDirtyForSheetsRef.current = true;
      return next;
    });
    setIsLoginModalOpen(false);
    appendAuditLog(
      `Inicio de sesión exitoso desde Formulario de Login (${loggedUser.correoInstitucional} — Perfil: ${loggedUser.rol})`
    );
  };

  const handleAddUserAndLogin = (newUser: UsuarioPerfilCatalogItem) => {
    handleAddUsuarioCatalog(newUser);
    handleLoginSuccess(newUser);
  };

  const handleLogout = () => {
    const previousUser = currentUser?.correoInstitucional || currentUser?.nombresApellidos || 'Usuario';
    setCurrentUser(null);
    try {
      sessionStorage.removeItem(STORAGE_ACTIVE_USER_KEY);
    } catch {
      // ignore
    }
    setIsLoginModalOpen(true);
    appendAuditLog(`Cierre de sesión institucional (${previousUser})`);
  };

  const handleApplyAdjustmentToStudent = (
    studentId: string,
    item: AjusteRazonableItem
  ) => {
    setStudents((prev) => {
      const next = prev.map((st) => {
        if (st.id !== studentId) return st;
        return {
          ...st,
          updatedAt: new Date().toISOString(),
          lastModifiedBy: roleProfile.userName,
          adecuaciones: [
            ...st.adecuaciones,
            {
              id: `ad-bank-${Date.now()}`,
              asignatura: item.asignaturaSugerida,
              indicador: item.indicadorBaseEjemplo,
              indicadorAjustado: item.indicadorAjustadoSugerido,
              ajusteProceso: item.ajusteProcesoDetallado,
              nombreDocente:
                activeRole === 'profesor'
                  ? roleProfile.userName
                  : 'Docente de Área Asignado',
              principioDua: item.principioDua,
              barreraIdentificada: item.barreraQueMitiga,
            },
          ],
        };
      });
      persistAndBroadcast(next, adjustmentBank);
      return next;
    });
    const st = students.find((s) => s.id === studentId);
    appendAuditLog(
      `Inserción de ajuste del Banco DUA (${item.asignaturaSugerida})`,
      st?.nombresApellidos
    );
  };

  // Filtrado de estudiantes en la vista de directorio
  const filteredStudents = students.filter((st) => {
    const matchesSearch =
      !searchStudent ||
      st.nombresApellidos.toLowerCase().includes(searchStudent.toLowerCase()) ||
      st.codigoSimat.toLowerCase().includes(searchStudent.toLowerCase()) ||
      st.categoriaSimat.toLowerCase().includes(searchStudent.toLowerCase());

    const matchesCurso = filterCurso === 'TODOS' || st.curso === filterCurso;
    const matchesAnio = filterAnio === 'TODOS' || st.anioLectivo === filterAnio;
    const matchesTipo =
      filterTipo === 'TODOS' ||
      (filterTipo === 'SUPERIOR' && st.esDesempenoSuperior) ||
      (filterTipo === 'PIAR' && !st.esDesempenoSuperior);

    return matchesSearch && matchesCurso && matchesAnio && matchesTipo;
  });

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#FBFBF9] text-[#0F172A]">
      {/* SIDEBAR DE NAVEGACIÓN INSTITUCIONAL (Oculto al imprimir PDF) */}
      <aside className="no-print lg:w-64 xl:w-72 bg-[#F4F4F0] border-b lg:border-b-0 lg:border-r border-[#E2E8F0] flex flex-col justify-between shrink-0">
        <div className="p-4 sm:p-5 space-y-6">
          {/* Marca Institucional Colegio Ekirayá Montessori */}
          <div className="flex items-center justify-between lg:block space-y-0 lg:space-y-3">
            <div className="flex items-center gap-3">
              <div className="bg-white border border-[#CBD5E1] rounded-xl px-2.5 py-1.5 flex items-center justify-center shadow-2xs shrink-0">
                <img
                  src={EKIRAYA_LOGO_URL}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = EKIRAYA_LOGO_LOCAL_FALLBACK;
                  }}
                  alt="Colegio Ekirayá Montessori"
                  className="h-9 sm:h-10 w-auto object-contain"
                />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-[#0F172A] font-serif-editorial leading-tight">
                  Colegio Ekirayá
                </h1>
                <p className="text-[11px] font-medium text-[#475569] mt-0.5">
                  PIAR • DUA • Talentos MEN
                </p>
              </div>
            </div>

            {/* Botón móvil de estado Google Sheets — Exclusivo Administrador */}
            {activeRole === 'administrador' && (
              <button
                onClick={() => setIsSheetsModalOpen(true)}
                className="lg:hidden inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white border border-[#CBD5E1] text-xs font-semibold text-teal-800"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Sync 2s
              </button>
            )}
          </div>

          {/* Menú de Navegación Principal */}
          <nav className="flex lg:flex-col gap-1 overflow-x-auto pb-1 lg:pb-0">
            <button
              onClick={() => setActiveView('panel')}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap cursor-pointer ${
                activeView === 'panel'
                  ? 'bg-[#0F766E] text-white shadow-xs'
                  : 'text-[#334155] hover:bg-white/80'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              Panel de Control ({roleProfile.id === 'administrador' ? 'Admin' : roleProfile.id === 'psicologa' ? 'Psicología' : 'Profesor'})
            </button>

            <button
              onClick={() => setActiveView('estudiantes')}
              className={`flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap cursor-pointer ${
                activeView === 'estudiantes'
                  ? 'bg-[#0F766E] text-white shadow-xs'
                  : 'text-[#334155] hover:bg-white/80'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Users className="w-4 h-4 shrink-0" />
                Expedientes PIAR / Superior
              </span>
              <span
                className={`text-[11px] px-1.5 py-0.5 rounded font-mono-code ${
                  activeView === 'estudiantes'
                    ? 'bg-teal-900 text-teal-100'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {students.length}
              </span>
            </button>

            <button
              onClick={() => setActiveView('banco')}
              className={`flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap cursor-pointer ${
                activeView === 'banco'
                  ? 'bg-[#0F766E] text-white shadow-xs'
                  : 'text-[#334155] hover:bg-white/80'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <BookOpen className="w-4 h-4 shrink-0" />
                Banco de Ajustes y DUA
              </span>
              <span
                className={`text-[11px] px-1.5 py-0.5 rounded font-mono-code ${
                  activeView === 'banco'
                    ? 'bg-teal-900 text-teal-100'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {adjustmentBank.length}
              </span>
            </button>

            {activeRole === 'administrador' && (
              <button
                onClick={() => setActiveView('catalogos')}
                className={`flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap cursor-pointer ${
                  activeView === 'catalogos'
                    ? 'bg-[#0F766E] text-white shadow-xs'
                    : 'text-[#334155] hover:bg-white/80'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Layers className="w-4 h-4 shrink-0" />
                  Usuarios, Cursos y SIMAT
                </span>
                <span
                  className={`text-[11px] px-1.5 py-0.5 rounded font-mono-code ${
                    activeView === 'catalogos'
                      ? 'bg-teal-900 text-teal-100'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  Sheets
                </span>
              </button>
            )}

            <button
              onClick={() => setActiveView('historial')}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap cursor-pointer ${
                activeView === 'historial'
                  ? 'bg-[#0F766E] text-white shadow-xs'
                  : 'text-[#334155] hover:bg-white/80'
              }`}
            >
              <History className="w-4 h-4 shrink-0" />
              Historial Año tras Año
            </button>

            <button
              onClick={() => setActiveView('normativa')}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap cursor-pointer ${
                activeView === 'normativa'
                  ? 'bg-[#0F766E] text-white shadow-xs'
                  : 'text-[#334155] hover:bg-white/80'
              }`}
            >
              <Scale className="w-4 h-4 shrink-0" />
              Política PIAR, DUA y MEN
            </button>
          </nav>
        </div>

        {/* Bloque Inferior de Sincronización en Tiempo Real (Cada 2s) — Exclusivo Administrador */}
        {activeRole === 'administrador' && (
          <div className="hidden lg:block p-4 space-y-3 border-t border-[#E2E8F0]">
            <div className="p-3.5 rounded-xl bg-white border border-[#CBD5E1] space-y-2.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#0F766E] flex items-center gap-1.5">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  Google Sheets (2s)
                </span>
                <RefreshCw
                  className={`w-3.5 h-3.5 text-teal-700 ${
                    syncStatus.isSyncingNow ? 'animate-spin' : ''
                  }`}
                />
              </div>

              <div className="text-[11px] text-[#475569] space-y-1 font-mono-code">
                <div className="flex justify-between">
                  <span>Pulso TR:</span>
                  <span className="font-semibold text-[#0F172A]">
                    {syncStatus.lastSyncTimestamp}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Ciclo #</span>
                  <span className="font-semibold text-teal-800">
                    {syncStatus.syncCycleCount} (cada 2s)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Seguridad:</span>
                  <span className="font-semibold text-indigo-800">AES-256-GCM</span>
                </div>
              </div>

              <button
                onClick={() => setIsSheetsModalOpen(true)}
                className="w-full py-2 px-3 rounded-lg bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                {syncStatus.spreadsheetId
                  ? 'Base Google Sheets Activa'
                  : 'Conectar Google Sheets'}
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOPBAR CON SELECTOR DE ROL PERSONALIZADO Y ACCIONES GLOBALES */}
        <header className="no-print bg-white border-b border-[#E2E8F0] px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-30">
          {/* Selector de Perfil / Rol de Usuario con Logo Institucional */}
          <div className="flex flex-wrap items-center gap-2.5">
            <img
              src={EKIRAYA_LOGO_URL}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = EKIRAYA_LOGO_LOCAL_FALLBACK;
              }}
              alt="Logo Colegio Ekirayá Montessori"
              className="hidden sm:block h-7 w-auto object-contain mr-1"
            />
            <span className="text-xs font-bold uppercase tracking-wider text-[#64748B] mr-1">
              Perfil de Usuario Activo:
            </span>

            <div className="inline-flex rounded-xl bg-[#F4F4F0] p-1 border border-[#CBD5E1]">
              <button
                type="button"
                onClick={() => setActiveRole('administrador')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  activeRole === 'administrador'
                    ? 'bg-teal-800 text-white shadow-2xs'
                    : 'text-[#475569] hover:text-[#0F172A]'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Administrador
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveRole('psicologa');
                  setIsSheetsModalOpen(false);
                  if (activeView === 'catalogos') setActiveView('panel');
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  activeRole === 'psicologa'
                    ? 'bg-indigo-700 text-white shadow-2xs'
                    : 'text-[#475569] hover:text-[#0F172A]'
                }`}
              >
                <Brain className="w-3.5 h-3.5" />
                Profesional Psicóloga
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveRole('profesor');
                  setIsSheetsModalOpen(false);
                  if (activeView === 'catalogos') setActiveView('panel');
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  activeRole === 'profesor'
                    ? 'bg-amber-700 text-white shadow-2xs'
                    : 'text-[#475569] hover:text-[#0F172A]'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                Profesor
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsLoginModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition cursor-pointer shadow-2xs"
              title="Abrir Formulario de Inicio de Sesión o cambiar de usuario institucional"
            >
              <LogIn className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                {currentUser
                  ? `${currentUser.username} (${currentUser.rol})`
                  : 'Iniciar Sesión'}
              </span>
            </button>

            {currentUser && (
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition cursor-pointer shadow-2xs"
                title="Cerrar sesión activa y volver al formulario de ingreso"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Cerrar Sesión</span>
              </button>
            )}
          </div>

          {/* Botones Rápidos de Firma .PNG, Base de Datos, Excel y Nuevo PIAR */}
          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={globalSigInputRef}
              type="file"
              accept=".png,image/png,image/jpeg,image/webp"
              onChange={handleGlobalPngUpload}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => globalSigInputRef.current?.click()}
              title="Cargar previamente tu firma en archivo .PNG para los reportes PDF Oficiales"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition cursor-pointer ${
                preloadedSignature
                  ? 'bg-teal-50 hover:bg-teal-100 text-teal-900 border-teal-300'
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300'
              }`}
            >
              <Upload className="w-3.5 h-3.5 text-teal-700" />
              {preloadedSignature
                ? `Firma .PNG Lista (${preloadedSignature.fileName.slice(0, 14)})`
                : 'Cargar Firma (.png)'}
            </button>

            {activeRole === 'administrador' && (
              <button
                type="button"
                onClick={() => setIsSheetsModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-semibold transition cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
                Google Sheets (Sync 2s)
              </button>
            )}

            <button
              type="button"
              onClick={() =>
                exportDetailedExcelWorkbook(
                  students,
                  adjustmentBank,
                  roleProfile.canEditClinicalDiagnosis
                )
              }
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-[#0F172A] border border-[#CBD5E1] text-xs font-semibold transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-teal-700" />
              Reporte Excel (.xls)
            </button>

            <button
              type="button"
              onClick={() =>
                setEditorModalState({
                  isOpen: true,
                  student: null,
                  presetSuperior: false,
                  initialTab: 'general',
                })
              }
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-semibold shadow-2xs transition cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Crear PIAR
            </button>
          </div>
        </header>

        {/* ÁREA DE TRABAJO CENTRAL */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto space-y-5">
          {sigBannerMsg && (
            <div className="no-print bg-teal-900 text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between shadow-xs">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
                {sigBannerMsg}
              </span>
              {preloadedSignature && (
                <img
                  src={preloadedSignature.firmaPngDataUrl}
                  alt="Firma PNG Pre-cargada"
                  className="h-7 bg-white px-2 py-0.5 rounded object-contain"
                />
              )}
            </div>
          )}
          {/* BARRA DIRECTA DE UBICACIÓN Y ACCESO A LA HOJA DE GOOGLE SHEETS — EXCLUSIVO ADMINISTRADOR */}
          {activeRole === 'administrador' && (
            <div className="no-print bg-emerald-950 text-white rounded-xl p-4 sm:px-5 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs border border-emerald-800">
              <div className="flex items-start sm:items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-800/80 text-emerald-200 shrink-0">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs sm:text-sm font-bold text-white">
                      {syncStatus.spreadsheetUrl
                        ? `Hoja Activa: ${syncStatus.spreadsheetTitle}`
                        : 'Base de Datos en Google Sheets (8 Pestañas: PIAR, DUA, Cursos, SIMAT y Usuarios_Perfiles)'}
                    </span>
                    <span className="text-[11px] font-mono-code px-2 py-0.5 rounded bg-emerald-900 text-emerald-200 border border-emerald-700">
                      {syncStatus.spreadsheetId
                        ? `ID: ${syncStatus.spreadsheetId.slice(0, 14)}...`
                        : 'Lista para vincular'}
                    </span>
                  </div>
                  <p className="text-xs text-emerald-200/90 mt-0.5">
                    {syncStatus.spreadsheetUrl
                      ? 'Sincronizando en tiempo real cada 2 segundos con tu archivo de Google Sheets (exclusivo Administrador).'
                      : 'Configura la conexión por Puente Google Apps Script (Solución B sin OAuth) o crea una hoja en tu Google Drive.'}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {syncStatus.spreadsheetUrl ? (
                  <a
                    href={syncStatus.spreadsheetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-bold transition shadow-xs"
                  >
                    Abrir mi Hoja en Google Sheets ↗
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsSheetsModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-bold transition shadow-xs cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Conectar Google Sheets (Solución B)
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setActiveView('catalogos')}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-teal-800 hover:bg-teal-700 text-white border border-teal-600 text-xs font-semibold transition cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5 text-amber-300" />
                  Hoja Usuarios_Perfiles, Cursos y SIMAT
                </button>

                <button
                  type="button"
                  onClick={() => setIsSheetsModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-900 hover:bg-emerald-800 text-emerald-100 border border-emerald-700 text-xs font-semibold transition cursor-pointer"
                >
                  Configurar / Vincular URL
                </button>
              </div>
            </div>
          )}

          {/* VISTA 1: PANEL DE CONTROL PERSONALIZADO POR ROL */}
          {activeView === 'panel' && (
            <RoleDashboard
              activeRole={activeRole}
              roleProfile={roleProfile}
              students={students}
              adjustmentBank={adjustmentBank}
              syncStatus={syncStatus}
              onOpenNewPiar={(presetSuperior = false) =>
                setEditorModalState({
                  isOpen: true,
                  student: null,
                  presetSuperior,
                  initialTab: 'general',
                })
              }
              onEditStudent={(st, tab = 'general') =>
                setEditorModalState({
                  isOpen: true,
                  student: st,
                  presetSuperior: st.esDesempenoSuperior,
                  initialTab: tab,
                })
              }
              onOpenAuditPdf={(st) => setAuditPdfStudent(st)}
              onOpenSheetsModal={() => setIsSheetsModalOpen(true)}
              onExportExcel={() =>
                exportDetailedExcelWorkbook(
                  students,
                  adjustmentBank,
                  roleProfile.canEditClinicalDiagnosis
                )
              }
              onNavigateView={(v) => setActiveView(v)}
            />
          )}

          {/* VISTA 2: DIRECTORIO Y GESTIÓN DE EXPEDIENTES PIAR Y DESEMPEÑO SUPERIOR */}
          {activeView === 'estudiantes' && (
            <div className="space-y-6">
              <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A] font-serif-editorial">
                    Expedientes Estudiantiles PIAR, DUA y Desempeño Superior
                  </h2>
                  <p className="text-sm text-[#475569]">
                    Gestiona caracterizaciones, adecuaciones por asignatura, seguimiento por periodo, historial anual y exportación PDF con firma profesional.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() =>
                      setEditorModalState({
                        isOpen: true,
                        student: null,
                        presetSuperior: false,
                        initialTab: 'general',
                      })
                    }
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#0F766E] hover:bg-[#115E59] text-white text-xs sm:text-sm font-semibold cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Nuevo PIAR (Plantilla Decreto 1421)
                  </button>
                  <button
                    onClick={() =>
                      setEditorModalState({
                        isOpen: true,
                        student: null,
                        presetSuperior: true,
                        initialTab: 'general',
                      })
                    }
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs sm:text-sm font-semibold cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-amber-700" />
                    Nuevo Plan Desempeño Superior
                  </button>
                </div>
              </div>

              {/* Barra de Filtros */}
              <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchStudent}
                    onChange={(e) => setSearchStudent(e.target.value)}
                    placeholder="Buscar por nombres, apellidos o SIMAT..."
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#CBD5E1] text-xs sm:text-sm"
                  />
                </div>

                <select
                  value={filterCurso}
                  onChange={(e) => setFilterCurso(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-[#CBD5E1] text-xs sm:text-sm bg-white"
                >
                  <option value="TODOS">Todos los Cursos / Grados</option>
                  {Array.from(
                    new Set(
                      [
                        ...cursosCatalog.map((c) => c.nombreCurso || c.curso),
                        ...CURSOS_COLOMBIA,
                      ].filter(Boolean)
                    )
                  ).map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>

                <select
                  value={filterAnio}
                  onChange={(e) => setFilterAnio(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-[#CBD5E1] text-xs sm:text-sm bg-white"
                >
                  <option value="TODOS">Todos los Años Lectivos</option>
                  {Array.from(
                    new Set([
                      ...ANIOS_LECTIVOS_COLOMBIA,
                      ...cursosCatalog.map((c) => c.anioLectivo),
                    ])
                  ).map((yr) => (
                    <option key={yr} value={yr}>
                      Año Lectivo {yr}
                    </option>
                  ))}
                </select>

                <select
                  value={filterTipo}
                  onChange={(e) =>
                    setFilterTipo(e.target.value as 'TODOS' | 'PIAR' | 'SUPERIOR')
                  }
                  className="px-3 py-2 rounded-lg border border-[#CBD5E1] text-xs sm:text-sm bg-white"
                >
                  <option value="TODOS">Todos: PIAR 1421 + Desempeño Superior</option>
                  <option value="PIAR">Solo PIAR (Ajustes Razonables NEE)</option>
                  <option value="SUPERIOR">
                    Solo Desempeño Superior / Talentos Excepcionales
                  </option>
                </select>
              </div>

              {/* Lista de Tarjetas de Expedientes Estudiantiles */}
              <div className="space-y-4">
                {filteredStudents.map((st) => (
                  <div
                    key={st.id}
                    className="bg-white border border-[#E2E8F0] hover:border-[#94A3B8] rounded-xl p-5 space-y-4 shadow-2xs transition"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 border-b border-[#E2E8F0] pb-4">
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono-code text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-300">
                            {st.codigoSimat}
                          </span>
                          <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-teal-50 text-teal-900 border border-teal-200">
                            Curso: {st.curso} • Año Lectivo {st.anioLectivo}
                          </span>
                          <span
                            className={`text-xs font-semibold px-2.5 py-0.5 rounded ${
                              st.esDesempenoSuperior
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : 'bg-indigo-50 text-indigo-900 border border-indigo-200'
                            }`}
                          >
                            {st.categoriaSimat}
                          </span>
                        </div>

                        <h3 className="text-lg sm:text-xl font-bold text-[#0F172A] font-serif-editorial">
                          {st.nombresApellidos}
                        </h3>

                        <p className="text-xs sm:text-sm text-[#334155]">
                          <strong className="text-[#0F172A]">Descripción Pedagógica:</strong>{' '}
                          {st.descripcion}
                        </p>

                        <div className="text-xs text-[#475569] flex items-center gap-1.5 pt-0.5">
                          <Lock className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                          <span>
                            <strong>Diagnóstico (Ley 1581):</strong>{' '}
                            {roleProfile.canEditClinicalDiagnosis
                              ? st.diagnostico
                              : 'Dato clínico protegido para rol docente — consultar caracterización pedagógica DUA.'}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <button
                          onClick={() =>
                            setEditorModalState({
                              isOpen: true,
                              student: st,
                              presetSuperior: st.esDesempenoSuperior,
                              initialTab: 'general',
                            })
                          }
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#0F172A] text-xs font-semibold transition cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          Editar PIAR
                        </button>

                        <button
                          onClick={() =>
                            setEditorModalState({
                              isOpen: true,
                              student: st,
                              presetSuperior: st.esDesempenoSuperior,
                              initialTab: 'asignaturas',
                            })
                          }
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 text-xs font-semibold transition cursor-pointer"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          Asignaturas ({st.adecuaciones.length})
                        </button>

                        <button
                          onClick={() =>
                            setEditorModalState({
                              isOpen: true,
                              student: st,
                              presetSuperior: st.esDesempenoSuperior,
                              initialTab: 'seguimiento',
                            })
                          }
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-semibold transition cursor-pointer"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          Periodos I-IV
                        </button>

                        <button
                          onClick={() => setAuditPdfStudent(st)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-300 text-xs font-semibold transition cursor-pointer"
                        >
                          <FileCheck2 className="w-3.5 h-3.5 text-teal-700" />
                          Vista y Firma (.PNG)
                        </button>

                        <button
                          onClick={() => exportOfficialPiarPdf(st)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-semibold shadow-2xs transition cursor-pointer"
                        >
                          <FileDown className="w-3.5 h-3.5" />
                          Exportar PDF Oficial (.pdf)
                        </button>

                        {activeRole === 'administrador' && students.length > 1 && (
                          <button
                            onClick={() =>
                              handleDeleteStudentPiar(st.id, st.nombresApellidos)
                            }
                            className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                            title="Eliminar expediente"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Vista Previa de la Matriz de Adecuaciones por Asignatura del Estudiante */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-[#F4F4F0] text-[#475569] uppercase text-[10px] font-bold tracking-wider">
                            <th className="p-2.5 rounded-l-lg">Nombre Asignatura</th>
                            <th className="p-2.5">Indicador Original</th>
                            <th className="p-2.5">Indicador Ajustado</th>
                            <th className="p-2.5">Ajuste del Proceso (DUA)</th>
                            <th className="p-2.5 rounded-r-lg">Nombre del Docente</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E2E8F0]">
                          {st.adecuaciones.map((ad) => (
                            <tr key={ad.id} className="hover:bg-slate-50/70">
                              <td className="p-2.5 font-bold text-[#0F172A] whitespace-nowrap">
                                {ad.asignatura}
                              </td>
                              <td className="p-2.5 text-[#475569] max-w-xs">{ad.indicador}</td>
                              <td className="p-2.5 font-medium text-teal-950 bg-teal-50/30 max-w-xs">
                                {ad.indicadorAjustado}
                              </td>
                              <td className="p-2.5 text-[#334155] max-w-sm">
                                {ad.ajusteProceso}
                              </td>
                              <td className="p-2.5 font-medium text-[#0F172A] whitespace-nowrap">
                                {ad.nombreDocente}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VISTA 3: BANCO DE AJUSTES RAZONABLES POR TIPO DE NECESIDAD */}
          {activeView === 'banco' && (
            <AdjustmentBankView
              adjustmentBank={adjustmentBank}
              students={students}
              onAddAdjustmentToBank={handleAddAdjustmentToBank}
              onDeleteAdjustmentFromBank={handleDeleteAdjustmentFromBank}
              onApplyAdjustmentToStudent={handleApplyAdjustmentToStudent}
            />
          )}

          {/* VISTA 3.5: TABLAS MAESTRAS EN GOOGLE SHEETS (EXCLUSIVO ADMINISTRADOR) */}
          {activeView === 'catalogos' && activeRole === 'administrador' && (
            <CatalogTablesView
              cursosCatalog={cursosCatalog}
              categoriasCatalog={categoriasCatalog}
              usuariosCatalog={usuariosCatalog}
              onAddCurso={handleAddCursoCatalog}
              onDeleteCurso={handleDeleteCursoCatalog}
              onAddCategoria={handleAddCategoriaSimat}
              onDeleteCategoria={handleDeleteCategoriaSimat}
              onAddUsuario={handleAddUsuarioCatalog}
              onDeleteUsuario={handleDeleteUsuarioCatalog}
              onSwitchActiveUser={handleLoginSuccess}
              onForceSyncSheets={() => {
                if (!accessToken || !syncStatus.spreadsheetId) {
                  handleCreateNewGoogleSheet();
                } else {
                  handleForceManualSync();
                }
              }}
              spreadsheetId={syncStatus.spreadsheetId}
              isConnected={Boolean(accessToken && syncStatus.spreadsheetId)}
            />
          )}

          {/* VISTA 4: HISTORIAL DEL ESTUDIANTE AÑO TRAS AÑO */}
          {activeView === 'historial' && (
            <div className="space-y-6">
              <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A] font-serif-editorial">
                    Historial Longitudinal del Estudiante (Año tras Año)
                  </h2>
                  <p className="text-sm text-[#475569]">
                    Continuidad pedagógica multianual exigida por el Decreto 1421 de 2017 para transiciones entre grados y niveles educativos.
                  </p>
                </div>
                <button
                  onClick={() => exportSubjectAdaptationsCsv(students)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-[#CBD5E1] hover:bg-slate-50 text-xs font-semibold text-[#0F172A] shrink-0 cursor-pointer"
                >
                  <Download className="w-4 h-4 text-teal-700" />
                  Exportar Matriz Histórica CSV
                </button>
              </div>

              <div className="space-y-5">
                {students.map((st) => (
                  <div
                    key={st.id}
                    className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-4 shadow-2xs"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E2E8F0] pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-base font-bold text-[#0F172A] font-serif-editorial">
                            {st.nombresApellidos}
                          </span>
                          <span className="text-xs font-mono-code px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            {st.codigoSimat}
                          </span>
                        </div>
                        <p className="text-xs text-[#64748B]">
                          Grado Actual: {st.curso} ({st.anioLectivo}) • {st.categoriaSimat}
                        </p>
                      </div>

                      <button
                        onClick={() =>
                          setEditorModalState({
                            isOpen: true,
                            student: st,
                            presetSuperior: st.esDesempenoSuperior,
                            initialTab: 'historial',
                          })
                        }
                        className="px-3.5 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-200 text-xs font-semibold cursor-pointer"
                      >
                        Gestionar / Promover Año Lectivo
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {st.historial.map((h) => (
                        <div
                          key={h.id}
                          className="p-4 rounded-xl bg-[#FBFBF9] border border-[#CBD5E1] space-y-2 relative"
                        >
                          <div className="flex items-center justify-between">
                            <span className="px-2.5 py-0.5 rounded bg-[#0F766E] text-white font-mono-code text-xs font-bold">
                              Año {h.anioLectivo}
                            </span>
                            <span className="text-xs font-bold text-[#0F172A]">
                              {h.curso}
                            </span>
                          </div>
                          <p className="text-xs text-[#334155]">
                            <strong>Contexto:</strong> {h.resumenDiagnosticoYContexto}
                          </p>
                          <p className="text-xs text-[#334155]">
                            <strong>Logros:</strong> {h.logrosConsolidados}
                          </p>
                          <p className="text-xs text-teal-900">
                            <strong>Ajustes Clave:</strong> {h.ajustesMasEfectivos}
                          </p>
                          <div className="pt-2 border-t border-[#E2E8F0] flex items-center justify-between text-[11px] text-[#64748B]">
                            <span>{h.estadoPromocion}</span>
                            <span>{h.profesionalCargo}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VISTA 5: MARCO LEGAL COLOMBIANO (PIAR, DUA, DESEMPEÑO SUPERIOR) */}
          {activeView === 'normativa' && (
            <LegislationGuideView
              onUseTemplate={(presetSuperior) =>
                setEditorModalState({
                  isOpen: true,
                  student: null,
                  presetSuperior,
                  initialTab: 'general',
                })
              }
            />
          )}
        </main>
      </div>

      {/* MODAL DE EDICIÓN / CREACIÓN DE PIAR Y PLANTILLAS EDITABLES */}
      {editorModalState.isOpen && (
        <PiarEditorModal
          student={editorModalState.student}
          presetSuperior={editorModalState.presetSuperior}
          initialTab={editorModalState.initialTab}
          roleProfile={roleProfile}
          adjustmentBank={adjustmentBank}
          cursosCatalog={cursosCatalog}
          categoriasCatalog={categoriasCatalog}
          onClose={() =>
            setEditorModalState({
              isOpen: false,
              student: null,
              presetSuperior: false,
              initialTab: 'general',
            })
          }
          onSave={handleSaveStudentPiar}
        />
      )}

      {/* MODAL DE INFORME PDF DE AUDITORÍA CON FIRMA DEL PROFESIONAL A CARGO */}
      {auditPdfStudent && (
        <AuditPdfModal
          student={auditPdfStudent}
          roleProfile={roleProfile}
          onClose={() => setAuditPdfStudent(null)}
          onSaveSignature={handleSaveSignature}
        />
      )}

      {/* MODAL DE CONFIGURACIÓN GOOGLE SHEETS (SYNC 2S) — EXCLUSIVO ADMINISTRADOR */}
      {isSheetsModalOpen && activeRole === 'administrador' && (
        <SheetsSyncModal
          syncStatus={syncStatus}
          students={students}
          encryptionKey={encryptionKey}
          auditLogs={auditLogs}
          customClientId={customClientId}
          onSaveCustomClientId={handleSaveCustomClientId}
          onClose={() => setIsSheetsModalOpen(false)}
          onConnectGoogleOAuth={(overrideId) => handleConnectGoogleOAuth(overrideId || true)}
          onCreateNewGoogleSheet={handleCreateNewGoogleSheet}
          onConnectExistingSheet={handleConnectExistingSheet}
          onForceManualSync={handleForceManualSync}
          onUpdateEncryptionKey={(newKey) => setEncryptionKey(newKey)}
          onExportExcelWorkbook={() =>
            exportDetailedExcelWorkbook(
              students,
              adjustmentBank,
              roleProfile.canEditClinicalDiagnosis,
              cursosCatalog,
              categoriasCatalog,
              usuariosCatalog
            )
          }
          onExportCsvMatrix={() => exportSubjectAdaptationsCsv(students)}
        />
      )}

      {/* FORMULARIO DE INICIO DE SESIÓN (LOGIN) CONECTADO A LA HOJA USUARIOS_PERFILES */}
      {isLoginModalOpen && (
        <LoginView
          usuariosCatalog={usuariosCatalog}
          currentUser={currentUser}
          syncStatus={syncStatus}
          onLoginSuccess={handleLoginSuccess}
          onAddUserAndLogin={handleAddUserAndLogin}
          onLogout={handleLogout}
          onConnectGoogleOAuth={() => handleConnectGoogleOAuth(true)}
          onForceSyncSheets={handleForceManualSync}
          onConnectAppsScriptUrl={handleConnectExistingSheet}
          onOpenSheetsModal={() => setIsSheetsModalOpen(true)}
          onCancel={currentUser ? () => setIsLoginModalOpen(false) : undefined}
        />
      )}
    </div>
  );
}
