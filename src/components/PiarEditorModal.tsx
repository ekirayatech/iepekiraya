import React, { useState } from 'react';
import {
  X,
  Save,
  Sparkles,
  BookOpen,
  Calendar,
  History,
  UserCheck,
  Plus,
  Trash2,
  Lock,
  FileText,
  CheckCircle2,
  Wand2,
  ArrowRight,
} from 'lucide-react';
import {
  AdecuacionAsignatura,
  AjusteRazonableItem,
  CategoriaSimatCatalogItem,
  CursoAnioCatalogItem,
  DuaPrinciple,
  HistorialAnual,
  NeedCategory,
  RoleProfile,
  SeguimientoPeriodo,
  StudentPIAR,
} from '../types/piar';
import {
  ANIOS_LECTIVOS_COLOMBIA,
  ASIGNATURAS_COLOMBIA,
  CATEGORIAS_SIMAT,
  CURSOS_COLOMBIA,
  PLANTILLAS_PIAR,
  TABLA_CATEGORIAS_SIMAT_INICIAL,
  TABLA_CURSOS_ANIOS_INICIAL,
} from '../data/colombianLegislationAndSeed';
import { formatEncryptedPreview } from '../utils/crypto';

interface PiarEditorModalProps {
  student: StudentPIAR | null;
  presetSuperior?: boolean;
  initialTab?: 'general' | 'asignaturas' | 'seguimiento' | 'historial';
  roleProfile: RoleProfile;
  adjustmentBank: AjusteRazonableItem[];
  cursosCatalog?: CursoAnioCatalogItem[];
  categoriasCatalog?: CategoriaSimatCatalogItem[];
  onClose: () => void;
  onSave: (updatedStudent: StudentPIAR) => void;
}

const DUA_PRINCIPLES: DuaPrinciple[] = [
  'Principio I: Múltiples formas de Implicación y Motivación',
  'Principio II: Múltiples formas de Representación',
  'Principio III: Múltiples formas de Acción y Expresión',
  'Enriquecimiento Curricular — Desempeño Superior (MEN)',
  'Evaluación Diferenciada y Flexibilizada',
];

