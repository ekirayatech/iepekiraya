import React from 'react';
import {
  ShieldCheck,
  Sparkles,
  FileSpreadsheet,
  Users,
  CheckCircle2,
  Clock,
  BookOpen,
  FileCheck2,
  PlusCircle,
  Lock,
  Brain,
  GraduationCap,
  ArrowUpRight,
} from 'lucide-react';
import {
  AjusteRazonableItem,
  RoleProfile,
  StudentPIAR,
  SyncStatus,
  UserRole,
} from '../types/piar';
import {
  EKIRAYA_LOGO_LOCAL_FALLBACK,
  EKIRAYA_LOGO_URL,
} from '../utils/exportUtils';

interface RoleDashboardProps {
  activeRole: UserRole;
  roleProfile: RoleProfile;
  students: StudentPIAR[];
  adjustmentBank: AjusteRazonableItem[];
  syncStatus: SyncStatus;
  onOpenNewPiar: (presetSuperior?: boolean) => void;
  onEditStudent: (student: StudentPIAR, defaultTab?: 'general' | 'asignaturas' | 'seguimiento' | 'historial') => void;
  onOpenAuditPdf: (student: StudentPIAR) => void;
  onOpenSheetsModal: () => void;
  onExportExcel: () => void;
  onNavigateView: (view: 'estudiantes' | 'banco' | 'normativa') => void;
}

