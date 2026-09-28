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
  Upload,
  FileImage,
  FileDown,
  Trash2,
} from 'lucide-react';
import { FirmaProfesional, RoleProfile, StudentPIAR } from '../types/piar';
import { generateAuditHash } from '../utils/crypto';
import {
  clearPreloadedSignature,
  EKIRAYA_LOGO_LOCAL_FALLBACK,
  EKIRAYA_LOGO_URL,
  exportOfficialPiarPdf,
  generateCalligraphicSignatureSvg,
  getPreloadedSignature,
  processUploadedSignatureFileToPng,
  savePreloadedSignature,
} from '../utils/exportUtils';

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
  const preloadedSig = getPreloadedSignature();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawnStroke, setHasDrawnStroke] = useState(false);
  const [uploadedPngDataUrl, setUploadedPngDataUrl] = useState<string | null>(() => {
    if (preloadedSig?.firmaPngDataUrl) return preloadedSig.firmaPngDataUrl;
    if (student.firmaProfesional?.firmaDataUrl?.startsWith('data:image/png')) {
      return student.firmaProfesional.firmaDataUrl;
    }
    return null;
  });
  const [uploadedFileName, setUploadedFileName] = useState<string>(
    preloadedSig?.fileName ||
      (student.firmaProfesional?.firmaDataUrl?.startsWith('data:image/png')
        ? 'firma_guardada.png'
        : '')
  );
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [pdfDownloadedBanner, setPdfDownloadedBanner] = useState(false);

  const [nombreProfesional, setNombreProfesional] = useState(
    student.firmaProfesional?.nombreProfesional ||
      preloadedSig?.nombreProfesional ||
      (roleProfile.canSignAuditReport
        ? roleProfile.userName
        : 'Dra. Valentina Morales Pineda')
  );
  const [cargo, setCargo] = useState(
    student.firmaProfesional?.cargo ||
      preloadedSig?.cargo ||
      'Psicóloga Orientadora Escolar — Líder de Inclusión (Decreto 1421)'
  );
  const [tarjetaProfesional, setTarjetaProfesional] = useState(
    student.firmaProfesional?.tarjetaProfesional ||
      preloadedSig?.tarjetaProfesional ||
      'T.P. 148920 COLPSIC'
  );
  const [institucion, setInstitucion] = useState(
    student.firmaProfesional?.institucion ||
      preloadedSig?.institucion ||
      'Institución Educativa Ekirayá — Aprobación Oficial MEN'
  );
  const [hashAuditoria, setHashAuditoria] = useState(
    student.firmaProfesional?.hashAuditoria || 'SHA256-9F8A4C12-7E3B1109-4D2C88A1'
  );
  const [signatureUrl, setSignatureUrl] = useState<string>(() => {
    if (preloadedSig?.firmaPngDataUrl) return preloadedSig.firmaPngDataUrl;
    if (student.firmaProfesional?.firmaDataUrl) return student.firmaProfesional.firmaDataUrl;
    return generateCalligraphicSignatureSvg(nombreProfesional, tarjetaProfesional);
  });
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

  // Manejar carga de archivo .PNG de firma
  const handlePngFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/') && !file.name.toLowerCase().endsWith('.png')) {
      setUploadError('Por favor selecciona un archivo de imagen válido (.png recomendado).');
      return;
    }

    try {
      const pngDataUrl = await processUploadedSignatureFileToPng(file);
      setUploadedPngDataUrl(pngDataUrl);
      setUploadedFileName(file.name);
      setHasDrawnStroke(false);
      setSignatureUrl(pngDataUrl);

      // Guardar firma pre-cargada en el navegador para todos los informes oficiales
      savePreloadedSignature({
        firmaPngDataUrl: pngDataUrl,
        fileName: file.name,
        nombreProfesional,
        cargo,
        tarjetaProfesional,
        institucion,
        updatedAt: new Date().toISOString(),
      });

      // También actualizar la firma en el expediente actual
      const nuevaFirma: FirmaProfesional = {
        nombreProfesional,
        cargo,
        tarjetaProfesional,
        institucion,
        firmaDataUrl: pngDataUrl,
        fechaFirma: new Date().toISOString().slice(0, 10),
        hashAuditoria,
      };
      onSaveSignature(student.id, nuevaFirma);
      setSignatureSavedBanner(true);
      setTimeout(() => setSignatureSavedBanner(false), 3500);
    } catch {
      setUploadError('Error al procesar el archivo .png de la firma.');
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveUploadedPng = () => {
    clearPreloadedSignature();
    setUploadedPngDataUrl(null);
    setUploadedFileName('');
    const fallback = generateCalligraphicSignatureSvg(nombreProfesional, tarjetaProfesional);
    setSignatureUrl(fallback);
  };

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
      const drawnPng = canvas.toDataURL('image/png');
      setSignatureUrl(drawnPng);
      setUploadedPngDataUrl(null);
    }
  };

  const handleClearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawnStroke(false);
    if (uploadedPngDataUrl) {
      setSignatureUrl(uploadedPngDataUrl);
    } else {
      setSignatureUrl(generateCalligraphicSignatureSvg(nombreProfesional, tarjetaProfesional));
    }
  };

  const buildCurrentFirmaObject = (): FirmaProfesional => {
    let finalSigUrl = signatureUrl;
    if (uploadedPngDataUrl) {
      finalSigUrl = uploadedPngDataUrl;
    } else if (hasDrawnStroke && canvasRef.current) {
      finalSigUrl = canvasRef.current.toDataURL('image/png');
    } else if (!finalSigUrl) {
      finalSigUrl = generateCalligraphicSignatureSvg(nombreProfesional, tarjetaProfesional);
    }

    return {
      nombreProfesional,
      cargo,
      tarjetaProfesional,
      institucion,
      firmaDataUrl: finalSigUrl,
      fechaFirma: new Date().toISOString().slice(0, 10),
      hashAuditoria,
    };
  };

  const handleApplyAndSealSignature = () => {
    const nuevaFirma = buildCurrentFirmaObject();
    setSignatureUrl(nuevaFirma.firmaDataUrl);

    if (uploadedPngDataUrl) {
      savePreloadedSignature({
        firmaPngDataUrl: uploadedPngDataUrl,
        fileName: uploadedFileName || 'firma_profesional.png',
        nombreProfesional,
        cargo,
        tarjetaProfesional,
        institucion,
        updatedAt: new Date().toISOString(),
      });
    }

    onSaveSignature(student.id, nuevaFirma);
    setSignatureSavedBanner(true);
    setTimeout(() => setSignatureSavedBanner(false), 3500);
  };

  const handleExportOfficialPdf = async () => {
    setIsExportingPdf(true);
    try {
      const nuevaFirma = buildCurrentFirmaObject();
      setSignatureUrl(nuevaFirma.firmaDataUrl);
      onSaveSignature(student.id, nuevaFirma);

      if (uploadedPngDataUrl) {
        savePreloadedSignature({
          firmaPngDataUrl: uploadedPngDataUrl,
          fileName: uploadedFileName || 'firma_profesional.png',
          nombreProfesional,
          cargo,
          tarjetaProfesional,
          institucion,
          updatedAt: new Date().toISOString(),
        });
      }

      await exportOfficialPiarPdf(student, nuevaFirma);
      setPdfDownloadedBanner(true);
      setTimeout(() => setPdfDownloadedBanner(false), 4500);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handlePrintBrowser = () => {
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
          <div className="flex items-center gap-3">
            <img
              src={EKIRAYA_LOGO_URL}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = EKIRAYA_LOGO_LOCAL_FALLBACK;
              }}
              alt="Logo Colegio Ekirayá Montessori"
              className="h-10 w-auto object-contain bg-white px-2 py-1 rounded-lg border border-[#E2E8F0] shadow-2xs shrink-0"
            />
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#0F172A] font-serif-editorial">
                Informe Oficial de Auditoría PIAR / Plan Excepcional (Descarga Directa .PDF)
              </h2>
              <p className="text-xs text-[#64748B]">
                Carga tu firma previamente en formato <strong>.PNG</strong> y descarga el PDF Oficial con logo institucional y sello SHA-256
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs sm:text-sm font-semibold transition cursor-pointer"
            >
              <Upload className="w-4 h-4 text-amber-700" />
              {uploadedPngDataUrl ? 'Cambiar Firma .PNG' : '1. Cargar Firma (.PNG)'}
            </button>

            <button
              type="button"
              disabled={isExportingPdf}
              onClick={handleExportOfficialPdf}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0F766E] hover:bg-[#115E59] disabled:opacity-60 text-white text-xs sm:text-sm font-semibold shadow-xs transition cursor-pointer"
            >
              <FileDown className="w-4 h-4" />
              {isExportingPdf ? 'Generando PDF Oficial...' : '2. Exportar PDF Oficial (.pdf)'}
            </button>

            <button
              type="button"
              onClick={handlePrintBrowser}
              title="Imprimir desde el navegador"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white hover:bg-slate-50 text-[#0F172A] border border-[#CBD5E1] text-xs font-semibold transition cursor-pointer"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              Imprimir
            </button>

            <button
              type="button"
              onClick={handleDownloadStandaloneAuditDocument}
              title="Descargar versión HTML auto-imprimible"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white hover:bg-slate-50 text-[#0F172A] border border-[#CBD5E1] text-xs font-semibold transition cursor-pointer"
            >
              <Download className="w-4 h-4 text-teal-700" />
              HTML
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

        {pdfDownloadedBanner && (
          <div className="no-print bg-emerald-700 text-white px-5 py-2 text-xs font-semibold flex items-center justify-between">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              Archivo PDF Oficial (.pdf) generado y descargado correctamente con la firma .PNG incrustada.
            </span>
            <span className="font-mono text-[11px] opacity-90">
              Informe_Oficial_PIAR_{student.nombresApellidos.replace(/\s+/g, '_')}_{student.anioLectivo}.pdf
            </span>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Panel Izquierdo (No se imprime): Módulo de Carga de Firma .PNG y Datos del Profesional */}
          <div className="no-print lg:col-span-4 space-y-4">
            <div className="bg-white border border-[#CBD5E1] rounded-xl p-4 space-y-3.5 shadow-2xs">
              <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2.5">
                <div className="flex items-center gap-2">
                  <PenTool className="w-4 h-4 text-[#0F766E]" />
                  <h3 className="text-sm font-bold text-[#0F172A]">
                    Firma del Profesional (.PNG o Trazo)
                  </h3>
                </div>
                <span className="text-[10px] font-mono-code px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Auditoría MEN
                </span>
              </div>

              {signatureSavedBanner && (
                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  Firma .PNG pre-cargada y aplicada al expediente oficial.
                </div>
              )}

              {/* PASO 1: CARGAR FIRMA PREVIAMENTE COMO ARCHIVO .PNG */}
              <div className="p-3 rounded-xl bg-teal-50/70 border border-teal-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-teal-950 flex items-center gap-1.5">
                    <FileImage className="w-4 h-4 text-teal-700" />
                    Paso 1: Cargar Firma en archivo .PNG
                  </span>
                  {uploadedPngDataUrl && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      Activa
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Sube tu firma escaneada o digital en formato <strong>.png</strong> (idealmente con fondo transparente o blanco). Quedará guardada para todos tus reportes PDF.
                </p>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".png,image/png,image/jpeg,image/webp"
                  onChange={handlePngFileUpload}
                  className="hidden"
                />

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 inline-flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-white hover:bg-teal-50 text-teal-900 border border-teal-300 text-xs font-semibold shadow-2xs transition cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-teal-700" />
                    {uploadedPngDataUrl
                      ? 'Reemplazar archivo .PNG'
                      : 'Seleccionar archivo de firma (.png)'}
                  </button>

                  {uploadedPngDataUrl && (
                    <button
                      type="button"
                      onClick={handleRemoveUploadedPng}
                      title="Quitar firma .PNG cargada"
                      className="p-2 rounded-lg bg-white hover:bg-rose-50 text-slate-500 hover:text-rose-700 border border-slate-200 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {uploadError && (
                  <div className="text-[11px] text-rose-700 font-medium bg-rose-50 px-2.5 py-1.5 rounded border border-rose-200">
                    {uploadError}
                  </div>
                )}

                {uploadedPngDataUrl && (
                  <div className="bg-white border border-teal-200 rounded-lg p-2 flex flex-col items-center">
                    <img
                      src={uploadedPngDataUrl}
                      alt="Vista previa firma PNG"
                      className="max-h-16 object-contain"
                    />
                    <span className="text-[10px] font-mono text-teal-800 mt-1 truncate max-w-full">
                      ✓ {uploadedFileName || 'firma_profesional.png'} (Lista para PDF)
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#334155] mb-1">
                  Nombre Completo del Profesional
                </label>
                <input
                  type="text"
                  value={nombreProfesional}
                  onChange={(e) => {
                    setNombreProfesional(e.target.value);
                    if (!hasDrawnStroke && !uploadedPngDataUrl) {
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
                    if (!hasDrawnStroke && !uploadedPngDataUrl) {
                      setSignatureUrl(
                        generateCalligraphicSignatureSvg(nombreProfesional, e.target.value)
                      );
                    }
                  }}
                  className="w-full px-3 py-1.5 rounded-lg border border-[#CBD5E1] text-xs font-mono-code text-[#0F172A]"
                />
              </div>

              {/* Opción alternativa: Lienzo de firma manuscrita */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-[#334155]">
                    O traza tu firma manuscrita aquí:
                  </label>
                  <button
                    type="button"
                    onClick={handleClearCanvas}
                    className="inline-flex items-center gap-1 text-[11px] text-slate-600 hover:text-slate-900 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Limpiar lienzo
                  </button>
                </div>
                <div className="border border-dashed border-[#94A3B8] rounded-lg bg-[#FBFBF9] overflow-hidden">
                  <canvas
                    ref={canvasRef}
                    width={320}
                    height={95}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={endDrawing}
                    onMouseLeave={endDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={endDrawing}
                    className="w-full h-[95px] cursor-crosshair touch-none"
                  />
                </div>
              </div>

              <div className="pt-1 space-y-2">
                <button
                  type="button"
                  onClick={handleApplyAndSealSignature}
                  className="w-full py-2 px-4 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
                >
                  Guardar Firma y Sello SHA-256 en el Expediente
                </button>

                <button
                  type="button"
                  disabled={isExportingPdf}
                  onClick={handleExportOfficialPdf}
                  className="w-full py-2.5 px-4 rounded-lg bg-[#0F766E] hover:bg-[#115E59] disabled:opacity-60 text-white text-xs font-bold shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FileDown className="w-4 h-4" />
                  {isExportingPdf
                    ? 'Generando PDF Oficial...'
                    : 'Descargar PDF Oficial con Firma (.pdf)'}
                </button>
              </div>
            </div>

            <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 space-y-2 text-xs text-[#475569]">
              <div className="font-bold text-[#0F172A] flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-teal-700" />
                Validez de Auditoría Secretaría de Educación
              </div>
              <p>
                Este documento integra los <strong>Anexos 1, 2 y 3 del Decreto 1421 de 2017</strong>, el registro de adecuaciones por asignatura, el seguimiento por periodos y la firma profesional en <strong>.PNG</strong>.
              </p>
            </div>
          </div>

          {/* Panel Derecho: Hoja Oficial de Auditoría (Vista Previa en Tiempo Real) */}
          <div className="lg:col-span-8">
            <div
              id="printable-audit-sheet"
              className="audit-document-sheet bg-white border border-[#CBD5E1] rounded-xl p-6 sm:p-8 shadow-md space-y-6 text-[#0F172A]"
            >
              {/* Membrete Institucional Oficial con Logo Colegio Ekirayá Montessori */}
              <div className="border-b-2 border-[#0F172A] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="bg-white border border-[#CBD5E1] rounded-xl px-3 py-2 flex items-center justify-center shrink-0 shadow-2xs">
                    <img
                      src={EKIRAYA_LOGO_URL}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = EKIRAYA_LOGO_LOCAL_FALLBACK;
                      }}
                      alt="Logo Colegio Ekirayá Montessori"
                      className="h-14 sm:h-16 w-auto object-contain"
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="text-[11px] font-bold uppercase tracking-widest text-[#0F766E]">
                      República de Colombia • Ministerio de Educación Nacional
                    </div>
                    <h1 className="text-lg sm:text-xl font-bold font-serif-editorial text-[#0F172A] leading-snug">
                      {student.esDesempenoSuperior
                        ? 'PLAN INDIVIDUAL DE ENRIQUECIMIENTO CURRICULAR Y TALENTOS EXCEPCIONALES'
                        : 'PLAN INDIVIDUAL DE AJUSTES RAZONABLES (PIAR — DECRETO 1421 DE 2017)'}
                    </h1>
                    <div className="text-xs text-[#475569] font-medium">
                      {institucion} • Colegio Ekirayá Montessori
                    </div>
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
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-[#475569] flex items-center justify-between">
                    <span>Firma del Profesional a Cargo:</span>
                    {uploadedPngDataUrl && (
                      <span className="no-print text-[10px] font-mono text-teal-700">
                        [Archivo .PNG Cargado]
                      </span>
                    )}
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
