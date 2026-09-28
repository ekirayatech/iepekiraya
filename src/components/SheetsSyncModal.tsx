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
  Copy,
  Check,
  Code2,
  Globe,
  KeyRound,
} from 'lucide-react';
import { AuditLogEntry, StudentPIAR, SyncStatus } from '../types/piar';
import { formatEncryptedPreview } from '../utils/crypto';
import { EKIRAYA_APPS_SCRIPT_CODE, isAppsScriptUrl } from '../services/googleSheetsService';

interface SheetsSyncModalProps {
  syncStatus: SyncStatus;
  students: StudentPIAR[];
  encryptionKey: string;
  auditLogs: AuditLogEntry[];
  customClientId?: string;
  onSaveCustomClientId?: (clientId: string) => void;
  onClose: () => void;
  onConnectGoogleOAuth: (customClientIdOverride?: string) => void;
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
  customClientId = '',
  onSaveCustomClientId,
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
  const [clientIdInput, setClientIdInput] = useState(customClientId);
  const [isBusy, setIsBusy] = useState(false);
  const [keySavedToast, setKeySavedToast] = useState(false);
  const [copiedOrigin, setCopiedOrigin] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  const [showScriptModal, setShowScriptModal] = useState(true);
  const [showOAuthAlternative, setShowOAuthAlternative] = useState(false);
  const [confirmOverwriteOpen, setConfirmOverwriteOpen] = useState(false);
  const [clientIdSavedToast, setClientIdSavedToast] = useState(false);
  const [bridgeSuccessMsg, setBridgeSuccessMsg] = useState<string | null>(null);

  const currentOrigin =
    typeof window !== 'undefined' ? window.location.origin : 'https://tu-dominio.vercel.app';
  const isUsingAppsScript = isAppsScriptUrl(syncStatus.spreadsheetId || sheetInput);

  const handleCopyOrigin = () => {
    navigator.clipboard?.writeText(currentOrigin);
    setCopiedOrigin(true);
    setTimeout(() => setCopiedOrigin(false), 2500);
  };

