import React, { useState } from 'react';
import {
  Search,
  Plus,
  Sparkles,
  BookOpen,
  CheckCircle2,
  UserPlus,
  Filter,
  Trash2,
} from 'lucide-react';
import {
  AjusteRazonableItem,
  DuaPrinciple,
  NeedCategory,
  StudentPIAR,
} from '../types/piar';
import {
  ASIGNATURAS_COLOMBIA,
  CATEGORIAS_SIMAT,
} from '../data/colombianLegislationAndSeed';

interface AdjustmentBankViewProps {
  adjustmentBank: AjusteRazonableItem[];
  students: StudentPIAR[];
  onAddAdjustmentToBank: (newItem: AjusteRazonableItem) => void;
  onDeleteAdjustmentFromBank: (id: string) => void;
  onApplyAdjustmentToStudent: (studentId: string, item: AjusteRazonableItem) => void;
}

const DUA_PRINCIPLES: DuaPrinciple[] = [
  'Principio I: Múltiples formas de Implicación y Motivación',
  'Principio II: Múltiples formas de Representación',
  'Principio III: Múltiples formas de Acción y Expresión',
  'Enriquecimiento Curricular — Desempeño Superior (MEN)',
  'Evaluación Diferenciada y Flexibilizada',
];

export const AdjustmentBankView: React.FC<AdjustmentBankViewProps> = ({
  adjustmentBank,
  students,
  onAddAdjustmentToBank,
  onDeleteAdjustmentFromBank,
  onApplyAdjustmentToStudent,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('TODAS');
  const [selectedPrinciple, setSelectedPrinciple] = useState<string>('TODOS');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [applyingItemId, setApplyingItemId] = useState<string | null>(null);
  const [targetStudentId, setTargetStudentId] = useState<string>(students[0]?.id || '');
  const [appliedToast, setAppliedToast] = useState<string | null>(null);

  const [newItem, setNewItem] = useState<Omit<AjusteRazonableItem, 'id'>>({
    titulo: '',
    categoriaNecesidad: 'TEA (Trastorno del Espectro Autista)',
    principioDua: 'Principio II: Múltiples formas de Representación',
    asignaturaSugerida: 'Matemáticas',
    barreraQueMitiga: '',
    indicadorBaseEjemplo: '',
    indicadorAjustadoSugerido: '',
    ajusteProcesoDetallado: '',
    fundamentoNormativo: 'Decreto 1421 de 2017 + Diseño Universal del Aprendizaje (DUA)',
  });

  const filteredItems = adjustmentBank.filter((item) => {
    const matchesSearch =
      !searchQuery ||
      item.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.ajusteProcesoDetallado.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.asignaturaSugerida.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCat =
      selectedCategory === 'TODAS' || item.categoriaNecesidad === selectedCategory;

    const matchesPrinc =
      selectedPrinciple === 'TODOS' || item.principioDua === selectedPrinciple;

    return matchesSearch && matchesCat && matchesPrinc;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.titulo.trim() || !newItem.ajusteProcesoDetallado.trim()) return;

    onAddAdjustmentToBank({
      ...newItem,
      id: `aj-${Date.now()}`,
    });
    setShowCreateForm(false);
    setNewItem({
      titulo: '',
      categoriaNecesidad: 'TEA (Trastorno del Espectro Autista)',
      principioDua: 'Principio II: Múltiples formas de Representación',
      asignaturaSugerida: 'Matemáticas',
      barreraQueMitiga: '',
      indicadorBaseEjemplo: '',
      indicadorAjustadoSugerido: '',
      ajusteProcesoDetallado: '',
      fundamentoNormativo: 'Decreto 1421 de 2017 + Diseño Universal del Aprendizaje (DUA)',
    });
  };

  const handleConfirmApplyToStudent = (item: AjusteRazonableItem) => {
    const stId = targetStudentId || students[0]?.id;
    if (!stId) return;
    onApplyAdjustmentToStudent(stId, item);
    const st = students.find((s) => s.id === stId);
    setAppliedToast(
      `Ajuste "${item.titulo}" insertado en el PIAR de ${st?.nombresApellidos || 'estudiante'}.`
    );
    setApplyingItemId(null);
    setTimeout(() => setAppliedToast(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Cabecera del Banco de Ajustes Razonables */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-800 border border-indigo-200 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            Repositorio Institucional Sincronizado en Google Sheets
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A] font-serif-editorial">
            Banco de Ajustes Razonables por Tipo de Necesidad, DUA y Desempeño Superior
          </h2>
          <p className="text-sm text-[#475569] max-w-3xl">
            Catálogo técnico de adecuaciones curriculares, metodológicas y evaluativas bajo el Decreto 1421 de 2017, las pautas CAST-DUA y las Orientaciones MEN para Capacidades y Talentos Excepcionales.
          </p>
        </div>

        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#0F766E] hover:bg-[#115E59] text-white text-sm font-semibold shadow-xs transition shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          {showCreateForm ? 'Cerrar Formulario' : 'Nuevo Ajuste Razonable'}
        </button>
      </div>

      {appliedToast && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs sm:text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          {appliedToast}
        </div>
      )}

      {/* Formulario para crear un nuevo Ajuste Razonable en el Banco */}
      {showCreateForm && (
        <form
          onSubmit={handleCreateSubmit}
          className="bg-white border-2 border-[#0F766E] rounded-xl p-5 space-y-4 shadow-sm"
        >
          <h3 className="text-base font-bold text-[#0F172A]">
            Registrar Nueva Estrategia en el Banco Institucional de Ajustes Razonables
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#334155] mb-1">
                Título de la Estrategia / Ajuste Razonable *
              </label>
              <input
                type="text"
                required
                placeholder="Ej. Rúbrica Visual Fragmentada y Sustentación Oral Guiada"
                value={newItem.titulo}
                onChange={(e) => setNewItem({ ...newItem, titulo: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1">
                Asignatura Sugerida
              </label>
              <select
                value={newItem.asignaturaSugerida}
                onChange={(e) =>
                  setNewItem({ ...newItem, asignaturaSugerida: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] text-sm bg-white"
              >
                {ASIGNATURAS_COLOMBIA.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1">
                Tipo de Necesidad / Talento Excepcional *
              </label>
              <select
                value={newItem.categoriaNecesidad}
                onChange={(e) =>
                  setNewItem({
                    ...newItem,
                    categoriaNecesidad: e.target.value as NeedCategory,
                  })
                }
                className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] text-sm bg-white"
              >
                {CATEGORIAS_SIMAT.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1">
                Principio DUA / Enfoque
              </label>
              <select
                value={newItem.principioDua}
                onChange={(e) =>
                  setNewItem({ ...newItem, principioDua: e.target.value as DuaPrinciple })
                }
                className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] text-sm bg-white"
              >
                {DUA_PRINCIPLES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1">
                Barrera del Contexto que Mitiga
              </label>
              <input
                type="text"
                placeholder="Ej. Sobrecarga de memoria de trabajo escrita..."
                value={newItem.barreraQueMitiga}
                onChange={(e) => setNewItem({ ...newItem, barreraQueMitiga: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1">
                Indicador Original de Referencia (DBA)
              </label>
              <textarea
                rows={2}
                value={newItem.indicadorBaseEjemplo}
                onChange={(e) =>
                  setNewItem({ ...newItem, indicadorBaseEjemplo: e.target.value })
                }
                placeholder="Indicador estándar sin ajustar..."
                className="w-full p-2.5 rounded-lg border border-[#CBD5E1] text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-teal-900 mb-1">
                Indicador Ajustado / Enriquecido Sugerido *
              </label>
              <textarea
                rows={2}
                required
                value={newItem.indicadorAjustadoSugerido}
                onChange={(e) =>
                  setNewItem({ ...newItem, indicadorAjustadoSugerido: e.target.value })
                }
                placeholder="Indicador con flexibilización o enriquecimiento..."
                className="w-full p-2.5 rounded-lg border border-teal-400 bg-teal-50/20 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#334155] mb-1">
              Ajuste del Proceso Metodológico, Didáctico y Evaluativo *
            </label>
            <textarea
              rows={2}
              required
              value={newItem.ajusteProcesoDetallado}
              onChange={(e) =>
                setNewItem({ ...newItem, ajusteProcesoDetallado: e.target.value })
              }
              placeholder="Paso a paso de la adecuación en el aula..."
              className="w-full p-2.5 rounded-lg border border-[#CBD5E1] text-sm"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="px-4 py-2 rounded-lg border border-[#CBD5E1] text-xs font-semibold text-[#334155]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-semibold cursor-pointer"
            >
              Guardar Estrategia en el Banco DUA
            </button>
          </div>
        </form>
      )}

      {/* Barra de Filtros por Tipo de Necesidad y Principio DUA */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar estrategia, asignatura o ajuste..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#CBD5E1] text-xs sm:text-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500 shrink-0" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] text-xs sm:text-sm bg-white"
          >
            <option value="TODAS">Todas las Necesidades / Excepcionalidades</option>
            {CATEGORIAS_SIMAT.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={selectedPrinciple}
            onChange={(e) => setSelectedPrinciple(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] text-xs sm:text-sm bg-white"
          >
            <option value="TODOS">Todos los Principios DUA / Enfoques</option>
            {DUA_PRINCIPLES.map((pr) => (
              <option key={pr} value={pr}>
                {pr}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tarjetas del Banco de Ajustes Razonables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredItems.map((item) => {
          const isSuperior =
            item.categoriaNecesidad.includes('Desempeño Superior') ||
            item.categoriaNecesidad.includes('Doble Excepcionalidad');

          return (
            <div
              key={item.id}
              className="bg-white border border-[#E2E8F0] hover:border-[#94A3B8] rounded-xl p-5 flex flex-col justify-between gap-4 shadow-2xs transition"
            >
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded text-xs font-semibold ${
                      isSuperior
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-teal-50 text-teal-900 border border-teal-200'
                    }`}
                  >
                    {item.categoriaNecesidad}
                  </span>
                  <span className="text-xs font-semibold text-indigo-800 bg-indigo-50 px-2.5 py-0.5 rounded">
                    <BookOpen className="w-3 h-3 inline mr-1" />
                    {item.asignaturaSugerida}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-[#0F172A]">{item.titulo}</h3>
                  <p className="text-xs text-[#64748B] mt-0.5">{item.principioDua}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="font-semibold text-slate-600 block mb-0.5">
                      Indicador Original Ejemplo:
                    </span>
                    <span className="text-slate-800">{item.indicadorBaseEjemplo}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-teal-50/50 border border-teal-200">
                    <span className="font-semibold text-teal-900 block mb-0.5">
                      Indicador Ajustado Sugerido:
                    </span>
                    <span className="text-slate-900 font-medium">
                      {item.indicadorAjustadoSugerido}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-[#FBFBF9] border border-[#E2E8F0] text-xs space-y-1">
                  <div className="font-bold text-[#0F172A]">
                    Ajuste del Proceso (Didáctica y Evaluación):
                  </div>
                  <p className="text-[#334155] leading-relaxed">{item.ajusteProcesoDetallado}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-[#E2E8F0] flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] font-mono-code text-[#64748B]">
                  {item.fundamentoNormativo}
                </span>

                <div className="flex items-center gap-2">
                  {applyingItemId === item.id ? (
                    <div className="flex items-center gap-1.5">
                      <select
                        value={targetStudentId}
                        onChange={(e) => setTargetStudentId(e.target.value)}
                        className="px-2 py-1 rounded border border-[#CBD5E1] text-xs bg-white"
                      >
                        {students.map((st) => (
                          <option key={st.id} value={st.id}>
                            {st.nombresApellidos} ({st.curso})
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => handleConfirmApplyToStudent(item)}
                        className="px-2.5 py-1 rounded bg-[#0F766E] text-white text-xs font-semibold cursor-pointer"
                      >
                        Insertar
                      </button>
                      <button
                        type="button"
                        onClick={() => setApplyingItemId(null)}
                        className="px-2 py-1 text-xs text-slate-500"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setTargetStudentId(students[0]?.id || '');
                          setApplyingItemId(item.id);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-200 text-xs font-semibold transition cursor-pointer"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        Aplicar a un Estudiante
                      </button>
                      {adjustmentBank.length > 3 && (
                        <button
                          type="button"
                          onClick={() => onDeleteAdjustmentFromBank(item.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                          title="Eliminar del banco"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