export const PiarEditorModal: React.FC<PiarEditorModalProps> = ({
  student,
  presetSuperior = false,
  initialTab = 'general',
  roleProfile,
  adjustmentBank,
  cursosCatalog = TABLA_CURSOS_ANIOS_INICIAL,
  categoriasCatalog = TABLA_CATEGORIAS_SIMAT_INICIAL,
  onClose,
  onSave,
}) => {
  const availableCourseNames = Array.from(
    new Set(
      [...cursosCatalog.map((c) => c.nombreCurso || c.curso), ...CURSOS_COLOMBIA].filter(Boolean)
    )
  );
  const availableSchoolYears = Array.from(
    new Set([...ANIOS_LECTIVOS_COLOMBIA, ...cursosCatalog.map((c) => c.anioLectivo)].filter(Boolean))
  );
  const availableSimatCategories = Array.from(
    new Set(
      [
        ...categoriasCatalog.map((cat) => cat.categoria || cat.categoriaSimat),
        ...CATEGORIAS_SIMAT,
      ].filter(Boolean)
    )
  );
  const [activeTab, setActiveTab] = useState<'general' | 'asignaturas' | 'seguimiento' | 'historial'>(
    initialTab
  );

  const defaultTemplate = presetSuperior ? PLANTILLAS_PIAR[1] : PLANTILLAS_PIAR[0];

  const [formData, setFormData] = useState<StudentPIAR>(() => {
    if (student) {
      return JSON.parse(JSON.stringify(student));
    }
    const newId = `piar-2026-${Math.floor(100 + Math.random() * 900)}`;
    return {
      id: newId,
      codigoSimat: `SIMAT-2026-${Math.floor(10000 + Math.random() * 89999)}`,
      nombresApellidos: '',
      documentoIdentidad: 'TI ',
      edad: 11,
      curso: '6° (Sexto - Básica Secundaria)',
      anioLectivo: '2026-2027',
      categoriaSimat: defaultTemplate.categoriaSugerida,
      esDesempenoSuperior: defaultTemplate.esDesempenoSuperior,
      diagnostico: defaultTemplate.diagnosticoGuia,
      descripcion: defaultTemplate.descripcionGuia,
      barrerasContexto: defaultTemplate.barrerasGuia,
      recomendacionesFamilia: defaultTemplate.recomendacionesFamiliaGuia,
      plantillaBaseId: defaultTemplate.id,
      adecuaciones: defaultTemplate.adecuacionesIniciales.map((ad, idx) => ({
        ...ad,
        id: `ad-new-${Date.now()}-${idx}`,
      })),
      seguimientos: [1, 2, 3, 4].map((p) => ({
        periodo: p as 1 | 2 | 3 | 4,
        logros: '',
        evidencias: '',
        observaciones: '',
        estado: 'Pendiente',
        responsable: roleProfile.userName,
        fechaActualizacion: new Date().toISOString().slice(0, 10),
      })),
      historial: [
        {
          id: `hist-${Date.now()}`,
          anioLectivo: '2025',
          curso: '5°A Primaria',
          resumenDiagnosticoYContexto:
            'Registro histórico del año lectivo anterior en expediente escolar.',
          logrosConsolidados: 'Aprobación del grado con acompañamientos pedagógicos DUA.',
          ajustesMasEfectivos: 'Apoyos visuales, tiempos flexibilizados y tutoría entre pares.',
          recomendacionesPromocion: 'Dar continuidad al PIAR / Plan de Talentos en el grado actual.',
          estadoPromocion: presetSuperior
            ? 'Promovido con Plan de Talentos Excepcionales'
            : 'Promovido con Continuidad PIAR',
          profesionalCargo: 'Dra. Valentina Morales Pineda',
        },
      ],
      estadoPiar: 'En Construcción Docente',
      updatedAt: new Date().toISOString(),
      lastModifiedBy: roleProfile.userName,
    };
  });

  const [showBankPickerForIndex, setShowBankPickerForIndex] = useState<number | null>(null);
  const [bankFilterQuery, setBankFilterQuery] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Aplicar plantilla editable
  const handleApplyTemplate = (templateId: string) => {
    const tpl = PLANTILLAS_PIAR.find((t) => t.id === templateId);
    if (!tpl) return;

    setFormData((prev) => ({
      ...prev,
      plantillaBaseId: tpl.id,
      categoriaSimat: tpl.categoriaSugerida,
      esDesempenoSuperior: tpl.esDesempenoSuperior,
      diagnostico: tpl.diagnosticoGuia,
      descripcion: tpl.descripcionGuia,
      barrerasContexto: tpl.barrerasGuia,
      recomendacionesFamilia: tpl.recomendacionesFamiliaGuia,
      adecuaciones: tpl.adecuacionesIniciales.map((ad, i) => ({
        ...ad,
        id: `ad-tpl-${Date.now()}-${i}`,
      })),
    }));
  };

  // Gestión de Adecuaciones por Asignatura
  const handleAddSubjectAdaptation = () => {
    const newAdaptation: AdecuacionAsignatura = {
      id: `ad-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      asignatura: 'Matemáticas',
      indicador: '',
      indicadorAjustado: '',
      ajusteProceso: '',
      nombreDocente: roleProfile.id === 'profesor' ? roleProfile.userName : 'Lic. Docente de Área',
      principioDua: formData.esDesempenoSuperior
        ? 'Enriquecimiento Curricular — Desempeño Superior (MEN)'
        : 'Principio II: Múltiples formas de Representación',
      barreraIdentificada: '',
    };
    setFormData((prev) => ({
      ...prev,
      adecuaciones: [...prev.adecuaciones, newAdaptation],
    }));
  };

  const handleUpdateAdaptation = (
    index: number,
    field: keyof AdecuacionAsignatura,
    value: string
  ) => {
    setFormData((prev) => {
      const copy = [...prev.adecuaciones];
      copy[index] = { ...copy[index], [field]: value };
      return { ...prev, adecuaciones: copy };
    });
  };

  const handleRemoveAdaptation = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      adecuaciones: prev.adecuaciones.filter((_, i) => i !== index),
    }));
  };

  const handleInsertFromBank = (targetIndex: number, bankItem: AjusteRazonableItem) => {
    setFormData((prev) => {
      const copy = [...prev.adecuaciones];
      copy[targetIndex] = {
        ...copy[targetIndex],
        asignatura: bankItem.asignaturaSugerida || copy[targetIndex].asignatura,
        indicador: copy[targetIndex].indicador || bankItem.indicadorBaseEjemplo,
        indicadorAjustado: bankItem.indicadorAjustadoSugerido,
        ajusteProceso: bankItem.ajusteProcesoDetallado,
        principioDua: bankItem.principioDua,
        barreraIdentificada: bankItem.barreraQueMitiga,
      };
      return { ...prev, adecuaciones: copy };
    });
    setShowBankPickerForIndex(null);
  };

  // Gestión de Seguimiento por Periodo
  const handleUpdateSeguimiento = (
    periodo: 1 | 2 | 3 | 4,
    field: keyof SeguimientoPeriodo,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      seguimientos: prev.seguimientos.map((seg) =>
        seg.periodo === periodo
          ? {
              ...seg,
              [field]: value,
              fechaActualizacion: new Date().toISOString().slice(0, 10),
            }
          : seg
      ),
    }));
  };

  // Gestión de Historial Anual Longitudinal
  const handleAddHistorialYear = () => {
    const newHist: HistorialAnual = {
      id: `hist-${Date.now()}`,
      anioLectivo: String(Number(formData.anioLectivo || 2026) - 1),
      curso: 'Grado Anterior',
      resumenDiagnosticoYContexto: '',
      logrosConsolidados: '',
      ajustesMasEfectivos: '',
      recomendacionesPromocion: '',
      estadoPromocion: formData.esDesempenoSuperior
        ? 'Promovido con Plan de Talentos Excepcionales'
        : 'Promovido con Continuidad PIAR',
      profesionalCargo: roleProfile.userName,
    };
    setFormData((prev) => ({
      ...prev,
      historial: [...prev.historial, newHist],
    }));
  };

  const handlePromoteNextSchoolYear = () => {
    const currentYear = Number(formData.anioLectivo) || 2026;
    const nextYear = String(currentYear + 1);
    const archivedCurrentYear: HistorialAnual = {
      id: `hist-prom-${Date.now()}`,
      anioLectivo: formData.anioLectivo,
      curso: formData.curso,
      resumenDiagnosticoYContexto: `Cierre anual ${formData.anioLectivo} (${formData.categoriaSimat}).`,
      logrosConsolidados:
        formData.seguimientos
          .filter((s) => s.logros)
          .map((s) => `P${s.periodo}: ${s.logros}`)
          .join(' | ') || 'Indicadores ajustados superados satisfactoriamente.',
      ajustesMasEfectivos:
        formData.adecuaciones.map((a) => `${a.asignatura}: ${a.ajusteProceso}`).join(' | ') ||
        'Estrategias DUA aplicadas en todas las áreas.',
      recomendacionesPromocion: `Continuar con apoyos en el año lectivo ${nextYear}.`,
      estadoPromocion: formData.esDesempenoSuperior
        ? 'Promovido con Plan de Talentos Excepcionales'
        : 'Promovido con Continuidad PIAR',
      profesionalCargo: roleProfile.userName,
    };

    setFormData((prev) => ({
      ...prev,
      anioLectivo: nextYear,
      historial: [...prev.historial, archivedCurrentYear],
    }));
  };

  const handleUpdateHistorial = (
    index: number,
    field: keyof HistorialAnual,
    value: string
  ) => {
    setFormData((prev) => {
      const copy = [...prev.historial];
      copy[index] = { ...copy[index], [field]: value };
      return { ...prev, historial: copy };
    });
  };

  const handleRemoveHistorial = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      historial: prev.historial.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombresApellidos.trim()) {
      setValidationError('Por favor ingresa los nombres y apellidos completos del estudiante.');
      setActiveTab('general');
      return;
    }
    const finalRecord: StudentPIAR = {
      ...formData,
      diagnosticoCifrado: formatEncryptedPreview(formData.diagnostico, formData.id),
      updatedAt: new Date().toISOString(),
      lastModifiedBy: roleProfile.userName,
    };
    onSave(finalRecord);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-[#FBFBF9] border border-[#CBD5E1] rounded-2xl w-full max-w-6xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Cabecera fija */}
        <div className="bg-white border-b border-[#E2E8F0] px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono-code font-semibold px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
                {formData.codigoSimat}
              </span>
              <span
                className={`text-xs font-semibold px-2.5 py-0.5 rounded ${
                  formData.esDesempenoSuperior
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : 'bg-indigo-50 text-indigo-900 border border-indigo-200'
                }`}
              >
                {formData.esDesempenoSuperior
                  ? 'Plan de Enriquecimiento — Desempeño Superior / Talento Excepcional'
                  : 'PIAR — Decreto 1421 de 2017 (Ajustes Razonables y DUA)'}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-[#0F172A] font-serif-editorial mt-1">
              {student
                ? `Expediente Individual: ${formData.nombresApellidos || 'Estudiante'}`
                : 'Crear Nuevo Expediente PIAR / Plan de Desempeño Superior'}
            </h2>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
              title="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Barra de Navegación por Pestañas del Expediente */}
        <div className="bg-[#F4F4F0] border-b border-[#E2E8F0] px-5 flex overflow-x-auto gap-1 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === 'general'
                ? 'border-[#0F766E] text-[#0F766E] bg-white'
                : 'border-transparent text-[#475569] hover:text-[#0F172A]'
            }`}
          >
            <FileText className="w-4 h-4" />
            1. Datos del Estudiante, Plantilla y Diagnóstico
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('asignaturas')}
            className={`px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === 'asignaturas'
                ? 'border-[#0F766E] text-[#0F766E] bg-white'
                : 'border-transparent text-[#475569] hover:text-[#0F172A]'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            2. Adecuaciones por Asignatura ({formData.adecuaciones.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('seguimiento')}
            className={`px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === 'seguimiento'
                ? 'border-[#0F766E] text-[#0F766E] bg-white'
                : 'border-transparent text-[#475569] hover:text-[#0F172A]'
            }`}
          >
            <Calendar className="w-4 h-4" />
            3. Seguimiento por Periodo (I - IV)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('historial')}
            className={`px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === 'historial'
                ? 'border-[#0F766E] text-[#0F766E] bg-white'
                : 'border-transparent text-[#475569] hover:text-[#0F172A]'
            }`}
          >
            <History className="w-4 h-4" />
            4. Historial Año tras Año ({formData.historial.length})
          </button>
        </div>

        {/* Cuerpo del Formulario */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {validationError && (
            <div className="p-3.5 rounded-lg bg-red-50 border border-red-300 text-red-900 text-xs font-medium flex items-center justify-between">
              <span>{validationError}</span>
              <button
                type="button"
                onClick={() => setValidationError(null)}
                className="text-red-700 font-bold"
              >
                ✕
              </button>
            </div>
          )}

          {/* TAB 1: DATOS ESTUDIANTE, PLANTILLA EDITABLE, DIAGNÓSTICO Y DESCRIPCIÓN */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              {/* Selector de Plantillas Editables */}
              <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
                      <Wand2 className="w-4 h-4 text-[#0F766E]" />
                      Plantillas Editables Oficiales (Decreto 1421, DUA y Desempeño Superior)
                    </h3>
                    <p className="text-xs text-[#64748B]">
                      Selecciona una plantilla base para pre-cargar criterios diagnósticos, caracterización y adecuaciones iniciales editables.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {PLANTILLAS_PIAR.map((tpl) => {
                    const isSelected = formData.plantillaBaseId === tpl.id;
                    return (
                      <div
                        key={tpl.id}
                        onClick={() => handleApplyTemplate(tpl.id)}
                        className={`p-3.5 rounded-xl border text-left transition cursor-pointer ${
                          isSelected
                            ? 'border-[#0F766E] bg-teal-50/50 ring-1 ring-[#0F766E]'
                            : 'border-[#E2E8F0] hover:border-slate-300 bg-[#FBFBF9]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs font-bold text-[#0F172A]">{tpl.nombre}</span>
                          {tpl.esDesempenoSuperior ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-900 shrink-0">
                              Talento / Superior
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-teal-100 text-teal-900 shrink-0">
                              PIAR 1421
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#475569] mt-1 line-clamp-2">
                          {tpl.descripcionPlantilla}
                        </p>
                        <div className="mt-2 text-[10px] font-mono-code text-teal-800">
                          {tpl.normativaReferencia}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Campos obligatorios del Estudiante */}
              <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 sm:p-5 space-y-4">
                <h3 className="text-sm font-bold text-[#0F172A] border-b border-[#E2E8F0] pb-2">
                  Identificación del Estudiante y Ubicación Escolar (Anexo 1 MEN)
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#334155] mb-1">
                      Nombres y Apellidos Completos *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Valeria Alejandra Gómez Restrepo"
                      value={formData.nombresApellidos}
                      onChange={(e) =>
                        setFormData({ ...formData, nombresApellidos: e.target.value })
                      }
                      className="w-full px-3.5 py-2 rounded-lg border border-[#CBD5E1] bg-white text-sm text-[#0F172A] focus:outline-none focus:border-[#0F766E]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#334155] mb-1">
                      Curso / Grado (Tabla_Cursos_Anios) *
                    </label>
                    <select
                      value={formData.curso}
                      onChange={(e) => setFormData({ ...formData, curso: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] bg-white text-sm text-[#0F172A] focus:outline-none focus:border-[#0F766E]"
                    >
                      {availableCourseNames.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#334155] mb-1">
                      Año Lectivo (2026-2027, etc.) *
                    </label>
                    <select
                      value={formData.anioLectivo}
                      onChange={(e) => setFormData({ ...formData, anioLectivo: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] bg-white text-sm text-[#0F172A] focus:outline-none focus:border-[#0F766E]"
                    >
                      {availableSchoolYears.map((yr) => (
                        <option key={yr} value={yr}>
                          {yr}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#334155] mb-1">
                      Documento de Identidad
                    </label>
                    <input
                      type="text"
                      value={formData.documentoIdentidad}
                      onChange={(e) =>
                        setFormData({ ...formData, documentoIdentidad: e.target.value })
                      }
                      className="w-full px-3.5 py-2 rounded-lg border border-[#CBD5E1] bg-white text-sm text-[#0F172A]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#334155] mb-1">
                      Edad (Años)
                    </label>
                    <input
                      type="number"
                      min={3}
                      max={22}
                      value={formData.edad}
                      onChange={(e) =>
                        setFormData({ ...formData, edad: Number(e.target.value) || 10 })
                      }
                      className="w-full px-3.5 py-2 rounded-lg border border-[#CBD5E1] bg-white text-sm text-[#0F172A]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#334155] mb-1">
                      Categoría SIMAT / Necesidad o Desempeño Superior (Tabla_Categorias_SIMAT) *
                    </label>
                    <select
                      value={formData.categoriaSimat}
                      onChange={(e) => {
                        const cat = e.target.value as NeedCategory;
                        const isSup =
                          cat.includes('Desempeño Superior') ||
                          cat.includes('Doble Excepcionalidad') ||
                          cat.includes('Talento');
                        setFormData({
                          ...formData,
                          categoriaSimat: cat,
                          esDesempenoSuperior: isSup,
                        });
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] bg-white text-sm text-[#0F172A] focus:outline-none focus:border-[#0F766E]"
                    >
                      {availableSimatCategories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Diagnóstico (con Encriptación AES-256-GCM) y Descripción Pedagógica */}
              <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 sm:p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E2E8F0] pb-2">
                  <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
                    <Lock className="w-4 h-4 text-teal-700" />
                    Diagnóstico / Caracterización Clínica y Descripción Pedagógica DUA
                  </h3>
                  <span className="text-[11px] font-mono-code px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
                    Cifrado en Google Sheets: AES-256-GCM
                  </span>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-[#334155]">
                      Diagnóstico o Concepto de Excepcionalidad (Protegido por Ley 1581 de 2012) *
                    </label>
                    {!roleProfile.canEditClinicalDiagnosis && (
                      <span className="text-[11px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded font-medium">
                        Solo lectura para Rol Profesor (Editable por Psicología y Admin)
                      </span>
                    )}
                  </div>
                  <textarea
                    rows={3}
                    readOnly={!roleProfile.canEditClinicalDiagnosis}
                    value={formData.diagnostico}
                    onChange={(e) => setFormData({ ...formData, diagnostico: e.target.value })}
                    placeholder="Ingresa el diagnóstico clínico (CIE-11/DSM-5) o la valoración psicopedagógica de Capacidades/Talentos Excepcionales..."
                    className={`w-full p-3 rounded-lg border text-sm ${
                      roleProfile.canEditClinicalDiagnosis
                        ? 'border-[#CBD5E1] bg-white text-[#0F172A]'
                        : 'border-slate-200 bg-slate-100 text-slate-600 cursor-not-allowed'
                    }`}
                  />
                  <div className="mt-1.5 text-[11px] font-mono-code text-slate-500 truncate">
                    Vista previa celda cifrada en Google Sheets:{' '}
                    <span className="text-teal-800">
                      {formatEncryptedPreview(formData.diagnostico, formData.id)}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#334155] mb-1">
                    Descripción General del Estudiante (Fortalezas, Intereses, Estilo de Aprendizaje DUA) *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    placeholder="Describe las habilidades del estudiante, sus intereses motivacionales, cómo procesa mejor la información y sus apoyos requeridos..."
                    className="w-full p-3 rounded-lg border border-[#CBD5E1] bg-white text-sm text-[#0F172A]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#334155] mb-1">
                      Barreras Identificadas en el Contexto Escolar
                    </label>
                    <textarea
                      rows={2}
                      value={formData.barrerasContexto}
                      onChange={(e) =>
                        setFormData({ ...formData, barrerasContexto: e.target.value })
                      }
                      placeholder="Barreras metodológicas, actitudinales, sensoriales o evaluativas..."
                      className="w-full p-3 rounded-lg border border-[#CBD5E1] bg-white text-sm text-[#0F172A]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#334155] mb-1">
                      Acuerdos y Recomendaciones para la Familia (Anexo 3 Acta de Acuerdo)
                    </label>
                    <textarea
                      rows={2}
                      value={formData.recomendacionesFamilia}
                      onChange={(e) =>
                        setFormData({ ...formData, recomendacionesFamilia: e.target.value })
                      }
                      placeholder="Estrategias de acompañamiento en el hogar y corresponsabilidad familiar..."
                      className="w-full p-3 rounded-lg border border-[#CBD5E1] bg-white text-sm text-[#0F172A]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FORMULARIO DE ADECUACIONES POR ASIGNATURA */}
          {activeTab === 'asignaturas' && (
            <div className="space-y-4">
              <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-[#0F172A]">
                    Formulario de Adecuaciones por Asignatura (Anexo 2 Decreto 1421 & DUA)
                  </h3>
                  <p className="text-xs text-[#64748B]">
                    Registra para cada área: Nombre de la asignatura, Indicador original, Indicador ajustado, Ajuste del proceso y Nombre del docente.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddSubjectAdaptation}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0F766E] hover:bg-[#115E59] text-white text-xs sm:text-sm font-semibold transition shrink-0 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Añadir Asignatura
                </button>
              </div>

              {formData.adecuaciones.map((ad, index) => (
                <div
                  key={ad.id}
                  className="bg-white border border-[#CBD5E1] rounded-xl p-4 sm:p-5 space-y-4 shadow-2xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E2E8F0] pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-teal-800 text-white text-xs font-bold flex items-center justify-center">
                        {index + 1}
                      </span>
                      <span className="text-sm font-bold text-[#0F172A]">
                        Adecuación Curricular — {ad.asignatura}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setShowBankPickerForIndex(
                            showBankPickerForIndex === index ? null : index
                          )
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 text-xs font-semibold transition cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-indigo-700" />
                        Traer del Banco de Ajustes Razonables
                      </button>

                      {formData.adecuaciones.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveAdaptation(index)}
                          className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition cursor-pointer"
                          title="Eliminar asignatura"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Selector rápido del Banco de Ajustes Razonables */}
                  {showBankPickerForIndex === index && (
                    <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="text-xs font-bold text-indigo-950">
                          Selecciona un Ajuste Razonable / Estrategia DUA para autocompletar esta asignatura:
                        </div>
                        <input
                          type="text"
                          value={bankFilterQuery}
                          onChange={(e) => setBankFilterQuery(e.target.value)}
                          placeholder="Filtrar por necesidad, asignatura o palabra clave..."
                          className="px-3 py-1 rounded-md border border-indigo-300 bg-white text-xs text-slate-800 w-full sm:w-64"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
                        {adjustmentBank
                          .filter(
                            (b) =>
                              !bankFilterQuery ||
                              b.titulo.toLowerCase().includes(bankFilterQuery.toLowerCase()) ||
                              b.categoriaNecesidad
                                .toLowerCase()
                                .includes(bankFilterQuery.toLowerCase()) ||
                              b.asignaturaSugerida
                                .toLowerCase()
                                .includes(bankFilterQuery.toLowerCase())
                          )
                          .map((item) => (
                            <div
                              key={item.id}
                              onClick={() => handleInsertFromBank(index, item)}
                              className="p-3 rounded-lg bg-white border border-indigo-200 hover:border-indigo-500 cursor-pointer transition"
                            >
                              <div className="text-xs font-bold text-[#0F172A]">{item.titulo}</div>
                              <div className="text-[11px] text-indigo-800 font-medium mt-0.5">
                                {item.categoriaNecesidad} • {item.asignaturaSugerida}
                              </div>
                              <p className="text-[11px] text-[#475569] mt-1 line-clamp-2">
                                {item.ajusteProcesoDetallado}
                              </p>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#334155] mb-1">
                        Nombre de la Asignatura *
                      </label>
                      <select
                        value={ad.asignatura}
                        onChange={(e) =>
                          handleUpdateAdaptation(index, 'asignatura', e.target.value)
                        }
                        className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] bg-white text-sm text-[#0F172A]"
                      >
                        {ASIGNATURAS_COLOMBIA.map((asig) => (
                          <option key={asig} value={asig}>
                            {asig}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#334155] mb-1">
                        Nombre del Docente Responsable *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ej. Lic. Carlos Andrés Restrepo"
                        value={ad.nombreDocente}
                        onChange={(e) =>
                          handleUpdateAdaptation(index, 'nombreDocente', e.target.value)
                        }
                        className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] bg-white text-sm text-[#0F172A]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#334155] mb-1">
                        Principio DUA / Enfoque MEN
                      </label>
                      <select
                        value={ad.principioDua}
                        onChange={(e) =>
                          handleUpdateAdaptation(index, 'principioDua', e.target.value)
                        }
                        className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] bg-white text-sm text-[#0F172A]"
                      >
                        {DUA_PRINCIPLES.map((pr) => (
                          <option key={pr} value={pr}>
                            {pr}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#334155] mb-1">
                        Indicador (DBA / Estándar Original del Grado) *
                      </label>
                      <textarea
                        rows={3}
                        required
                        placeholder="Escribe el indicador de desempeño estándar programado para el grado..."
                        value={ad.indicador}
                        onChange={(e) =>
                          handleUpdateAdaptation(index, 'indicador', e.target.value)
                        }
                        className="w-full p-3 rounded-lg border border-[#CBD5E1] bg-white text-sm text-[#0F172A]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-teal-900 mb-1">
                        Indicador Ajustado (Flexibilizado PIAR o Enriquecido Superior) *
                      </label>
                      <textarea
                        rows={3}
                        required
                        placeholder="Escribe el indicador ajustado o enriquecido acorde a las capacidades del estudiante..."
                        value={ad.indicadorAjustado}
                        onChange={(e) =>
                          handleUpdateAdaptation(index, 'indicadorAjustado', e.target.value)
                        }
                        className="w-full p-3 rounded-lg border border-teal-400 bg-teal-50/30 text-sm text-[#0F172A]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#334155] mb-1">
                      Ajuste del Proceso (Estrategias Didácticas, Metodológicas y Evaluativas DUA) *
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Detalla el ajuste metodológico, material concreto, tiempos, apoyo visual, compactación curricular o forma de evaluación..."
                      value={ad.ajusteProceso}
                      onChange={(e) =>
                        handleUpdateAdaptation(index, 'ajusteProceso', e.target.value)
                      }
                      className="w-full p-3 rounded-lg border border-[#CBD5E1] bg-white text-sm text-[#0F172A]"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: SEGUIMIENTO POR PERIODO (I, II, III, IV) */}
          {activeTab === 'seguimiento' && (
            <div className="space-y-4">
              <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 sm:p-5">
                <h3 className="text-base font-bold text-[#0F172A]">
                  Seguimiento Sistemático por Periodo Académico (Logros, Evidencias y Observaciones)
                </h3>
                <p className="text-xs text-[#64748B]">
                  Documentación exigida para las Comisiones de Evaluación y Promoción (Decreto 1290 de 2009 y Decreto 1421 de 2017).
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formData.seguimientos.map((seg) => (
                  <div
                    key={seg.periodo}
                    className="bg-white border border-[#CBD5E1] rounded-xl p-4 sm:p-5 space-y-3"
                  >
                    <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2.5">
                      <span className="text-sm font-bold text-[#0F172A]">
                        Periodo Académico {seg.periodo}
                      </span>
                      <select
                        value={seg.estado}
                        onChange={(e) =>
                          handleUpdateSeguimiento(seg.periodo, 'estado', e.target.value)
                        }
                        className="px-2.5 py-1 rounded-md border border-[#CBD5E1] text-xs font-semibold bg-[#FBFBF9]"
                      >
                        <option value="Pendiente">Pendiente</option>
                        <option value="En Proceso">En Proceso</option>
                        <option value="Alcanzado">Alcanzado</option>
                        <option value="Superado (Nivel Superior)">
                          Superado (Nivel Superior)
                        </option>
                        <option value="Requiere Reformulación">Requiere Reformulación</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#334155] mb-1">
                        Logros Alcanzados en el Periodo {seg.periodo}
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Describe los avances frente a los indicadores ajustados..."
                        value={seg.logros}
                        onChange={(e) =>
                          handleUpdateSeguimiento(seg.periodo, 'logros', e.target.value)
                        }
                        className="w-full p-2.5 rounded-lg border border-[#CBD5E1] text-xs sm:text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#334155] mb-1">
                        Evidencias Pedagógicas y Soportes
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Portafolios, rúbricas adaptadas, proyectos, actas con acudientes..."
                        value={seg.evidencias}
                        onChange={(e) =>
                          handleUpdateSeguimiento(seg.periodo, 'evidencias', e.target.value)
                        }
                        className="w-full p-2.5 rounded-lg border border-[#CBD5E1] text-xs sm:text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#334155] mb-1">
                        Observaciones y Ajustes para el Siguiente Periodo
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Recomendaciones cualitativas del docente o psicorientación..."
                        value={seg.observaciones}
                        onChange={(e) =>
                          handleUpdateSeguimiento(seg.periodo, 'observaciones', e.target.value)
                        }
                        className="w-full p-2.5 rounded-lg border border-[#CBD5E1] text-xs sm:text-sm"
                      />
                    </div>

                    <div className="pt-1 flex items-center justify-between text-[11px] text-[#64748B]">
                      <span>Responsable: {seg.responsable}</span>
                      <span className="font-mono-code">Fecha: {seg.fechaActualizacion}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: HISTORIAL DEL ESTUDIANTE AÑO TRAS AÑO */}
          {activeTab === 'historial' && (
            <div className="space-y-4">
              <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-[#0F172A]">
                    Historial Longitudinal del Estudiante (Año tras Año)
                  </h3>
                  <p className="text-xs text-[#64748B]">
                    Trazabilidad multianual de la historia escolar inclusiva para garantizar continuidad pedagógica entre grados.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleAddHistorialYear}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-[#CBD5E1] hover:bg-slate-50 text-xs font-semibold text-[#0F172A] cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Agregar Año Anterior
                  </button>
                  <button
                    type="button"
                    onClick={handlePromoteNextSchoolYear}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-teal-800 hover:bg-teal-900 text-white text-xs font-semibold cursor-pointer"
                  >
                    Promover al Siguiente Año Lectivo
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {formData.historial.map((h, idx) => (
                  <div
                    key={h.id}
                    className="bg-white border border-[#CBD5E1] rounded-xl p-4 sm:p-5 space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E2E8F0] pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded bg-teal-800 text-white text-xs font-mono-code font-bold">
                          Año {h.anioLectivo}
                        </span>
                        <span className="text-sm font-bold text-[#0F172A]">
                          Curso: {h.curso}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          value={h.estadoPromocion}
                          onChange={(e) =>
                            handleUpdateHistorial(idx, 'estadoPromocion', e.target.value)
                          }
                          className="px-2.5 py-1 rounded border border-[#CBD5E1] text-xs font-semibold bg-[#FBFBF9]"
                        >
                          <option value="Promovido con Continuidad PIAR">
                            Promovido con Continuidad PIAR
                          </option>
                          <option value="Promovido con Plan de Talentos Excepcionales">
                            Promovido con Plan de Talentos Excepcionales
                          </option>
                          <option value="Promovido con Autonomía DUA">
                            Promovido con Autonomía DUA
                          </option>
                          <option value="Año Lectivo en Curso">Año Lectivo en Curso</option>
                        </select>
                        {formData.historial.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveHistorial(idx)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-[#334155] mb-1">
                          Año Lectivo
                        </label>
                        <input
                          type="text"
                          value={h.anioLectivo}
                          onChange={(e) =>
                            handleUpdateHistorial(idx, 'anioLectivo', e.target.value)
                          }
                          className="w-full px-3 py-1.5 rounded border border-[#CBD5E1] text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#334155] mb-1">
                          Curso / Grado Cursado
                        </label>
                        <input
                          type="text"
                          value={h.curso}
                          onChange={(e) => handleUpdateHistorial(idx, 'curso', e.target.value)}
                          className="w-full px-3 py-1.5 rounded border border-[#CBD5E1] text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#334155] mb-1">
                          Profesional a Cargo
                        </label>
                        <input
                          type="text"
                          value={h.profesionalCargo}
                          onChange={(e) =>
                            handleUpdateHistorial(idx, 'profesionalCargo', e.target.value)
                          }
                          className="w-full px-3 py-1.5 rounded border border-[#CBD5E1] text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-[#334155] mb-1">
                          Contexto y Valoración del Año
                        </label>
                        <textarea
                          rows={2}
                          value={h.resumenDiagnosticoYContexto}
                          onChange={(e) =>
                            handleUpdateHistorial(
                              idx,
                              'resumenDiagnosticoYContexto',
                              e.target.value
                            )
                          }
                          className="w-full p-2 rounded border border-[#CBD5E1] text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#334155] mb-1">
                          Logros Consolidados
                        </label>
                        <textarea
                          rows={2}
                          value={h.logrosConsolidados}
                          onChange={(e) =>
                            handleUpdateHistorial(idx, 'logrosConsolidados', e.target.value)
                          }
                          className="w-full p-2 rounded border border-[#CBD5E1] text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#334155] mb-1">
                          Ajustes Más Efectivos y Recomendación
                        </label>
                        <textarea
                          rows={2}
                          value={h.ajustesMasEfectivos}
                          onChange={(e) =>
                            handleUpdateHistorial(idx, 'ajustesMasEfectivos', e.target.value)
                          }
                          className="w-full p-2 rounded border border-[#CBD5E1] text-xs"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pie de Modal con Guardado y Sincronización en Tiempo Real */}
          <div className="bg-white border-t border-[#E2E8F0] pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-[#475569]">
              <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0" />
              <span>
                Al guardar, se cifra el diagnóstico (AES-256) y se propaga en el ciclo de 2 segundos a Google Sheets.
              </span>
            </div>

            <div className="flex items-center gap-2.5 self-end sm:self-center">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-[#CBD5E1] bg-white hover:bg-slate-50 text-xs sm:text-sm font-semibold text-[#334155] cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#0F766E] hover:bg-[#115E59] text-white text-xs sm:text-sm font-semibold shadow-sm transition cursor-pointer"
              >
                <Save className="w-4 h-4" />
                Guardar Expediente PIAR y Sincronizar
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