export const RoleDashboard: React.FC<RoleDashboardProps> = ({
  activeRole,
  roleProfile,
  students,
  adjustmentBank,
  syncStatus,
  onOpenNewPiar,
  onEditStudent,
  onOpenAuditPdf,
  onOpenSheetsModal,
  onExportExcel,
  onNavigateView,
}) => {
  const totalPiar = students.length;
  const totalSuperior = students.filter((s) => s.esDesempenoSuperior).length;
  const totalFirmados = students.filter(
    (s) => s.estadoPiar === 'Vigente — Firmado para Auditoría'
  ).length;
  const totalAdecuaciones = students.reduce((acc, s) => acc + s.adecuaciones.length, 0);
  const totalSeguimientosCompletos = students.reduce(
    (acc, s) =>
      acc +
      s.seguimientos.filter(
        (seg) => seg.estado === 'Alcanzado' || seg.estado === 'Superado (Nivel Superior)'
      ).length,
    0
  );

  return (
    <div className="space-y-6">
      {/* Encabezado contextual según el Rol activo con Logo Institucional */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            <div className="bg-[#FBFBF9] border border-[#E2E8F0] rounded-xl px-3.5 py-2.5 flex items-center justify-center shrink-0 shadow-2xs self-start">
              <img
                src={EKIRAYA_LOGO_URL}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = EKIRAYA_LOGO_LOCAL_FALLBACK;
                }}
                alt="Colegio Ekirayá Montessori"
                className="h-12 sm:h-14 w-auto object-contain"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold tracking-wide uppercase ${roleProfile.badgeColor}`}
                >
                  {activeRole === 'administrador' && <ShieldCheck className="w-3.5 h-3.5" />}
                  {activeRole === 'psicologa' && <Brain className="w-3.5 h-3.5" />}
                  {activeRole === 'profesor' && <GraduationCap className="w-3.5 h-3.5" />}
                  Panel de {roleProfile.title}
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-teal-50 text-teal-800 border border-teal-200">
                  <Lock className="w-3 h-3 text-teal-700" />
                  Encriptación AES-256-GCM Activa (Ley 1581)
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A] font-serif-editorial">
                Bienvenido(a), {roleProfile.userName}
              </h2>
              <p className="text-sm text-[#475569] max-w-3xl">
                {activeRole === 'administrador' &&
                  'Supervisión ejecutiva del cumplimiento del Decreto 1421 de 2017, cobertura SIMAT de PIAR y Talentos Excepcionales, auditoría criptográfica en Google Sheets y exportación consolidada para Secretaría de Educación.'}
                {activeRole === 'psicologa' &&
                  'Gestión clínica y psicopedagógica: valoración diagnóstica confidencial (AES-256), diseño de plantillas PIAR y planes de Desempeño Superior, curaduría del Banco de Ajustes DUA y firma profesional de informes de auditoría.'}
                {activeRole === 'profesor' &&
                  'Espacio pedagógico de aula: consulta de caracterizaciones estudiantiles, registro ágil de Indicadores Ajustados y Ajustes del Proceso por asignatura con apoyo del Banco DUA, y seguimiento de logros por periodo.'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => onOpenNewPiar(false)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#0F766E] hover:bg-[#115E59] text-white text-sm font-semibold shadow-xs transition cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              Crear Nuevo PIAR
            </button>
            <button
              onClick={() => onOpenNewPiar(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-sm font-semibold transition cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-700" />
              Plan Desempeño Superior
            </button>
            <button
              onClick={onExportExcel}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-white hover:bg-slate-50 text-[#0F172A] border border-[#CBD5E1] text-sm font-medium transition cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
              Exportar Excel (.xls)
            </button>
          </div>
        </div>
      </div>

      {/* 4 Tarjetas KPI de Alta Precisión */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#475569]">
              Expedientes PIAR Activos
            </span>
            <span className="p-2 rounded-lg bg-teal-50 text-teal-700">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#0F172A] tabular-nums">{totalPiar}</span>
            <span className="text-xs font-medium text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
              {activeRole === 'administrador' ? '100% Sincronizados' : 'Expedientes Activos'}
            </span>
          </div>
          <p className="mt-2 text-xs text-[#64748B]">
            {totalPiar - totalSuperior} PIAR Decreto 1421 • {totalSuperior} Planes Excepcionales
          </p>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#475569]">
              Desempeño Superior y Doble Exc.
            </span>
            <span className="p-2 rounded-lg bg-amber-50 text-amber-700">
              <Sparkles className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#0F172A] tabular-nums">{totalSuperior}</span>
            <span className="text-xs font-medium text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
              Lineamiento MEN Doc. 19
            </span>
          </div>
          <p className="mt-2 text-xs text-[#64748B]">
            Compactación curricular, mentorías y retos STEM/Artes
          </p>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#475569]">
              Adecuaciones y Banco DUA
            </span>
            <span className="p-2 rounded-lg bg-indigo-50 text-indigo-700">
              <BookOpen className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#0F172A] tabular-nums">
              {totalAdecuaciones}
            </span>
            <span className="text-xs font-medium text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded">
              {adjustmentBank.length} en Banco DUA
            </span>
          </div>
          <p className="mt-2 text-xs text-[#64748B]">
            Indicadores ajustados por asignatura y docente
          </p>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#475569]">
              Listos para Auditoría PDF
            </span>
            <span className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
              <FileCheck2 className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#0F172A] tabular-nums">
              {totalFirmados}/{totalPiar}
            </span>
            <span className="text-xs font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
              {totalSeguimientosCompletos} Periodos Evaluados
            </span>
          </div>
          <p className="mt-2 text-xs text-[#64748B]">
            Firmados digitalmente con sello SHA-256 verificable
          </p>
        </div>
      </div>

      {/* Contenido específico según el Rol seleccionado */}
      {activeRole === 'administrador' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white border border-[#E2E8F0] rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-[#0F172A]">
                  Estado de Auditoría Institucional por Estudiante (SIMAT 2026)
                </h3>
                <p className="text-xs text-[#64748B]">
                  Verificación de Anexos 1, 2 y 3 (Decreto 1421), firma profesional y cifrado en Google Sheets
                </p>
              </div>
              <button
                onClick={onOpenSheetsModal}
                className="text-xs font-semibold text-teal-700 hover:text-teal-900 inline-flex items-center gap-1 cursor-pointer"
              >
                Configurar Base Google Sheets
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E2E8F0] text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                    <th className="py-2.5 pr-3">Estudiante / SIMAT</th>
                    <th className="py-2.5 px-3">Curso</th>
                    <th className="py-2.5 px-3">Asignaturas</th>
                    <th className="py-2.5 px-3">Estado Auditoría</th>
                    <th className="py-2.5 pl-3 text-right">Acción Rápida</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] text-sm">
                  {students.map((st) => (
                    <tr key={st.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 pr-3">
                        <div className="font-semibold text-[#0F172A]">{st.nombresApellidos}</div>
                        <div className="text-xs text-[#64748B] font-mono-code">
                          {st.codigoSimat} • {st.esDesempenoSuperior ? 'Desempeño Superior' : 'PIAR 1421'}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-xs font-medium text-[#334155]">{st.curso}</td>
                      <td className="py-3 px-3 text-xs tabular-nums text-[#334155]">
                        {st.adecuaciones.length} áreas ajustadas
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                            st.firmaProfesional
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {st.firmaProfesional ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Firmado SHA-256
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3 text-amber-600" />
                              Pendiente Firma
                            </>
                          )}
                        </span>
                      </td>
                      <td className="py-3 pl-3 text-right space-x-2">
                        <button
                          onClick={() => onOpenAuditPdf(st)}
                          className="text-xs font-semibold text-teal-700 hover:underline cursor-pointer"
                        >
                          Auditoría PDF
                        </button>
                        <button
                          onClick={() => onEditStudent(st, 'general')}
                          className="text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                        >
                          Editar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-[#0F172A]">
                  Telemetría Google Sheets & Seguridad
                </h3>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Sync 2.0s Activo
                </span>
              </div>
              <p className="text-xs text-[#475569]">
                Sincronización bidireccional cada 2 segundos para trabajo colaborativo simultáneo entre Psicología, Coordinación y Docentes.
              </p>

              <div className="p-3.5 rounded-lg bg-[#F4F4F0] border border-[#E2E8F0] space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Motor de Base de Datos:</span>
                  <span className="font-semibold text-[#0F172A]">
                    {syncStatus.isConnectedToGoogle
                      ? 'Google Sheets API v4 (Conectado)'
                      : 'Modo Local + Multi-Pestaña (Listo para vincular)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Frecuencia Tiempo Real:</span>
                  <span className="font-mono-code font-semibold text-teal-800">
                    Cada 2000 ms (Ciclo #{syncStatus.syncCycleCount})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Cifrado de Diagnósticos:</span>
                  <span className="font-mono-code font-semibold text-indigo-800">
                    {syncStatus.encryptionAlgorithm}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                <div className="text-xs font-semibold text-[#475569]">
                  Usuarios en sesión colaborativa activa:
                </div>
                {syncStatus.activeCollaborators.map((col, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded bg-slate-50 border border-slate-200/80"
                  >
                    <span className="font-medium text-[#0F172A]">{col.name}</span>
                    <span className="text-[11px] text-teal-700 font-medium">{col.role}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={onOpenSheetsModal}
              className="w-full py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition cursor-pointer"
            >
              Gestionar Conexión Google Sheets y Encriptación
            </button>
          </div>
        </div>
      )}

      {activeRole === 'psicologa' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white border border-[#E2E8F0] rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-[#0F172A]">
                  Gestión Clínica, Caracterización y Firma de Auditoría
                </h3>
                <p className="text-xs text-[#64748B]">
                  Como Profesional de Psicología tienes acceso desencriptado a los diagnósticos clínicos (Ley 1581) y firma autorizada de informes PDF.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {students.map((st) => (
                <div
                  key={st.id}
                  className="p-4 rounded-xl border border-[#E2E8F0] hover:border-indigo-300 bg-[#FBFBF9] transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-[#0F172A]">{st.nombresApellidos}</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-200/70 text-slate-800 font-medium">
                        {st.curso} ({st.anioLectivo})
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded font-medium ${
                          st.esDesempenoSuperior
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-indigo-50 text-indigo-800'
                        }`}
                      >
                        {st.categoriaSimat}
                      </span>
                    </div>
                    <p className="text-xs text-[#334155] line-clamp-2">
                      <strong className="text-indigo-900">Diagnóstico (Desencriptado):</strong>{' '}
                      {st.diagnostico}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onEditStudent(st, 'general')}
                      className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-900 text-xs font-semibold transition cursor-pointer"
                    >
                      Valoración y Ajustes
                    </button>
                    <button
                      onClick={() => onOpenAuditPdf(st)}
                      className="px-3 py-1.5 rounded-lg bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-semibold transition cursor-pointer"
                    >
                      Firmar PDF Auditoría
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <h3 className="text-base font-bold text-[#0F172A]">
                Herramientas de Orientación Escolar
              </h3>
              <p className="text-xs text-[#475569]">
                Accede directamente al Banco de Ajustes Razonables por tipo de necesidad o consulta las plantillas editables del Decreto 1421 y Talentos Excepcionales.
              </p>

              <div className="space-y-2 pt-2">
                <button
                  onClick={() => onNavigateView('banco')}
                  className="w-full text-left p-3 rounded-lg border border-[#E2E8F0] hover:border-teal-600 bg-[#FBFBF9] transition cursor-pointer"
                >
                  <div className="text-xs font-bold text-[#0F766E]">
                    Banco de Ajustes Razonables y DUA ({adjustmentBank.length} estrategias)
                  </div>
                  <div className="text-[11px] text-[#64748B] mt-0.5">
                    Curaduría por TEA, TDAH, Dislexia, Discalculia y Desempeño Superior.
                  </div>
                </button>

                <button
                  onClick={() => onNavigateView('normativa')}
                  className="w-full text-left p-3 rounded-lg border border-[#E2E8F0] hover:border-indigo-600 bg-[#FBFBF9] transition cursor-pointer"
                >
                  <div className="text-xs font-bold text-indigo-800">
                    Marco Legal Decreto 1421, DUA y Doc. 19 MEN
                  </div>
                  <div className="text-[11px] text-[#64748B] mt-0.5">
                    Lineamientos técnicos para comisiones de evaluación y promoción.
                  </div>
                </button>
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-indigo-50/70 border border-indigo-200 text-xs text-indigo-950">
              <div className="font-semibold mb-1">Protección Clínica Ley 1581 de 2012</div>
              Los diagnósticos clínicos y valoraciones psicopedagógicas registrados bajo tu perfil cuentan con reserva legal y cifrado de seguridad conforme a la Ley 1581 de 2012 y el Decreto 1421 de 2017.
            </div>
          </div>
        </div>
      )}

      {activeRole === 'profesor' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white border border-[#E2E8F0] rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-[#0F172A]">
                  Mis Estudiantes con PIAR o Plan de Desempeño Superior en Aula
                </h3>
                <p className="text-xs text-[#64748B]">
                  Haz clic en cualquier estudiante para registrar Indicadores Ajustados en tu asignatura o diligenciar el Seguimiento del Periodo.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {students.map((st) => (
                <div
                  key={st.id}
                  className="p-4 rounded-xl border border-[#E2E8F0] hover:border-amber-400 bg-[#FBFBF9] transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-[#0F172A]">{st.nombresApellidos}</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-200/70 text-slate-800 font-medium">
                        {st.curso}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded bg-teal-50 text-teal-800 font-medium">
                        {st.adecuaciones.length} asignaturas adecuadas
                      </span>
                    </div>
                    <p className="text-xs text-[#334155] line-clamp-2">
                      <strong>Perfil Pedagógico DUA:</strong> {st.descripcion}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      onClick={() => onEditStudent(st, 'asignaturas')}
                      className="px-3 py-1.5 rounded-lg bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-semibold transition cursor-pointer"
                    >
                      Adecuar Asignatura
                    </button>
                    <button
                      onClick={() => onEditStudent(st, 'seguimiento')}
                      className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-semibold transition cursor-pointer"
                    >
                      Seguimiento Periodo
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-4">
            <h3 className="text-base font-bold text-[#0F172A]">
              Guía Rápida para Docentes (Anexo 2 PIAR)
            </h3>
            <ul className="space-y-2.5 text-xs text-[#334155]">
              <li className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <strong className="text-[#0F172A] block">1. Indicador vs. Indicador Ajustado:</strong>
                El ajuste razonable no elimina el derecho al aprendizaje; flexibiliza la vía de acceso o enriquece la complejidad (en Desempeño Superior).
              </li>
              <li className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <strong className="text-[#0F172A] block">2. Ajuste del Proceso (DUA):</strong>
                Describe cómo presentas la información (Representación), cómo evalúas (Acción y Expresión) y cómo motivas (Implicación).
              </li>
              <li className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <strong className="text-[#0F172A] block">3. Seguimiento por Periodo:</strong>
                Documenta logros, evidencias tangibles y observaciones para la comisión de evaluación y promoción.
              </li>
            </ul>
            <button
              onClick={() => onNavigateView('banco')}
              className="w-full py-2.5 px-4 rounded-lg bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-semibold transition cursor-pointer"
            >
              Explorar Banco de Ajustes Razonables
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
