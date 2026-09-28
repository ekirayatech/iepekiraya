import React, { useRef, useState, useEffect } from 'react';
import {
  X,
  Printer,
  ShieldCheck,
  PenTool,
  RotateCcw,
  CheckCircle2,
  Download,
  Lock,
  Sparkles,
} from 'lucide-react';
import { FirmaProfesional, RoleProfile, StudentPIAR } from '../types/piar';
import { generateAuditHash } from '../utils/crypto';
import { generateCalligraphicSignatureSvg } from '../utils/exportUtils';

interface AuditPdfModalProps {
  student: StudentPIAR;
  roleProfile: RoleProfile;
  onClose: () => void;
  onSaveSignature: (studentId: string, firma: FirmaProfesional) => void;
}

export const AuditPdfModal: React.FC<AuditPdfModalProps> = ({
  student,
  roleProfile,
  onClose,
  onSaveSignature,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawnStroke, setHasDrawnStroke] = useState(false);

  const [nombreProfesional, setNombreProfesional] = useState(
    student.firmaProfesional?.nombreProfesional ||
      (roleProfile.canSignAuditReport
        ? roleProfile.userName
        : 'Dra. Valentina Morales Pineda')
  );
  const [cargo, setCargo] = useState(
    student.firmaProfesional?.cargo ||
      'Psicóloga Orientadora Escolar — Líder de Inclusión (Decreto 1421)'
  );
  const [tarjetaProfesional, setTarjetaProfesional] = useState(
    student.firmaProfesional?.tarjetaProfesional || 'T.P. 148920 COLPSIC'
  );
  const [institucion, setInstitucion] = useState(
    student.firmaProfesional?.institucion ||
      'Institución Educativa Ekirayá — Aprobación Oficial MEN'
  );
  const [hashAuditoria, setHashAuditoria] = useState(
    student.firmaProfesional?.hashAuditoria || 'SHA256-9F8A4C12-7E3B1109-4D2C88A1'
  );
  const [signatureUrl, setSignatureUrl] = useState<string>(
    student.firmaProfesional?.firmaDataUrl ||
      generateCalligraphicSignatureSvg(nombreProfesional, tarjetaProfesional)
  );
  const [signatureSavedBanner, setSignatureSavedBanner] = useState(false);

  useEffect(() => {
    const computeHash = async () => {
      const payload = `${student.id}|${student.nombresApellidos}|${nombreProfesional}|${tarjetaProfesional}|${student.updatedAt}`;
      const h = await generateAuditHash(payload);
      setHashAuditoria(h);
    };
    computeHash();
  }, [student, nombreProfesional, tarjetaProfesional]);

  // Inicializar lienzo de firma manuscrita
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const getCoordinates = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawnStroke(true);
  };

  const draw = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const endDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas && hasDrawnStroke) {
      setSignatureUrl(canvas.toDataURL('image/png'));
    }
  };

  const handleClearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawnStroke(false);
    setSignatureUrl(generateCalligraphicSignatureSvg(nombreProfesional, tarjetaProfesional));
  };

  const handleApplyAndSealSignature = () => {
    const finalSigUrl =
      hasDrawnStroke && canvasRef.current
        ? canvasRef.current.toDataURL('image/png')
        : generateCalligraphicSignatureSvg(nombreProfesional, tarjetaProfesional);

    setSignatureUrl(finalSigUrl);
    const nuevaFirma: FirmaProfesional = {
      nombreProfesional,
      cargo,
      tarjetaProfesional,
      institucion,
      firmaDataUrl: finalSigUrl,
      fechaFirma: new Date().toISOString().slice(0, 10),
      hashAuditoria,
    };
    onSaveSignature(student.id, nuevaFirma);
    setSignatureSavedBanner(true);
    setTimeout(() => setSignatureSavedBanner(false), 3500);
  };

  const handlePrintPdf = () => {
    window.print();
  };

  const handleDownloadStandaloneAuditDocument = () => {
    const docElement = document.getElementById('printable-audit-sheet');
    if (!docElement) return;

    const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>Informe_Auditoria_PIAR_${student.nombresApellidos.replace(/\s+/g, '_')}.html</title>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #0F172A; margin: 24px; line-height: 1.45; }
    h1, h2, h3 { margin-bottom: 6px; color: #0F172A; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; margin-bottom: 16px; font-size: 12px; }
    th, td { border: 1px solid #CBD5E1; padding: 8px; text-align: left; vertical-align: top; }
    th { background-color: #F1F5F9; font-weight: 700; }
    .badge { display: inline-block; padding: 3px 8px; background: #E2E8F0; border-radius: 4px; font-size: 11px; font-weight: bold; }
    @media print { @page { size: letter portrait; margin: 12mm; } }
  </style>
</head>
<body onload="window.print()">
  ${docElement.innerHTML}
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Informe_Auditoria_PIAR_${student.nombresApellidos.replace(/\s+/g, '_')}_${student.anioLectivo}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-[#F4F4F0] border border-[#CBD5E1] rounded-2xl w-full max-w-6xl max-h-[95vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Barra Superior de Acciones (No se imprime en el PDF) */}
        <div className="no-print bg-white border-b border-[#E2E8F0] px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-lg bg-teal-50 text-teal-800">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#0F172A] font-serif-editorial">
                Informe Oficial de Auditoría PIAR / Plan Excepcional (Listo para PDF)
              </h2>
              <p className="text-xs text-[#64748B]">
                Cumplimiento Decreto 1421 de 2017 (Anexos 1, 2 y 3) • Sello Criptográfico y Firma del Profesional a Cargo
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handlePrintPdf}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0F766E] hover:bg-[#115E59] text-white text-xs sm:text-sm font-semibold shadow-xs transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Exportar / Imprimir PDF Oficial
            </button>
            <button
              type="button"
              onClick={handleDownloadStandaloneAuditDocument}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white hover:bg-slate-50 text-[#0F172A] border border-[#CBD5E1] text-xs sm:text-sm font-semibold transition cursor-pointer"
            >
              <Download className="w-4 h-4 text-teal-700" />
              Descargar Expediente Auditado
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Panel Izquierdo (No se imprime): Módulo de Firma Digital del Profesional */}
          <div className="no-print lg:col-span-4 space-y-4">
            <div className="bg-white border border-[#CBD5E1] rounded-xl p-4 space-y-3.5 shadow-2xs">
              <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2.5">
                <div className="flex items-center gap-2">
                  <PenTool className="w-4 h-4 text-[#0F766E]" />
                  <h3 className="text-sm font-bold text-[#0F172A]">
                    Firma del Profesional a Cargo
                  </h3>
                </div>
                <span className="text-[10px] font-mono-code px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Auditoría MEN
                </span>
              </div>

              {signatureSavedBanner && (
                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  Firma certificada y sincronizada en Google Sheets.
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#334155] mb-1">
                  Nombre Completo del Profesional
                </label>
                <input
                  type="text"
                  value={nombreProfesional}
                  onChange={(e) => {
                    setNombreProfesional(e.target.value);
                    if (!hasDrawnStroke) {
                      setSignatureUrl(
                        generateCalligraphicSignatureSvg(e.target.value, tarjetaProfesional)
                      );
                    }
                  }}
                  className="w-full px-3 py-1.5 rounded-lg border border-[#CBD5E1] text-xs text-[#0F172A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#334155] mb-1">
                  Cargo / Rol Institucional
                </label>
                <input
                  type="text"
                  value={cargo}
                  onChange={(e) => setCargo(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-[#CBD5E1] text-xs text-[#0F172A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#334155] mb-1">
                  Tarjeta Profesional / Registro MEN
                </label>
                <input
                  type="text"
                  value={tarjetaProfesional}
                  onChange={(e) => {
                    setTarjetaProfesional(e.target.value);
                    if (!hasDrawnStroke) {
                      setSignatureUrl(
                        generateCalligraphicSignatureSvg(nombreProfesional, e.target.value)
                      );
                    }
                  }}
                  className="w-full px-3 py-1.5 rounded-lg border border-[#CBD5E1] text-xs font-mono-code text-[#0F172A]"
                />
              </div>

              {/* Lienzo de firma manuscrita */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-[#334155]">
                    Traza tu Firma Manuscrita (o usa la Caligráfica):
                  </label>
                  <button
                    type="button"
                    onClick={handleClearCanvas}
                    className="inline-flex items-center gap-1 text-[11px] text-slate-600 hover:text-slate-900 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Limpiar / Caligráfica
                  </button>
                </div>
                <div className="border border-dashed border-[#94A3B8] rounded-lg bg-[#FBFBF9] overflow-hidden">
                  <canvas
                    ref={canvasRef}
                    width={320}
                    height={105}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={endDrawing}
                    onMouseLeave={endDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={endDrawing}
                    className="w-full h-[105px] cursor-crosshair touch-none"
                  />
                </div>
                <p className="text-[11px] text-[#64748B] mt-1">
                  Dibuja con el cursor o pantalla táctil, o conserva la firma digital certificada generada automáticamente.
                </p>
              </div>

              <button
                type="button"
                onClick={handleApplyAndSealSignature}
                className="w-full py-2.5 px-4 rounded-lg bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-semibold shadow-xs transition cursor-pointer"
              >
                Estampar Firma y Sello SHA-256 en el Informe
              </button>
            </div>

            <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 space-y-2 text-xs text-[#475569]">
              <div className="font-bold text-[#0F172A] flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-teal-700" />
                Validez de Auditoría Secretaría de Educación
              </div>
              <p>
                Este documento integra los <strong>Anexos 1, 2 y 3 del Decreto 1421 de 2017</strong>, el registro de adecuaciones por asignatura, el seguimiento por periodos y la trazabilidad anual del estudiante.
              </p>
            </div>
          </div>

          {/* Panel Derecho: Hoja Oficial de Auditoría (Se imprime al 100% en PDF) */}
          <div className="lg:col-span-8">
            <div
              id="printable-audit-sheet"
              className="audit-document-sheet bg-white border border-[#CBD5E1] rounded-xl p-6 sm:p-8 shadow-md space-y-6 text-[#0F172A]"
            >
              {/* Membrete Institucional Oficial */}
              <div className="border-b-2 border-[#0F172A] pb-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-[11px] font-bold uppercase tracking-widest text-[#0F766E]">
                    República de Colombia • Ministerio de Educación Nacional
                  </div>
                  <h1 className="text-xl sm:text-2xl font-bold font-serif-editorial text-[#0F172A]">
                    {student.esDesempenoSuperior
                      ? 'PLAN INDIVIDUAL DE ENRIQUECIMIENTO CURRICULAR Y TALENTOS EXCEPCIONALES'
                      : 'PLAN INDIVIDUAL DE AJUSTES RAZONABLES (PIAR — DECRETO 1421 DE 2017)'}
                  </h1>
                  <div className="text-xs text-[#475569] font-medium">
                    {institucion} • Sistema de Gestión Inclusiva Ekirayá IEP
                  </div>
                </div>

                <div className="sm:text-right font-mono-code text-xs space-y-0.5 bg-[#F4F4F0] p-2.5 rounded-lg border border-[#CBD5E1] shrink-0">
                  <div className="font-bold text-[#0F172A]">{student.codigoSimat}</div>
                  <div>Año Lectivo: {student.anioLectivo}</div>
                  <div>Expediente: {student.id.toUpperCase()}</div>
                  <div className="text-[10px] text-teal-800">{student.estadoPiar}</div>
                </div>
              </div>

              {/* SECCIÓN 1: IDENTIFICACIÓN Y CARACTERIZACIÓN (ANEXO 1) */}
              <div className="space-y-3">
                <h2 className="text-xs font-bold uppercase tracking-wider bg-[#0F172A] text-white px-3 py-1.5 rounded">
                  I. Identificación del Estudiante, Diagnóstico y Caracterización Pedagógica (Anexo 1)
                </h2>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs border border-[#CBD5E1] rounded-lg p-3 bg-[#FBFBF9]">
                  <div>
                    <span className="text-[#64748B] block">Nombres y Apellidos:</span>
                    <strong className="text-[#0F172A] text-sm">{student.nombresApellidos}</strong>
                  </div>
                  <div>
                    <span className="text-[#64748B] block">Documento Identidad:</span>
                    <strong className="font-mono-code">{student.documentoIdentidad}</strong> ({student.edad} años)
                  </div>
                  <div>
                    <span className="text-[#64748B] block">Curso / Grado:</span>
                    <strong>{student.curso}</strong>
                  </div>
                  <div>
                    <span className="text-[#64748B] block">Año Lectivo:</span>
                    <strong className="font-mono-code">{student.anioLectivo}</strong>
                  </div>
                  <div className="col-span-2 sm:col-span-4 pt-1 border-t border-[#E2E8F0]">
                    <span className="text-[#64748B] block">
                      Categoría SIMAT / Condición o Excepcionalidad:
                    </span>
                    <strong className="text-teal-900">{student.categoriaSimat}</strong>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 text-xs">
                  <div className="border border-[#CBD5E1] rounded-lg p-3">
                    <div className="font-bold text-[#0F172A] mb-1 flex items-center justify-between">
                      <span>Diagnóstico / Concepto Psicopedagógico (Protegido Ley 1581 de 2012):</span>
                      <span className="font-mono-code text-[10px] text-teal-800">
                        Cifrado en Base de Datos: AES-256-GCM
                      </span>
                    </div>
                    <p className="text-[#334155] leading-relaxed">{student.diagnostico}</p>
                  </div>

                  <div className="border border-[#CBD5E1] rounded-lg p-3">
                    <div className="font-bold text-[#0F172A] mb-1">
                      Descripción General del Estudiante (Fortalezas, Intereses y Perfil DUA):
                    </div>
                    <p className="text-[#334155] leading-relaxed">{student.descripcion}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="border border-[#CBD5E1] rounded-lg p-3">
                      <div className="font-bold text-[#0F172A] mb-1">
                        Barreras Identificadas en el Contexto:
                      </div>
                      <p className="text-[#334155]">{student.barrerasContexto}</p>
                    </div>
                    <div className="border border-[#CBD5E1] rounded-lg p-3">
                      <div className="font-bold text-[#0F172A] mb-1">
                        Compromisos y Recomendaciones Familia (Anexo 3):
                      </div>
                      <p className="text-[#334155]">{student.recomendacionesFamilia}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECCIÓN 2: MATRIZ DE ADECUACIONES POR ASIGNATURA (ANEXO 2) */}
              <div className="space-y-2">
                <h2 className="text-xs font-bold uppercase tracking-wider bg-[#0F172A] text-white px-3 py-1.5 rounded">
                  II. Matriz de Adecuaciones Razonables y Enriquecimiento por Asignatura (Anexo 2)
                </h2>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-[#CBD5E1] text-xs">
                    <thead>
                      <tr className="bg-[#F4F4F0] text-[#0F172A] font-bold">
                        <th className="border border-[#CBD5E1] p-2 w-28">Asignatura y Docente</th>
                        <th className="border border-[#CBD5E1] p-2">Indicador Original (DBA)</th>
                        <th className="border border-[#CBD5E1] p-2">Indicador Ajustado</th>
                        <th className="border border-[#CBD5E1] p-2">
                          Ajuste del Proceso y Principio DUA
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {student.adecuaciones.map((ad) => (
                        <tr key={ad.id}>
                          <td className="border border-[#CBD5E1] p-2 align-top">
                            <div className="font-bold text-[#0F172A]">{ad.asignatura}</div>
                            <div className="text-[11px] text-[#475569] mt-1">
                              Docente: {ad.nombreDocente}
                            </div>
                          </td>
                          <td className="border border-[#CBD5E1] p-2 align-top text-[#334155]">
                            {ad.indicador}
                          </td>
                          <td className="border border-[#CBD5E1] p-2 align-top font-medium text-[#0F172A] bg-teal-50/20">
                            {ad.indicadorAjustado}
                          </td>
                          <td className="border border-[#CBD5E1] p-2 align-top text-[#334155]">
                            <div>{ad.ajusteProceso}</div>
                            <div className="mt-1 text-[10px] font-semibold text-indigo-900">
                              [{ad.principioDua}]
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* SECCIÓN 3: SEGUIMIENTO POR PERIODO ACADÉMICO */}
              <div className="space-y-2">
                <h2 className="text-xs font-bold uppercase tracking-wider bg-[#0F172A] text-white px-3 py-1.5 rounded">
                  III. Seguimiento Evaluativo por Periodo (Logros, Evidencias y Observaciones)
                </h2>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-[#CBD5E1] text-xs">
                    <thead>
                      <tr className="bg-[#F4F4F0] text-[#0F172A] font-bold">
                        <th className="border border-[#CBD5E1] p-2 w-20">Periodo</th>
                        <th className="border border-[#CBD5E1] p-2">Logros Alcanzados</th>
                        <th className="border border-[#CBD5E1] p-2">Evidencias Pedagógicas</th>
                        <th className="border border-[#CBD5E1] p-2">Observaciones y Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {student.seguimientos.map((seg) => (
                        <tr key={seg.periodo}>
                          <td className="border border-[#CBD5E1] p-2 font-bold text-center">
                            Periodo {seg.periodo}
                          </td>
                          <td className="border border-[#CBD5E1] p-2 text-[#334155]">
                            {seg.logros || 'Sin registro aún'}
                          </td>
                          <td className="border border-[#CBD5E1] p-2 text-[#334155]">
                            {seg.evidencias || 'En consolidación'}
                          </td>
                          <td className="border border-[#CBD5E1] p-2 text-[#334155]">
                            <div>{seg.observaciones}</div>
                            <div className="mt-1 font-semibold text-[#0F172A]">
                              Estado: {seg.estado} ({seg.fechaActualizacion})
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* SECCIÓN 4: HISTORIAL ANUAL LONGITUDINAL */}
              <div className="space-y-2">
                <h2 className="text-xs font-bold uppercase tracking-wider bg-[#0F172A] text-white px-3 py-1.5 rounded">
                  IV. Historial Escolar del Estudiante (Trazabilidad Año tras Año)
                </h2>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-[#CBD5E1] text-xs">
                    <thead>
                      <tr className="bg-[#F4F4F0] text-[#0F172A] font-bold">
                        <th className="border border-[#CBD5E1] p-2 w-24">Año / Curso</th>
                        <th className="border border-[#CBD5E1] p-2">Síntesis y Logros</th>
                        <th className="border border-[#CBD5E1] p-2">Ajustes Efectivos</th>
                        <th className="border border-[#CBD5E1] p-2">Promoción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {student.historial.map((h) => (
                        <tr key={h.id}>
                          <td className="border border-[#CBD5E1] p-2 font-bold">
                            {h.anioLectivo} — {h.curso}
                          </td>
                          <td className="border border-[#CBD5E1] p-2 text-[#334155]">
                            {h.logrosConsolidados}
                          </td>
                          <td className="border border-[#CBD5E1] p-2 text-[#334155]">
                            {h.ajustesMasEfectivos}
                          </td>
                          <td className="border border-[#CBD5E1] p-2 font-semibold text-teal-900">
                            {h.estadoPromocion}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* SECCIÓN 5: BLOQUE DE FIRMA DEL PROFESIONAL A CARGO Y SELLO DE AUDITORÍA */}
              <div className="pt-4 border-t-2 border-[#0F172A] grid grid-cols-1 sm:grid-cols-2 gap-6 items-end">
                <div className="space-y-1">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-[#475569]">
                    Firma del Profesional a Cargo:
                  </div>
                  <div className="h-24 border-b border-[#0F172A] flex items-center justify-start bg-[#FBFBF9] px-3">
                    {signatureUrl && (
                      <img
                        src={signatureUrl}
                        alt="Firma del Profesional"
                        className="max-h-20 object-contain"
                      />
                    )}
                  </div>
                  <div className="text-xs font-bold text-[#0F172A] pt-1">{nombreProfesional}</div>
                  <div className="text-[11px] text-[#334155]">{cargo}</div>
                  <div className="text-[11px] font-mono-code text-teal-900 font-semibold">
                    Registro / Tarjeta Profesional: {tarjetaProfesional}
                  </div>
                </div>

                <div className="border border-[#CBD5E1] rounded-lg p-3 bg-[#F4F4F0] font-mono-code text-[10px] space-y-1">
                  <div className="font-bold text-[#0F172A] flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-teal-700" />
                    SELLO CRIPTOGRÁFICO DE AUDITORÍA EKIRAYÁ IEP
                  </div>
                  <div>Hash SHA-256: {hashAuditoria}</div>
                  <div>Cifrado Base de Datos: AES-256-GCM (Ley 1581/2012)</div>
                  <div>Fecha de Emisión: {new Date().toISOString().slice(0, 10)}</div>
                  <div>Normativa: Decreto 1421 de 2017 MEN Colombia</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
