import React from 'react';
import {
  Scale,
  Sparkles,
  BookOpen,
  ShieldCheck,
  CheckCircle2,
  Award,
  Layers,
} from 'lucide-react';
import { MARCO_NORMATIVO_COLOMBIA, PLANTILLAS_PIAR } from '../data/colombianLegislationAndSeed';

interface LegislationGuideViewProps {
  onUseTemplate: (presetSuperior: boolean) => void;
}

export const LegislationGuideView: React.FC<LegislationGuideViewProps> = ({
  onUseTemplate,
}) => {
  return (
    <div className="space-y-6">
      {/* Encabezado Editorial de Legislación Educativa Colombiana */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 sm:p-6 space-y-3">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-teal-50 text-teal-900 border border-teal-200 text-xs font-semibold">
          <Scale className="w-3.5 h-3.5 text-teal-700" />
          Marco Técnico-Legal Ministerio de Educación Nacional de Colombia (MEN)
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A] font-serif-editorial">
          Política de PIAR (Decreto 1421), Diseño Universal (DUA) y Desempeño Superior
        </h2>
        <p className="text-sm text-[#475569] max-w-4xl leading-relaxed">
          Síntesis estructurada de la legislación educativa colombiana vigente para garantizar la atención pertinente a estudiantes con discapacidad, trastornos del neurodesarrollo/aprendizaje, capacidades o talentos excepcionales y doble excepcionalidad.
        </p>
      </div>

      {/* Pilares Normativos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {MARCO_NORMATIVO_COLOMBIA.map((item, idx) => (
          <div
            key={idx}
            className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-3 shadow-2xs"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="px-2.5 py-1 rounded bg-[#0F172A] text-white text-xs font-mono-code font-semibold">
                {item.norma}
              </span>
              {idx === 2 ? (
                <Award className="w-5 h-5 text-amber-600 shrink-0" />
              ) : idx === 1 ? (
                <Layers className="w-5 h-5 text-indigo-600 shrink-0" />
              ) : (
                <ShieldCheck className="w-5 h-5 text-teal-700 shrink-0" />
              )}
            </div>

            <h3 className="text-base font-bold text-[#0F172A] font-serif-editorial">
              {item.titulo}
            </h3>

            <p className="text-xs sm:text-sm text-[#334155] leading-relaxed">
              {item.resumenEjecutivo}
            </p>

            <div className="pt-2 border-t border-[#E2E8F0] space-y-1.5">
              <div className="text-xs font-bold text-[#0F172A]">
                Lineamientos de Obligatorio Cumplimiento en Auditoría:
              </div>
              <ul className="space-y-1.5">
                {item.componentesClave.map((comp, cIdx) => (
                  <li key={cIdx} className="flex items-start gap-2 text-xs text-[#475569]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-700 shrink-0 mt-0.5" />
                    <span>{comp}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Cuadro Comparativo Técnico: PIAR vs. DUA vs. Desempeño Superior */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 sm:p-6 space-y-4">
        <h3 className="text-base sm:text-lg font-bold text-[#0F172A] font-serif-editorial">
          Articulación Pedagógica en el Aula: DUA + PIAR + Enriquecimiento Superior
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse border border-[#CBD5E1] text-xs sm:text-sm">
            <thead>
              <tr className="bg-[#F4F4F0] text-[#0F172A] font-bold">
                <th className="border border-[#CBD5E1] p-3">Dimensión</th>
                <th className="border border-[#CBD5E1] p-3 text-indigo-900">
                  Diseño Universal del Aprendizaje (DUA)
                </th>
                <th className="border border-[#CBD5E1] p-3 text-teal-900">
                  PIAR (Decreto 1421 de 2017)
                </th>
                <th className="border border-[#CBD5E1] p-3 text-amber-900">
                  Desempeño Superior / Talentos Excepcionales
                </th>
              </tr>
            </thead>
            <tbody className="text-[#334155]">
              <tr>
                <td className="border border-[#CBD5E1] p-3 font-bold text-[#0F172A]">
                  Población Objetivo
                </td>
                <td className="border border-[#CBD5E1] p-3">
                  100% de los estudiantes del aula (planeación general diversificada).
                </td>
                <td className="border border-[#CBD5E1] p-3">
                  Estudiantes con discapacidad o barreras específicas que persisten tras aplicar el DUA.
                </td>
                <td className="border border-[#CBD5E1] p-3">
                  Estudiantes con Capacidad Excepcional Global, Talento Específico o Doble Excepcionalidad.
                </td>
              </tr>
              <tr>
                <td className="border border-[#CBD5E1] p-3 font-bold text-[#0F172A]">
                  Acción sobre el Indicador
                </td>
                <td className="border border-[#CBD5E1] p-3">
                  Mantiene el DBA ofreciendo múltiples formas de representación y expresión.
                </td>
                <td className="border border-[#CBD5E1] p-3">
                  Flexibiliza, gradúa o prioriza el indicador garantizando participación y progreso.
                </td>
                <td className="border border-[#CBD5E1] p-3">
                  Compacta lo ya dominado y amplía la complejidad (investigación, creación, modelado).
                </td>
              </tr>
              <tr>
                <td className="border border-[#CBD5E1] p-3 font-bold text-[#0F172A]">
                  Soporte para Auditoría
                </td>
                <td className="border border-[#CBD5E1] p-3">
                  Plan de aula institucional con pautas DUA I, II y III.
                </td>
                <td className="border border-[#CBD5E1] p-3">
                  Anexos 1, 2 y 3 firmados + Seguimiento por Periodo + Historia Escolar.
                </td>
                <td className="border border-[#CBD5E1] p-3">
                  Plan Individual de Enriquecimiento + Portafolio de Evidencias + Registro SIMAT.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="text-xs text-[#64748B]">
            Todas las plantillas de <strong>Ekirayá IEP</strong> integran estos lineamientos listos para inspección de Secretaría de Educación.
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onUseTemplate(false)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-semibold cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" />
              Usar Plantilla PIAR Decreto 1421
            </button>
            <button
              onClick={() => onUseTemplate(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Usar Plantilla Desempeño Superior
            </button>
          </div>
        </div>
      </div>

      {/* Catálogo de Plantillas Editables Incluidas */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 sm:p-6 space-y-4">
        <h3 className="text-base font-bold text-[#0F172A]">
          Plantillas Editables Preconfiguradas en Ekirayá IEP
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PLANTILLAS_PIAR.map((tpl) => (
            <div
              key={tpl.id}
              className="p-4 rounded-xl bg-[#FBFBF9] border border-[#CBD5E1] space-y-2"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-[#0F172A]">{tpl.nombre}</span>
                <span className="text-[10px] font-mono-code px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                  {tpl.adecuacionesIniciales.length} asignaturas base
                </span>
              </div>
              <p className="text-xs text-[#475569]">{tpl.descripcionPlantilla}</p>
              <div className="text-[11px] font-mono-code text-teal-800">
                {tpl.normativaReferencia}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