  const handleCopyAppsScript = () => {
    navigator.clipboard?.writeText(EKIRAYA_APPS_SCRIPT_CODE);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2500);
  };

  const handleSaveClientId = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSaveCustomClientId) {
      onSaveCustomClientId(clientIdInput.trim());
      setClientIdSavedToast(true);
      setTimeout(() => setClientIdSavedToast(false), 3000);
    }
  };

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
    if (isAppsScriptUrl(sheetInput.trim())) {
      await executeConfirmedLink();
    } else {
      setConfirmOverwriteOpen(true);
    }
  };

  const executeConfirmedLink = async () => {
    setConfirmOverwriteOpen(false);
    setBridgeSuccessMsg(null);
    setIsBusy(true);
    try {
      await onConnectExistingSheet(sheetInput.trim());
      if (isAppsScriptUrl(sheetInput.trim())) {
        setBridgeSuccessMsg(
          '¡Puente Google Apps Script vinculado con éxito! Las 8 pestañas oficiales (incluyendo Usuarios_Perfiles) ya se están sincronizando cada 2 segundos sin necesidad de OAuth.'
        );
      }
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
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-[#0F172A] font-serif-editorial">
                  Solución B Activa: Puente Directo Google Sheets (Sin OAuth 2.0)
                </h2>
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 text-[11px] font-bold">
                  Recomendado para Vercel
                </span>
              </div>
              <p className="text-xs text-[#64748B]">
                Sincroniza las 8 pestañas oficiales (incluyendo <strong>Usuarios_Perfiles</strong>) cada 2 segundos sin bloqueos de política OAuth 2.0 ni orígenes de JavaScript
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
          {/* Confirmación explícita antes de vincular/actualizar datos de Google Sheets */}
          {confirmOverwriteOpen && (
            <div className="p-4 rounded-xl bg-amber-50 border-2 border-amber-400 text-amber-950 space-y-3 shadow-md">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <div className="font-bold text-sm">
                    Confirmar vinculación y sincronización de datos en Google Sheets
                  </div>
                  <p>
                    ¿Confirmas que deseas vincular y sincronizar las 8 pestañas oficiales (
                    <code className="font-mono-code">PIAR_Estudiantes</code>,{' '}
                    <code className="font-mono-code">Adecuaciones_Asignaturas</code>,{' '}
                    <code className="font-mono-code">Seguimiento_Periodos</code>,{' '}
                    <code className="font-mono-code">Historial_Anual</code>,{' '}
                    <code className="font-mono-code">Banco_Ajustes</code>,{' '}
                    <code className="font-mono-code">Tabla_Cursos_Anios</code>,{' '}
                    <code className="font-mono-code">Tabla_Categorias_SIMAT</code> y{' '}
                    <code className="font-mono-code">Usuarios_Perfiles</code>) con el destino{' '}
                    <strong className="font-mono-code break-all">{sheetInput}</strong>?
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmOverwriteOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-white border border-amber-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={executeConfirmedLink}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold cursor-pointer"
                >
                  Confirmar y Sincronizar
                </button>
              </div>
            </div>
          )}

          {bridgeSuccessMsg && (
            <div className="p-4 rounded-xl bg-emerald-50 border-2 border-emerald-400 text-emerald-950 flex items-start gap-3 shadow-xs">
              <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <div className="font-bold text-sm">Conexión sin OAuth completada</div>
                <p>{bridgeSuccessMsg}</p>
              </div>
            </div>
          )}

          {/* Estado de Sincronización en Tiempo Real (Cada 2 Segundos) */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <h3 className="text-sm sm:text-base font-bold text-[#0F172A]">
                  Motor de Sincronización en Tiempo Real (Intervalo: 2.0 Segundos)
                </h3>
                {isUsingAppsScript && (
                  <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-900 text-xs font-bold">
                    ✓ Solución B Activa (Puente Apps Script Sin OAuth)
                  </span>
                )}
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

            {/* PANEL PRINCIPAL: SOLUCIÓN B — PUENTE GOOGLE APPS SCRIPT SIN OAUTH */}
            <div className="p-5 rounded-2xl bg-indigo-50/60 border-2 border-indigo-200 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-900">
                    <Code2 className="w-4 h-4 text-indigo-700" />
                    Solución B (Sin OAuth 2.0): Conectar Google Sheets mediante Apps Script en 3 Pasos
                  </span>
                  <p className="text-xs text-slate-700 mt-0.5">
                    Este método evita por completo el error <em>"No cumple con la política OAuth 2.0 / Registra el origen de JavaScript"</em> tanto aquí como en <strong>Vercel</strong>.
                  </p>
                </div>

                <a
                  href="https://sheets.new"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-emerald-800 border border-emerald-300 text-xs font-bold shadow-2xs cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  Abrir Nuevo Google Sheet (sheets.new)
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* 3 Pasos Guiados */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-white border border-indigo-100 space-y-2">
                  <div className="font-bold text-indigo-950 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-indigo-700 text-white text-[11px] flex items-center justify-center font-bold">
                      1
                    </span>
                    Copiar el Código del Puente
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    En tu archivo de Google Sheets, abre el menú superior <strong>Extensiones → Apps Script</strong>, borra lo que haya y pega este código:
                  </p>
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={handleCopyAppsScript}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold transition cursor-pointer w-full justify-center"
                    >
                      {copiedScript ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copiedScript ? '¡Código Copiado!' : 'Copiar Código Apps Script'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowScriptModal(!showScriptModal)}
                      className="w-full py-1 text-[11px] font-semibold text-indigo-800 hover:underline text-center cursor-pointer"
                    >
                      {showScriptModal ? 'Ocultar vista previa del código ▲' : 'Ver código completo a copiar ▼'}
                    </button>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-indigo-100 space-y-2">
                  <div className="font-bold text-indigo-950 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-indigo-700 text-white text-[11px] flex items-center justify-center font-bold">
                      2
                    </span>
                    Publicar como Aplicación Web
                  </div>
                  <ol className="list-decimal list-inside text-[11px] text-slate-600 space-y-1 leading-relaxed">
                    <li>En Apps Script pulsa <strong>Guardar (💾)</strong>.</li>
                    <li>Arriba a la derecha pulsa <strong>Implementar → Nueva implementación</strong>.</li>
                    <li>Elige tipo <strong>Aplicación web</strong>.</li>
                    <li>En <em>Ejecutar como</em> deja <strong>"Yo"</strong> y en <em>Quién tiene acceso</em> selecciona <strong>"Cualquier persona"</strong>.</li>
                    <li>Pulsa <strong>Implementar</strong>, autoriza tu cuenta y copia la URL terminada en <code className="font-mono-code font-bold text-indigo-900">/exec</code>.</li>
                  </ol>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-indigo-100 space-y-2 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="font-bold text-indigo-950 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-700 text-white text-[11px] flex items-center justify-center font-bold">
                        3
                      </span>
                      Pegar URL /exec y Vincular
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Al vincular la URL <code className="font-mono-code">/exec</code>, el sistema creará y poblará automáticamente las <strong>8 pestañas oficiales</strong> (incluida <code className="font-mono-code">Usuarios_Perfiles</code>).
                    </p>
                  </div>

                  {syncStatus.spreadsheetUrl && (
                    <a
                      href={syncStatus.spreadsheetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 hover:underline pt-1"
                    >
                      Abrir "{syncStatus.spreadsheetTitle}"
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>

              {/* Formulario de Vinculación Directa Solución B */}
              <form
                onSubmit={handleLinkExistingClick}
                className="p-4 rounded-xl bg-white border border-indigo-200 space-y-2.5 shadow-2xs"
              >
                <label className="block text-xs font-bold text-[#0F172A]">
                  Pega aquí la URL de la Aplicación Web de Google Apps Script (terminada en <code className="font-mono-code text-indigo-800">/exec</code>):
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={sheetInput}
                    onChange={(e) => setSheetInput(e.target.value)}
                    placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] bg-[#FBFBF9] text-xs font-mono-code text-[#0F172A] focus:outline-none focus:border-indigo-600"
                  />
                  <button
                    type="submit"
                    disabled={isBusy || !sheetInput.trim()}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold transition cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    <Link2 className="w-4 h-4" />
                    {isBusy
                      ? 'Sincronizando 8 Hojas...'
                      : 'Vincular Puente y Crear las 8 Hojas Ahora'}
                  </button>
                </div>
              </form>

              {/* Código Google Apps Script visible para copiar */}
              {showScriptModal && (
                <div className="pt-1 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                    <span>
                      Código completo para pegar en <strong>Extensiones → Apps Script</strong>:
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyAppsScript}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-indigo-700 text-white text-[11px] font-bold hover:bg-indigo-800 cursor-pointer"
                    >
                      {copiedScript ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {copiedScript ? '¡Copiado al portapapeles!' : 'Copiar todo el código'}
                    </button>
                  </div>
                  <pre className="p-3.5 rounded-xl bg-slate-900 text-emerald-300 font-mono-code text-[11px] overflow-x-auto max-h-60 border border-slate-700">
                    {EKIRAYA_APPS_SCRIPT_CODE}
                  </pre>
                </div>
              )}
            </div>

            {/* Exportación Local Excel / CSV y Alternativa OAuth 2.0 */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={onExportExcelWorkbook}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#CBD5E1] hover:bg-slate-50 text-xs font-semibold text-[#0F172A] cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-700" />
                  Descargar Libro Excel 8 Hojas (.xls)
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

              <button
                type="button"
                onClick={() => setShowOAuthAlternative(!showOAuthAlternative)}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 underline cursor-pointer"
              >
                {showOAuthAlternative
                  ? 'Ocultar configuración avanzada OAuth 2.0 (Google Cloud) ▲'
                  : '¿Prefieres usar OAuth 2.0 / Google Cloud Console (Solución A)? ▼'}
              </button>
            </div>

            {showOAuthAlternative && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div className="p-3.5 rounded-lg bg-white border border-slate-200 space-y-2.5">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-teal-700" />
                    Solución A: Registrar Origen JS en Google Cloud Console
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Copia esta URL de origen y agrégala en <strong>Google Cloud Console → APIs y servicios → Credenciales → Tu ID de cliente OAuth 2.0 → Orígenes de JavaScript autorizados</strong>:
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 px-2.5 py-1.5 rounded bg-slate-100 border border-slate-300 font-mono-code text-[11px] text-slate-900 select-all truncate">
                      {currentOrigin}
                    </code>
                    <button
                      type="button"
                      onClick={handleCopyOrigin}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-semibold shrink-0 cursor-pointer"
                    >
                      {copiedOrigin ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedOrigin ? 'Copiado' : 'Copiar Origen'}
                    </button>
                  </div>

                  <form onSubmit={handleSaveClientId} className="pt-1 space-y-1.5">
                    <label className="block text-[11px] font-semibold text-slate-700">
                      ID de Cliente OAuth 2.0 Personalizado:
                    </label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={clientIdInput}
                        onChange={(e) => setClientIdInput(e.target.value)}
                        placeholder="Ej. 123456789-abc...apps.googleusercontent.com"
                        className="flex-1 px-2.5 py-1.5 rounded border border-slate-300 text-[11px] font-mono-code bg-white"
                      />
                      <button
                        type="submit"
                        className="px-2.5 py-1.5 rounded bg-teal-800 hover:bg-teal-900 text-white text-[11px] font-semibold shrink-0 cursor-pointer"
                      >
                        Guardar ID
                      </button>
                    </div>
                    {clientIdSavedToast && (
                      <div className="text-[11px] text-emerald-700 font-semibold">
                        ✓ Client ID guardado.
                      </div>
                    )}
                  </form>
                </div>

                <div className="p-3.5 rounded-lg bg-white border border-slate-200 space-y-3">
                  <div className="font-bold text-slate-900">
                    Autenticación Directa OAuth 2.0 con Google
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Una vez registrado el origen en Google Cloud Console, puedes iniciar sesión con el botón oficial:
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onConnectGoogleOAuth(clientIdInput)}
                      className="gsi-material-button inline-flex items-center gap-2.5 px-4 py-2 rounded-lg bg-white hover:bg-slate-50 text-[#1F1F1F] border border-[#747775] text-xs font-semibold shadow-2xs transition cursor-pointer"
                    >
                      <span className="gsi-material-button-contents">
                        {syncStatus.isConnectedToGoogle
                          ? 'Cuenta Google Conectada (Renovar)'
                          : 'Sign in with Google'}
                      </span>
                    </button>
                    {syncStatus.isConnectedToGoogle && !isUsingAppsScript && (
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={handleCreateSheetClick}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition cursor-pointer disabled:opacity-50"
                      >
                        <PlusCircle className="w-4 h-4" />
                        {isBusy ? 'Creando Hoja...' : 'Crear Nueva Base en mi Google Sheets'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
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
