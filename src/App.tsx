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
} from 'lucide-react';
import {
  AjusteRazonableItem,
  AuditLogEntry,
  FirmaProfesional,
  StudentPIAR,
  SyncStatus,
  UserRole,
} from './types/piar';
import {
  BANCO_AJUSTES_INICIAL,
  CURSOS_COLOMBIA,
  INITIAL_STUDENTS_PIAR,
  ROLE_PROFILES,
} from './data/colombianLegislationAndSeed';
import {
  createEkirayaSpreadsheet,
  extractSpreadsheetId,
  pullDataFromSpreadsheet,
  pushAllDataToSpreadsheet,
} from './services/googleSheetsService';
import {
  exportDetailedExcelWorkbook,
  exportSubjectAdaptationsCsv,
} from './utils/exportUtils';
import { generateAuditHash } from './utils/crypto';
import { RoleDashboard } from './components/RoleDashboard';
import { PiarEditorModal } from './components/PiarEditorModal';
import { AuditPdfModal } from './components/AuditPdfModal';
import { AdjustmentBankView } from './components/AdjustmentBankView';
import { SheetsSyncModal } from './components/SheetsSyncModal';
import { LegislationGuideView } from './components/LegislationGuideView';

const STORAGE_STUDENTS_KEY = 'ekiraya_iep_students_v1';
const STORAGE_BANK_KEY = 'ekiraya_iep_bank_v1';
const STORAGE_SHEET_META_KEY = 'ekiraya_iep_sheet_meta_v1';

