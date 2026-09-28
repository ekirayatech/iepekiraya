import React, { useState } from 'react';
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  ExternalLink,
  FileSpreadsheet,
  GraduationCap,
  Layers,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
} from 'lucide-react';
import {
  CategoriaSimatCatalogItem,
  CursoAnioCatalogItem,
  NeedCategory,
} from '../types/piar';
import { ANIOS_LECTIVOS_COLOMBIA } from '../data/colombianLegislationAndSeed';

interface CatalogTablesViewProps {
  cursosCatalog: CursoAnioCatalogItem[];
  categoriasCatalog: CategoriaSimatCatalogItem[];
  onAddCurso: (curso: CursoAnioCatalogItem) => void;
  onDeleteCurso: (id: string) => void;
  onAddCategoria: (cat: CategoriaSimatCatalogItem) => void;
  onDeleteCategoria: (id: string) => void;
  onForceSyncSheets: () => void;
  spreadsheetId: string;
  isConnected: boolean;
}

export const CatalogTablesView: React.FC<CatalogTablesViewProps> = ({
  cursosCatalog,
  categoriasCatalog,
  onAddCurso,
  onDeleteCurso,
  onAddCategoria,
  onDeleteCategoria,
  onForceSyncSheets,
  spreadsheetId,
  isConnected,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'cursos' | 'simat'>('cursos');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAnio, setFilterAnio] = useState<string>('TODOS');

  // Formulario nuevo Curso / Año Lectivo
  const [showNewCursoForm, setShowNewCursoForm] = useState(false);
  const [codigoCurso, setCodigoCurso] = useState('');
  const [nombreCurso, setNombreCurso] = useState('');
  const [nivelEducativo, setNivelEducativo] =
    useState<CursoAnioCatalogItem['nivelEducativo']>('Básica Secundaria');
  const [anioLectivo, setAnioLectivo] = useState('2026-2027');
  const [directorGrupo, setDirectorGrupo] = useState('');

  // Formulario nueva Categoría SIMAT
  const [showNewCatForm, setShowNewCatForm] = useState(false);
  const [codigoSimatMen, setCodigoSimatMen] = useState('');
  const [nombreCategoria, setNombreCategoria] = useState('');
  const [tipoRuta, setTipoRuta] = useState<CategoriaSimatCatalogItem['tipoRuta']>(
    'PIAR (Ajuste Razonable — Decreto 1421)'
  );
  const [normativaReferencia, setNormativaReferencia] = useState(
    'Decreto 1421 de 2017 MEN — Anexo 2 PIAR'
  );
  const [principioDuaPrioritario, setPrincipioDuaPrioritario] = useState(
    'Principios I, II y III DUA'
  );
  const [descripcionTecnica, setDescripcionTecnica] = useState('');
  const [requiereSoporte, setRequiereSoporte] = useState('');

  const handleCreateCurso = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreCurso.trim() || !anioLectivo.trim()) return;

    const newItem: CursoAnioCatalogItem = {
      id: `cur-${Date.now().toString().slice(-5)}`,
      codigoCurso: codigoCurso.trim() || `G-${nombreCurso.slice(0, 3).toUpperCase()}`,
      curso: nombreCurso.trim(),
      nombreCurso: nombreCurso.trim(),
      nivelEducativo,
      anioLectivo: anioLectivo.trim(),
      directorGrupo: directorGrupo.trim() || 'Docente Director de Grupo',
      estadoAnio: 'Año Lectivo Activo',
      activo: true,
    };

    onAddCurso(newItem);
    setCodigoCurso('');
    setNombreCurso('');
    setDirectorGrupo('');
    setShowNewCursoForm(false);
  };

  const handleCreateCategoria = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreCategoria.trim()) return;

    const newCat: CategoriaSimatCatalogItem = {
      id: `simat-${Date.now().toString().slice(-5)}`,
      codigoSimatMen: codigoSimatMen.trim() || `SIMAT-${categoriasCatalog.length + 1}`,
      categoriaSimat: nombreCategoria.trim() as NeedCategory,
      categoria: nombreCategoria.trim() as NeedCategory,
      tipoRuta,
      normativaReferencia: normativaReferencia.trim() || 'Decreto 1421 de 2017 MEN',
      principioDuaPrioritario: principioDuaPrioritario.trim() || 'Diseño Universal DUA',
      descripcionTecnica:
        descripcionTecnica.trim() ||
        'Categorización pedagógica institucional para ajuste razonable o enriquecimiento curricular.',
      requisitoSoporteAuditor:
        requiereSoporte.trim() || 'Valoración pedagógica y acta de comité de inclusión',
      requiereSoporteClinicoOPedagogico:
        requiereSoporte.trim() || 'Valoración pedagógica y acta de comité de inclusión',
    };

    onAddCategoria(newCat);
    setCodigoSimatMen('');
    setNombreCategoria('');
    setDescripcionTecnica('');
    setRequiereSoporte('');
    setShowNewCatForm(false);
  };

  const uniqueAnios = Array.from(
    new Set([...ANIOS_LECTIVOS_COLOMBIA, ...cursosCatalog.map((c) => c.anioLectivo)])
  );

  const filteredCursos = cursosCatalog.filter((c) => {
    const courseLabel = c.nombreCurso || c.curso || '';
    const matchesAnio = filterAnio === 'TODOS' || c.anioLectivo === filterAnio;
    const matchesSearch =
      !searchQuery.trim() ||
      courseLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.codigoCurso.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.anioLectivo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.directorGrupo.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesAnio && matchesSearch;
  });

  const filteredCategorias = categoriasCatalog.filter((cat) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const catLabel = cat.categoria || cat.categoriaSimat || '';
    const descLabel = cat.descripcionTecnica || cat.requisitoSoporteAuditor || '';
    return (
      catLabel.toLowerCase().includes(q) ||
      cat.codigoSimatMen.toLowerCase().includes(q) ||
      cat.tipoRuta.toLowerCase().includes(q) ||
      descLabel.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Cabecera de sincronización con Google Sheets */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200">
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Pestañas en Google Sheets: Tabla_Cursos_Anios & Tabla_Categorias_SIMAT
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Sincronización en Tiempo Real (2s)
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Tablas Maestras en Google Sheets: Cursos, Año Lectivo y Categorías SIMAT
          </h2>
          <p className="text-xs text-slate-600 max-w-3xl">
            Estas dos tablas alimentan los selectores del formulario PIAR y se crean automáticamente como pestañas oficiales{' '}
            <code className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 font-mono">Tabla_Cursos_Anios</code> y{' '}
            <code className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 font-mono">Tabla_Categorias_SIMAT</code>{' '}
            dentro de tu archivo de Google Sheets.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={onForceSyncSheets}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-teal-700 text-white hover:bg-teal-800 transition shadow-xs cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            {isConnected
              ? 'Actualizar Tablas en Google Sheets Ahora'
              : 'Conectar y Crear Tablas en Google Sheets'}
          </button>

          {spreadsheetId && (
            <a
              href={`https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition"
            >
              <span>Ver Pestañas en Google Sheets</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>

      {/* Selector de Tabla Activa y Búsqueda */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('cursos')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeSubTab === 'cursos'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Calendar className="w-4 h-4 text-teal-400" />
            <span>1. Tabla de Cursos y Año Lectivo (2026-2027, etc.)</span>
            <span className="px-1.5 py-0.2 rounded-md text-[11px] bg-white/20">
              {cursosCatalog.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('simat')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeSubTab === 'simat'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Layers className="w-4 h-4 text-amber-400" />
            <span>2. Tabla Categorías SIMAT / Necesidad o Desempeño Superior</span>
            <span className="px-1.5 py-0.2 rounded-md text-[11px] bg-white/20">
              {categoriasCatalog.length}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar curso, año 2026-2027 o categoría SIMAT..."
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-teal-600 w-64"
            />
          </div>
        </div>
      </div>

      {/* CONTENIDO PESTAÑA 1: TABLA DE CURSOS Y AÑOS LECTIVOS */}
      {activeSubTab === 'cursos' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/60">
            <div>
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-teal-700" />
                <h3 className="text-sm font-bold text-slate-900">
                  Hoja en Google Sheets: <span className="font-mono text-teal-700">Tabla_Cursos_Anios</span>
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Incluye grados desde Transición hasta 11° Media Vocacional y periodos lectivos bilingües/calendario A y B (2026-2027, 2027-2028, 2026, etc.).
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={filterAnio}
                onChange={(e) => setFilterAnio(e.target.value)}
                className="px-3 py-1.5 rounded-xl text-xs font-medium bg-white border border-slate-200 text-slate-700"
              >
                <option value="TODOS">Todos los Años Lectivos</option>
                {uniqueAnios.map((anio) => (
                  <option key={anio} value={anio}>
                    Año Lectivo: {anio}
                  </option>
                ))}
              </select>

              <button
                onClick={() => setShowNewCursoForm(!showNewCursoForm)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-teal-700 text-white hover:bg-teal-800 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar Curso / Año Lectivo</span>
              </button>
            </div>
          </div>

          {showNewCursoForm && (
            <form
              onSubmit={handleCreateCurso}
              className="p-4 bg-teal-50/50 border-b border-teal-200/80 grid grid-cols-1 sm:grid-cols-6 gap-3 items-end"
            >
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Código Curso
                </label>
                <input
                  type="text"
                  value={codigoCurso}
                  onChange={(e) => setCodigoCurso(e.target.value)}
                  placeholder="Ej: G08-A"
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Nombre del Curso / Grado *
                </label>
                <input
                  type="text"
                  required
                  value={nombreCurso}
                  onChange={(e) => setNombreCurso(e.target.value)}
                  placeholder="Ej: 8° (Octavo A - Secundaria)"
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Nivel Educativo MEN
                </label>
                <select
                  value={nivelEducativo}
                  onChange={(e) =>
                    setNivelEducativo(
                      e.target.value as CursoAnioCatalogItem['nivelEducativo']
                    )
                  }
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                >
                  <option value="Preescolar">Preescolar</option>
                  <option value="Básica Primaria">Básica Primaria</option>
                  <option value="Básica Secundaria">Básica Secundaria</option>
                  <option value="Media Vocacional">Media Vocacional</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Año Lectivo (Ej. 2026-2027) *
                </label>
                <input
                  type="text"
                  required
                  list="anios-lectivos-list"
                  value={anioLectivo}
                  onChange={(e) => setAnioLectivo(e.target.value)}
                  placeholder="2026-2027"
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg font-mono"
                />
                <datalist id="anios-lectivos-list">
                  {ANIOS_LECTIVOS_COLOMBIA.map((a) => (
                    <option key={a} value={a} />
                  ))}
                </datalist>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Director de Grupo
                  </label>
                  <input
                    type="text"
                    value={directorGrupo}
                    onChange={(e) => setDirectorGrupo(e.target.value)}
                    placeholder="Nombre del docente"
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                  />
                </div>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-teal-700 text-white hover:bg-teal-800 cursor-pointer mt-4"
                >
                  Guardar
                </button>
              </div>
            </form>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Código</th>
                  <th className="py-3 px-4">Curso / Grado Escolar</th>
                  <th className="py-3 px-4">Nivel Educativo MEN</th>
                  <th className="py-3 px-4">Año Lectivo</th>
                  <th className="py-3 px-4">Director de Grupo</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/70 text-xs">
                {filteredCursos.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-2.5 px-4 font-mono font-semibold text-slate-700">
                      {item.codigoCurso}
                    </td>
                    <td className="py-2.5 px-4 font-semibold text-slate-900">
                      {item.nombreCurso || item.curso}
                    </td>
                    <td className="py-2.5 px-4 text-slate-600">{item.nivelEducativo}</td>
                    <td className="py-2.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-mono font-semibold bg-teal-50 text-teal-800 border border-teal-200">
                        <Calendar className="w-3 h-3" />
                        {item.anioLectivo}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-slate-600">{item.directorGrupo}</td>
                    <td className="py-2.5 px-4">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                          item.activo !== false && item.estadoAnio !== 'Histórico Cerrado'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {item.estadoAnio || (item.activo ? 'ACTIVO' : 'HISTÓRICO')}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <button
                        onClick={() => onDeleteCurso(item.id)}
                        title="Eliminar fila de la tabla"
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CONTENIDO PESTAÑA 2: TABLA DE CATEGORÍAS SIMAT / NECESIDAD O DESEMPEÑO SUPERIOR */}
      {activeSubTab === 'simat' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/60">
            <div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Hoja en Google Sheets:{' '}
                  <span className="font-mono text-amber-700">Tabla_Categorias_SIMAT</span>
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Tipologías oficiales del Ministerio de Educación Nacional (SIMAT): Discapacidad, Trastornos del Aprendizaje/Neurodesarrollo, Desempeño Superior y Doble Excepcionalidad.
              </p>
            </div>

            <button
              onClick={() => setShowNewCatForm(!showNewCatForm)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-amber-600 text-white hover:bg-amber-700 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Agregar Categoría SIMAT / Desempeño Superior</span>
            </button>
          </div>

          {showNewCatForm && (
            <form
              onSubmit={handleCreateCategoria}
              className="p-4 bg-amber-50/50 border-b border-amber-200/80 grid grid-cols-1 sm:grid-cols-3 gap-3"
            >
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Código SIMAT MEN
                </label>
                <input
                  type="text"
                  value={codigoSimatMen}
                  onChange={(e) => setCodigoSimatMen(e.target.value)}
                  placeholder="Ej: SIMAT-10-TAL"
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Nombre Categoría SIMAT / Necesidad / Desempeño Superior *
                </label>
                <input
                  type="text"
                  required
                  value={nombreCategoria}
                  onChange={(e) => setNombreCategoria(e.target.value)}
                  placeholder="Ej: Talento Excepcional en Tecnología o Robótica"
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Tipo de Ruta Institucional
                </label>
                <select
                  value={tipoRuta}
                  onChange={(e) =>
                    setTipoRuta(e.target.value as CategoriaSimatCatalogItem['tipoRuta'])
                  }
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                >
                  <option value="PIAR (Ajuste Razonable — Decreto 1421)">
                    PIAR (Ajuste Razonable — Decreto 1421)
                  </option>
                  <option value="Desempeño Superior (Plan de Enriquecimiento — MEN)">
                    Desempeño Superior (Plan de Enriquecimiento — MEN)
                  </option>
                  <option value="Doble Excepcionalidad (PIAR + Enriquecimiento)">
                    Doble Excepcionalidad (PIAR + Enriquecimiento)
                  </option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Normativa Aplicable MEN
                </label>
                <input
                  type="text"
                  value={normativaReferencia}
                  onChange={(e) => setNormativaReferencia(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Principio DUA Prioritario
                </label>
                <input
                  type="text"
                  value={principioDuaPrioritario}
                  onChange={(e) => setPrincipioDuaPrioritario(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Requisito de Soporte en Expediente
                </label>
                <input
                  type="text"
                  value={requiereSoporte}
                  onChange={(e) => setRequiereSoporte(e.target.value)}
                  placeholder="Diagnóstico clínico o portafolio de evidencias"
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Descripción Técnica y Pedagógica
                </label>
                <input
                  type="text"
                  value={descripcionTecnica}
                  onChange={(e) => setDescripcionTecnica(e.target.value)}
                  placeholder="Descripción de los ajustes razonables o enriquecimiento requerido..."
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                />
              </div>
              <div className="flex items-end justify-end">
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-amber-600 text-white hover:bg-amber-700 cursor-pointer"
                >
                  Guardar Categoría en Tabla
                </button>
              </div>
            </form>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Código SIMAT</th>
                  <th className="py-3 px-4">Categoría SIMAT / Necesidad o Desempeño Superior</th>
                  <th className="py-3 px-4">Ruta Normativa</th>
                  <th className="py-3 px-4">Principio DUA Prioritario</th>
                  <th className="py-3 px-4">Descripción Técnica y Soporte</th>
                  <th className="py-3 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/70 text-xs">
                {filteredCategorias.map((cat) => {
                  const isSuperior =
                    cat.tipoRuta.includes('Desempeño Superior') ||
                    cat.tipoRuta.includes('Doble Excepcionalidad');
                  return (
                    <tr key={cat.id} className="hover:bg-slate-50/80 transition align-top">
                      <td className="py-3 px-4 font-mono font-semibold text-slate-700 whitespace-nowrap">
                        {cat.codigoSimatMen}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        <div className="flex items-center gap-1.5">
                          {isSuperior && (
                            <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          )}
                          <span>{cat.categoria || cat.categoriaSimat}</span>
                        </div>
                        <div className="text-[11px] font-normal text-slate-500 mt-0.5">
                          {cat.normativaReferencia || 'Decreto 1421 de 2017 MEN'}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                            isSuperior
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-teal-50 text-teal-800 border border-teal-200'
                          }`}
                        >
                          {cat.tipoRuta}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-medium">
                        {cat.principioDuaPrioritario}
                      </td>
                      <td className="py-3 px-4 text-slate-600 max-w-md">
                        {cat.descripcionTecnica && <p>{cat.descripcionTecnica}</p>}
                        <p className="text-[11px] text-slate-500 mt-1">
                          <strong className="text-slate-700">Soporte:</strong>{' '}
                          {cat.requiereSoporteClinicoOPedagogico || cat.requisitoSoporteAuditor}
                        </p>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => onDeleteCategoria(cat.id)}
                          title="Eliminar categoría"
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
