import React, { useState } from 'react';
import {
  X,
  FileSpreadsheet,
  RefreshCw,
  Lock,
  ExternalLink,
  CheckCircle2,
  PlusCircle,
  Link2,
  ShieldCheck,
  AlertCircle,
  Download,
} from 'lucide-react';
import { AuditLogEntry, StudentPIAR, SyncStatus } from '../types/piar';
import { formatEncryptedPreview } from '../utils/crypto';

interface SheetsSyncModalProps {
  syncStatus: SyncStatus;
  students: StudentPIAR[];
  encryptionKey: string;
  auditLogs: AuditLogEntry[];
  onClose: () => void;
  onConnectGoogleOAuth: () => void;
  onCreateNewGoogleSheet: () => Promise<void>;
  onConnectExistingSheet: (sheetIdOrUrl: string) => Promise<void>;
  onForceManualSync: () => Promise<void>;
  onUpdateEncryptionKey: (newKey: string) => void;
  onExportExcelWorkbook: () => void;
  onExportCsvMatrix: () => void;
}

export const SheetsSyncModal: React.FC<SheetsSyncModalProps> = ({
  syncStatus,
  students,
  encryptionKey,
  auditLogs,
  onClose,
  onConnectGoogleOAuth,
  onCreateNewGoogleSheet,
  onConnectExistingSheet,
  onForceManualSync,
  onUpdateEncryptionKey,
  onExportExcelWorkbook,
  onExportCsvMatrix,
}) => {
  const [sheetInput, setSheetInput] = useState(syncStatus.spreadsheetId || '');
  const [keyInput, setKeyInput] = useState(encryptionKey);
  const [isBusy, setIsBusy] = useState(false);
  const [keySavedToast, setKeySavedToast] = useState(false);

  const handleCreateSheetClick = async () => {
    setIsBusy(true);
    try {
      await onCreateNewGoogleSheet();
    } finally {
      setIsBusy(false);
    }
  };

  const handleLinkExistingClick = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sheetInput.trim()) return;
    setIsBusy(true);
    try {
      await onConnectExistingSheet(sheetInput);
    } finally {
      setIsBusy(false);
    }
  };

  const handleSaveEncryptionKey = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateEncryptionKey(keyInput);
    setKeySavedToast(true);
    setTimeout(() => setKeySavedToast(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-[#FBFBF9] border border-[#CBD5E1] rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Cabecera */}
        <div className="bg-white border-b border-[#E2E8F0] px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
              <FileSpreadsheet className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-[#0F172A] font-serif-editorial">
                Base de Datos en Google Sheets, Sincronización (2s) y Seguridad AES-256
              </h2>
              <p className="text-xs text-[#64748B]">
                Arquitectura colaborativa en tiempo real cada 2 segundos y protección criptográfica Ley 1581 de 2012
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Estado de Sincronización en Tiempo Real (Cada 2 Segundos) */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <h3 className="text-sm sm:text-base font-bold text-[#0F172A]">
                  Motor de Sincronización en Tiempo Real (Intervalo: 2.0 Segundos)
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 font-mono-code text-xs font-semibold">
                  Ciclo #{syncStatus.syncCycleCount} • Último pulso: {syncStatus.lastSyncTimestamp}
                </span>
                <button
                  type="button"
                  onClick={onForceManualSync}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-200 text-xs font-semibold cursor-pointer"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${syncStatus.isSyncingNow ? 'animate-spin' : ''}`}
                  />
                  Sincronizar Ahora
                </button>
              </div>
            </div>

            {syncStatus.lastError && (
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-300 text-amber-950 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <strong>Aviso de conexión Google Sheets:</strong> {syncStatus.lastError}
                </div>
              </div>
            )}

            {/* OAuth 2.0 y Vinculación de Hoja de Cálculo Google Sheets */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-[#FBFBF9] border border-[#CBD5E1] space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-[#0F766E]">
                  Paso 1: Autenticación y Creación Automática en Google Sheets
                </div>
                <p className="text-xs text-[#475569]">
                  Conecta tu cuenta de Google para crear o actualizar con un clic tu hoja de cálculo estructurada con las 8 pestañas oficiales (<strong>PIAR_Estudiantes</strong>, <strong>Adecuaciones_Asignaturas</strong>, <strong>Seguimiento_Periodos</strong>, <strong>Historial_Anual</strong>, <strong>Banco_Ajustes</strong>, <strong>Tabla_Cursos_Anios</strong>, <strong>Tabla_Categorias_SIMAT</strong> y <strong>Usuarios_Perfiles</strong>).
                </p>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={onConnectGoogleOAuth}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-semibold shadow-xs transition cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {syncStatus.isConnectedToGoogle
                      ? 'Cuenta Google Conectada (Renovar Token)'
                      : 'Conectar Cuenta de Google Sheets'}
                  </button>

                  {syncStatus.isConnectedToGoogle && (
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={handleCreateSheetClick}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition cursor-pointer disabled:opacity-50"
                    >
                      <PlusCircle className="w-4 h-4" />
                      {isBusy ? 'Creando Hoja...' : 'Crear Nueva Base en mi Google Sheets'}
                    </button>
                  )}
                </div>

                {syncStatus.spreadsheetUrl && (
                  <div className="pt-2">
                    <a
                      href={syncStatus.spreadsheetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-800 hover:underline"
                    >
                      Abrir "{syncStatus.spreadsheetTitle}" en Google Sheets
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>

              <form
                onSubmit={handleLinkExistingClick}
                className="p-4 rounded-xl bg-[#FBFBF9] border border-[#CBD5E1] space-y-3"
              >
                <div className="text-xs font-bold uppercase tracking-wider text-indigo-800">
                  Paso 2 (Opcional): Conectar un Google Sheet Existente
                </div>
                <p className="text-xs text-[#475569]">
                  Si tu institución ya creó un Google Sheet compartido entre docentes y psicorientación, pega aquí su URL o ID para sincronizarlo cada 2 segundos:
                </p>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={sheetInput}
                    onChange={(e) => setSheetInput(e.target.value)}
                    placeholder="Pega la URL o el ID de tu Google Sheet..."
                    className="flex-1 px-3 py-2 rounded-lg border border-[#CBD5E1] bg-white text-xs font-mono-code"
                  />
                  <button
                    type="submit"
                    disabled={isBusy || !sheetInput.trim()}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-semibold transition cursor-pointer disabled:opacity-50"
                  >
                    <Link2 className="w-3.5 h-3.5" />
                    Vincular
                  </button>
                </div>

                <div className="pt-1 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={onExportExcelWorkbook}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#CBD5E1] hover:bg-slate-50 text-xs font-semibold text-[#0F172A] cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-700" />
                    Descargar Libro Excel Multi-Hoja (.xls)
                  </button>
                  <button
                    type="button"
                    onClick={onExportCsvMatrix}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#CBD5E1] hover:bg-slate-50 text-xs font-semibold text-[#0F172A] cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-teal-700" />
                    Descargar Matriz CSV (UTF-8)
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Inspector de Encriptación AES-256-GCM y Protección de Datos Sensibles */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
                  <Lock className="w-4 h-4 text-teal-700" />
                  Cifrado Criptográfico de Diagnósticos (AES-256-GCM)
                </h3>
                <span className="text-[11px] font-mono-code px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
                  PBKDF2 SHA-256
                </span>
              </div>

              <p className="text-xs text-[#475569]">
                En cumplimiento de la Ley 1581 de 2012, los diagnósticos clínicos se cifran antes de guardarse en la columna <code className="font-mono-code">Diagnostico_Cifrado_AES256</code> de Google Sheets.
              </p>

              <form onSubmit={handleSaveEncryptionKey} className="space-y-2 pt-1">
                <label className="block text-xs font-semibold text-[#334155]">
                  Llave Criptográfica Institucional (Passphrase AES-256):
                </label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={keyInput}
                    onChange={(e) => setKeyInput(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-[#CBD5E1] text-xs font-mono-code"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold cursor-pointer"
                  >
                    Actualizar Llave
                  </button>
                </div>
                {keySavedToast && (
                  <div className="text-xs text-emerald-700 font-semibold">
                    ✓ Llave AES-256-GCM actualizada para el próximo ciclo de sincronización.
                  </div>
                )}
              </form>

              <div className="pt-2 space-y-1.5">
                <div className="text-xs font-semibold text-[#334155]">
                  Muestra en vivo de celdas cifradas en Google Sheets:
                </div>
                <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                  {students.slice(0, 3).map((st) => (
                    <div
                      key={st.id}
                      className="p-2 rounded bg-slate-900 text-emerald-300 font-mono-code text-[11px] truncate"
                    >
                      <span className="text-slate-400">{st.nombresApellidos}: </span>
                      {formatEncryptedPreview(st.diagnostico, st.id)}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Registro de Auditoría en Tiempo Real */}
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-700" />
                  Bitácora de Auditoría y Concurrencia Multi-Usuario
                </h3>
                <span className="text-[11px] font-semibold text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded">
                  Tiempo Real
                </span>
              </div>

              <div className="max-h-60 overflow-y-auto divide-y divide-[#E2E8F0] text-xs">
                {auditLogs.map((log) => (
                  <div key={log.id} className="py-2.5 flex items-start justify-between gap-2">
                    <div>
                      <div className="font-semibold text-[#0F172A]">{log.accion}</div>
                      <div className="text-[11px] text-[#64748B]">
                        {log.usuario} ({log.rol}) {log.estudianteRef ? `• ${log.estudianteRef}` : ''}
                      </div>
                    </div>
                    <div className="text-right font-mono-code text-[10px] text-[#64748B] shrink-0">
                      <div>{log.timestamp}</div>
                      <div className="text-teal-800">{log.hashIntegridad}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