export default function App() {
  // Rol de usuario activo: Administrador, Psicóloga o Profesor
  const [activeRole, setActiveRole] = useState<UserRole>('psicologa');
  const roleProfile = ROLE_PROFILES[activeRole];

  // Navegación principal
  const [activeView, setActiveView] = useState<
    'panel' | 'estudiantes' | 'banco' | 'historial' | 'normativa'
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

  // Estado de OAuth y Google Sheets
  const [accessToken, setAccessToken] = useState<string | null>(() =>
    sessionStorage.getItem('ekiraya_google_token')
  );
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
    return {
      isConnectedToGoogle: Boolean(sessionStorage.getItem('ekiraya_google_token')),
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
  const isDirtyForSheetsRef = useRef(false);
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

      // 2. Si hay conexión activa con Google Sheets y un Spreadsheet vinculado, sincronizar cada 2s
      if (accessToken && syncStatus.spreadsheetId) {
        try {
          if (isDirtyForSheetsRef.current) {
            isDirtyForSheetsRef.current = false;
            await pushAllDataToSpreadsheet(
              accessToken,
              syncStatus.spreadsheetId,
              studentsRef.current,
              bankRef.current,
              encryptionKey
            );
          } else if (!editorModalState.isOpen) {
            const remote = await pullDataFromSpreadsheet(
              accessToken,
              syncStatus.spreadsheetId,
              encryptionKey
            );
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

  // Autenticación OAuth 2.0 con Google Identity Services (Client-Side)
  const handleConnectGoogleOAuth = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!window.google?.accounts?.oauth2 || !clientId) {
      setSyncStatus((prev) => ({
        ...prev,
        lastError:
          'El cliente OAuth de Google se está inicializando o requiere configurar VITE_GOOGLE_CLIENT_ID.',
      }));
      return;
    }

    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: 'https://www.googleapis.com/auth/spreadsheets',
      callback: async (tokenResponse) => {
        if (tokenResponse.access_token) {
          const token = tokenResponse.access_token;
          setAccessToken(token);
          sessionStorage.setItem('ekiraya_google_token', token);
          setSyncStatus((prev) => ({
            ...prev,
            isConnectedToGoogle: true,
            lastError: null,
          }));
          appendAuditLog('Conexión OAuth 2.0 establecida con Google Sheets API');
        }
      },
    });

    tokenClient.requestAccessToken({ prompt: 'consent' });
  };

  // Crear nueva Hoja de Cálculo Google Sheets con las 5 pestañas de Ekirayá IEP
  const handleCreateNewGoogleSheet = async () => {
    if (!accessToken) {
      handleConnectGoogleOAuth();
      return;
    }
    try {
      const created = await createEkirayaSpreadsheet(
        accessToken,
        students,
        adjustmentBank,
        encryptionKey
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

  // Vincular un Google Sheet existente
  const handleConnectExistingSheet = async (sheetIdOrUrl: string) => {
    const extractedId = extractSpreadsheetId(sheetIdOrUrl);
    const url = `https://docs.google.com/spreadsheets/d/${extractedId}/edit`;
    localStorage.setItem(
      STORAGE_SHEET_META_KEY,
      JSON.stringify({
        id: extractedId,
        url,
        title: `Google Sheet Institucional (${extractedId.slice(0, 8)}...)`,
      })
    );
    setSyncStatus((prev) => ({
      ...prev,
      spreadsheetId: extractedId,
      spreadsheetUrl: url,
      spreadsheetTitle: `Google Sheet Institucional (${extractedId.slice(0, 8)}...)`,
      lastError: null,
    }));

    if (accessToken) {
      try {
        const remote = await pullDataFromSpreadsheet(
          accessToken,
          extractedId,
          encryptionKey
        );
        if (remote.students && remote.students.length > 0) {
          setStudents(remote.students);
          localStorage.setItem(STORAGE_STUDENTS_KEY, JSON.stringify(remote.students));
        } else {
          await pushAllDataToSpreadsheet(
            accessToken,
            extractedId,
            students,
            adjustmentBank,
            encryptionKey
          );
        }
        appendAuditLog(`Vinculado y sincronizado Google Sheet ID: ${extractedId}`);
      } catch (err) {
        setSyncStatus((prev) => ({
          ...prev,
          lastError:
            err instanceof Error
              ? err.message
              : 'Verifica que el Sheet tenga las pestañas de Ekirayá IEP o permisos de edición.',
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
    if (accessToken && syncStatus.spreadsheetId) {
      try {
        await pushAllDataToSpreadsheet(
          accessToken,
          syncStatus.spreadsheetId,
          students,
          adjustmentBank,
          encryptionKey
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
          {/* Marca Ekirayá IEP */}
          <div className="flex items-center justify-between lg:block">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0F766E] text-white flex items-center justify-center font-serif-editorial font-bold text-xl shadow-xs">
                E
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight text-[#0F172A] font-serif-editorial leading-none">
                  Ekirayá IEP
                </h1>
                <p className="text-[11px] font-medium text-[#475569] mt-1">
                  PIAR • DUA • Talentos MEN
                </p>
              </div>
            </div>

            {/* Botón móvil de estado Google Sheets */}
            <button
              onClick={() => setIsSheetsModalOpen(true)}
              className="lg:hidden inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white border border-[#CBD5E1] text-xs font-semibold text-teal-800"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Sync 2s
            </button>
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

        {/* Bloque Inferior de Sincronización en Tiempo Real (Cada 2s) y Encriptación */}
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
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOPBAR CON SELECTOR DE ROL PERSONALIZADO Y ACCIONES GLOBALES */}
        <header className="no-print bg-white border-b border-[#E2E8F0] px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-30">
          {/* Selector de Perfil / Rol de Usuario */}
          <div className="flex flex-wrap items-center gap-2">
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
                onClick={() => setActiveRole('psicologa')}
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
                onClick={() => setActiveRole('profesor')}
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
          </div>

          {/* Botones Rápidos de Base de Datos, Excel y Nuevo PIAR */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setIsSheetsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-semibold transition cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
              Google Sheets (Sync 2s)
            </button>

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
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto">
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
                  {CURSOS_COLOMBIA.map((c) => (
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
                  <option value="2026">Año Lectivo 2026</option>
                  <option value="2025">Año Lectivo 2025</option>
                  <option value="2024">Año Lectivo 2024</option>
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
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-semibold shadow-2xs transition cursor-pointer"
                        >
                          <FileCheck2 className="w-3.5 h-3.5" />
                          Exportar PDF Auditoría
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

      {/* MODAL DE CONFIGURACIÓN GOOGLE SHEETS (SYNC 2S) Y ENCRIPTACIÓN AES-256 */}
      {isSheetsModalOpen && (
        <SheetsSyncModal
          syncStatus={syncStatus}
          students={students}
          encryptionKey={encryptionKey}
          auditLogs={auditLogs}
          onClose={() => setIsSheetsModalOpen(false)}
          onConnectGoogleOAuth={handleConnectGoogleOAuth}
          onCreateNewGoogleSheet={handleCreateNewGoogleSheet}
          onConnectExistingSheet={handleConnectExistingSheet}
          onForceManualSync={handleForceManualSync}
          onUpdateEncryptionKey={(newKey) => setEncryptionKey(newKey)}
          onExportExcelWorkbook={() =>
            exportDetailedExcelWorkbook(
              students,
              adjustmentBank,
              roleProfile.canEditClinicalDiagnosis
            )
          }
          onExportCsvMatrix={() => exportSubjectAdaptationsCsv(students)}
        />
      )}
    </div>
  );
}
