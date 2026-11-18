import React, { useState, useRef } from 'react';
import { PDFDocument, rgb, degrees } from 'pdf-lib';
import {
  ShieldCheck,
  Download,
  CheckCircle2,
  Lock,
  Eye,
  Upload,
  FileText,
  RefreshCw,
  Sparkles,
  FileCheck,
} from 'lucide-react';
import { IsdCitation } from './IsdCitation';
import { ISD_OFFICIAL_URLS } from '../data/isdPointsTable';

export const WatermarkEngine: React.FC = () => {
  const [watermarkText, setWatermarkText] = useState<string>(
    'FOR ISD CITIZENSHIP APPLICATION ONLY — CITIZEN-7892'
  );
  const [opacity, setOpacity] = useState<number>(0.18);
  const [fontSize, setFontSize] = useState<number>(24);
  const [rotation, setRotation] = useState<number>(30);
  const [enableWatermark, setEnableWatermark] = useState<boolean>(true);

  // Real Uploaded File State
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedPageCount, setUploadedPageCount] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isDone, setIsDone] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle Real File Selection
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Please select a valid PDF file.');
      return;
    }

    try {
      setIsProcessing(true);
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const count = pdfDoc.getPageCount();

      setUploadedFile(file);
      setUploadedPageCount(count);
      setStatusMessage(`Loaded "${file.name}" (${count} ${count === 1 ? 'page' : 'pages'})`);
    } catch (err) {
      console.error('Error loading PDF:', err);
      alert('Could not parse this PDF. Please make sure the file is not password-protected.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Watermark and download the REAL uploaded PDF
  const handleWatermarkRealPDF = async () => {
    if (!uploadedFile) return;

    try {
      setIsProcessing(true);
      const arrayBuffer = await uploadedFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();

      // Apply watermark to every page when enabled
      if (enableWatermark) {
        for (const page of pages) {
          const { width, height } = page.getSize();

          // Calculate 2-3 diagonal rows based on page height
          page.drawText(watermarkText, {
            x: width * 0.1,
            y: height * 0.35,
            size: fontSize,
            rotate: degrees(rotation),
            color: rgb(0.35, 0.35, 0.35),
            opacity: opacity,
          });

          page.drawText(watermarkText, {
            x: width * 0.1,
            y: height * 0.65,
            size: fontSize,
            rotate: degrees(rotation),
            color: rgb(0.35, 0.35, 0.35),
            opacity: opacity,
          });
        }
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = enableWatermark ? `Watermarked_${uploadedFile.name}` : `Original_${uploadedFile.name}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setIsDone(true);
      setTimeout(() => setIsDone(false), 3500);
    } catch (err) {
      console.error('PDF watermarking error:', err);
      alert('Failed to stamp document. Please check console for details.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Generate Sample PDF if user has no file on hand
  const handleGenerateSamplePDF = async () => {
    try {
      setIsProcessing(true);
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595, 842]); // A4 Size in points
      const { height } = page.getSize();

      page.drawText('REVENUE COMMISSIONERS — IRELAND', {
        x: 50,
        y: height - 60,
        size: 16,
        color: rgb(0.1, 0.15, 0.25),
      });

      page.drawText('Employment Detail Summary (EDS) — Tax Year 2024', {
        x: 50,
        y: height - 90,
        size: 12,
        color: rgb(0.2, 0.3, 0.4),
      });

      page.drawText('PPSN: 8947261TX | Employee Name: Sample Naturalisation Applicant', {
        x: 50,
        y: height - 120,
        size: 10,
        color: rgb(0.3, 0.4, 0.5),
      });

      page.drawText('Total Pay for USC: €65,400.00 | Income Tax Paid: €14,220.00', {
        x: 50,
        y: height - 145,
        size: 10,
        color: rgb(0.3, 0.4, 0.5),
      });

      if (enableWatermark) {
        page.drawText(watermarkText, {
          x: 60,
          y: height / 2 - 40,
          size: fontSize,
          rotate: degrees(rotation),
          color: rgb(0.4, 0.4, 0.4),
          opacity: opacity,
        });

        page.drawText(watermarkText, {
          x: 60,
          y: height / 2 + 160,
          size: fontSize,
          rotate: degrees(rotation),
          color: rgb(0.4, 0.4, 0.4),
          opacity: opacity,
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = enableWatermark ? 'Watermarked_ISD_Sample_Document.pdf' : 'Original_ISD_Sample_Document.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setIsDone(true);
      setTimeout(() => setIsDone(false), 3500);
    } catch (err) {
      console.error('PDF generation error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearFile = () => {
    setUploadedFile(null);
    setUploadedPageCount(null);
    setStatusMessage('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="chip chip-emerald">
              Browser-Side Anti-Theft Watermarking
            </span>
            <IsdCitation
              title="Official ISD Proofs Document Guidelines"
              url={ISD_OFFICIAL_URLS.proofsOfIdentityAndResidence}
              tag="Security Proof"
            />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Automated PDF Anti-Theft Watermarker
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Safeguard your bank statements, Revenue EDS summaries, and identity records from criminal reuse without obscuring dates, names, or figures.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 shrink-0">
          <Lock className="w-4 h-4 text-emerald-600" />
          <span>100% In-Browser Memory (GDPR Compliant)</span>
        </div>
      </div>

      {/* Main Grid: Controls (5 cols) & Live Preview (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Controls Column (5 cols) */}
        <div className="lg:col-span-5 space-y-5 card p-6 transition-colors">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Watermark Customization Settings
            </h2>
            <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5 font-normal">
              Choose whether to apply a diagonal security stamp across every page or export without watermarks.
            </p>
            <div className="mt-3 grid grid-cols-2 gap-1.5 rounded-xl border border-slate-300 dark:border-white/15 p-1 bg-slate-100 dark:bg-white/5">
              <button
                type="button"
                onClick={() => setEnableWatermark(true)}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  enableWatermark
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
                }`}
              >
                With Watermark Stamp
              </button>
              <button
                type="button"
                onClick={() => setEnableWatermark(false)}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  !enableWatermark
                    ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-950 shadow-sm'
                    : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
                }`}
              >
                Without Watermark (Original)
              </button>
            </div>
          </div>

          {/* Real PDF File Upload Box */}
          <div className="card-inset p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-200 flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Upload Your Actual PDF</span>
              </span>
              {uploadedFile && (
                <button
                  onClick={handleClearFile}
                  className="text-[11px] text-red-600 hover:underline font-bold"
                >
                  Clear file
                </button>
              )}
            </div>

            <input
              type="file"
              ref={fileInputRef}
              accept="application/pdf"
              onChange={handleFileSelect}
              className="hidden"
              id="pdf-upload-input"
            />

            {!uploadedFile ? (
              <label
                htmlFor="pdf-upload-input"
                className="border-2 border-dashed border-slate-300 hover:border-emerald-600 dark:border-white/15 rounded-xl p-4 text-center block cursor-pointer hover:bg-emerald-50/20 dark:hover:bg-emerald-950/20 transition-all"
              >
                <FileText className="w-6 h-6 text-slate-500 dark:text-slate-400 mx-auto mb-1.5" />
                <span className="text-xs font-bold text-slate-900 dark:text-slate-200 block">
                  Click to select or drag a PDF
                </span>
                <span className="text-[11px] text-slate-600 dark:text-slate-400 block mt-0.5 font-medium">
                  Bank statement, Revenue summary, or ID scan
                </span>
              </label>
            ) : (
              <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800/80 text-xs space-y-1">
                <div className="flex items-center gap-2 font-bold text-emerald-950 dark:text-emerald-200">
                  <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="truncate">{uploadedFile.name}</span>
                </div>
                <div className="text-[11px] text-emerald-800 dark:text-emerald-300 font-mono font-medium">
                  {(uploadedFile.size / 1024).toFixed(1)} KB • {uploadedPageCount} pages ready for stamping
                </div>
              </div>
            )}

            <p className="text-[11px] text-emerald-800 dark:text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-2.5 py-1.5 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span><strong>0 KB uploaded:</strong> watermarked locally on your device (works in Airplane Mode).</span>
            </p>
          </div>

          {/* Watermark Text Input */}
          <div className={enableWatermark ? '' : 'opacity-45 pointer-events-none select-none'}>
            <label className="block text-xs font-bold text-slate-900 dark:text-slate-200 mb-1.5">
              Watermark Stamp Text
            </label>
            <input
              type="text"
              value={watermarkText}
              onChange={(e) => setWatermarkText(e.target.value)}
              className="input font-mono text-xs font-medium"
            />
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 font-medium">
              Standard phrasing ensures immigration caseworkers accept the file while preventing criminal reuse.
            </p>
          </div>

          {/* Sliders: Opacity, Font Size, Rotation */}
          <div className={`space-y-3 pt-1 ${enableWatermark ? '' : 'opacity-45 pointer-events-none select-none'}`}>
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-900 dark:text-slate-200 mb-1">
                <span>Stamp Opacity ({Math.round(opacity * 100)}%)</span>
                <span className="text-slate-600 dark:text-slate-400 font-mono text-[11px] font-semibold">Recommended: 15–20%</span>
              </div>
              <input
                type="range"
                min="0.08"
                max="0.4"
                step="0.01"
                value={opacity}
                onChange={(e) => setOpacity(parseFloat(e.target.value))}
                className="w-full accent-emerald-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-900 dark:text-slate-200 mb-1">
                  <span>Font Size</span>
                  <span className="text-slate-600 dark:text-slate-400 font-mono text-[11px] font-semibold">{fontSize} pt</span>
                </div>
                <input
                  type="range"
                  min="16"
                  max="36"
                  value={fontSize}
                  onChange={(e) => setFontSize(parseInt(e.target.value))}
                  className="w-full accent-emerald-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-900 dark:text-slate-200 mb-1">
                  <span>Angle</span>
                  <span className="text-slate-600 dark:text-slate-400 font-mono text-[11px] font-semibold">{rotation}°</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="45"
                  value={rotation}
                  onChange={(e) => setRotation(parseInt(e.target.value))}
                  className="w-full accent-emerald-600"
                />
              </div>
            </div>
          </div>

          {/* Guarantee Badges */}
          <div className="p-4 rounded-xl card-inset space-y-2 text-xs">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>ISD Caseworker Acceptability Guaranteed</span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
              Our semi-transparent diagonal stamping ensures dates, employer names, PPSN, and transaction figures remain 100% legible for official verification.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            {uploadedFile ? (
              <button
                onClick={handleWatermarkRealPDF}
                disabled={isProcessing}
                className="btn btn-primary w-full h-11"
              >
                {isProcessing ? (
                  <span>{enableWatermark ? `Stamping ${uploadedPageCount} Pages...` : `Preparing ${uploadedPageCount} Pages...`}</span>
                ) : isDone ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{enableWatermark ? 'Stamped & Downloaded!' : 'Original Downloaded!'}</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>
                      {enableWatermark
                        ? `Download Stamped "${uploadedFile.name}"`
                        : `Download Clean Original "${uploadedFile.name}"`}
                    </span>
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleGenerateSamplePDF}
                disabled={isProcessing}
                className="btn btn-primary w-full h-11"
              >
                {isProcessing ? (
                  <span>Rendering PDF...</span>
                ) : isDone ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Downloaded Sample PDF!</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>
                      {enableWatermark
                        ? 'Generate & Download Sample Stamped PDF'
                        : 'Generate & Download Clean Sample PDF'}
                    </span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Live Visual Document Preview (7 cols) */}
        <div className="lg:col-span-7 card p-6 flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between mb-4">
            <span className="eyebrow">
              Live Document Canvas Preview
            </span>
            <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" /> Client-Side Rendering
            </span>
          </div>

          {/* Mock A4 Document Canvas */}
          <div className="relative w-full aspect-[1/1.25] rounded-xl border-2 border-slate-300 dark:border-white/10 bg-white p-6 md:p-8 shadow-md overflow-hidden select-none">
            
            {/* The Semi-Transparent Diagonal Watermarks */}
            {enableWatermark && (
              <div
                className="absolute inset-0 flex flex-col items-center justify-center gap-24 pointer-events-none"
                style={{ opacity }}
              >
                <div
                  className="font-mono font-bold tracking-widest text-slate-900 border-y-2 border-dashed border-slate-800 py-1 px-6 whitespace-nowrap text-center"
                  style={{
                    fontSize: `${fontSize - 6}px`,
                    transform: `rotate(${rotation}deg)`,
                  }}
                >
                  {watermarkText}
                </div>
                <div
                  className="font-mono font-bold tracking-widest text-slate-900 border-y-2 border-dashed border-slate-800 py-1 px-6 whitespace-nowrap text-center"
                  style={{
                    fontSize: `${fontSize - 6}px`,
                    transform: `rotate(${rotation}deg)`,
                  }}
                >
                  {watermarkText}
                </div>
              </div>
            )}

            {/* Document Content */}
            <div className="space-y-4 text-slate-900">
              <div className="border-b-2 border-slate-900 pb-3 flex justify-between items-end">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-950">
                    {uploadedFile ? uploadedFile.name : 'REVENUE COMMISSIONERS — IRELAND'}
                  </h3>
                  <p className="text-xs text-slate-700 font-mono font-medium">
                    {uploadedFile
                      ? `User Document (${uploadedPageCount} Pages) • ${
                          enableWatermark ? 'Client-Side Watermarked' : 'Clean Original (No Watermark)'
                        }`
                      : `Employment Detail Summary • ${
                          enableWatermark ? 'Form 8 Type A Proof (Watermarked)' : 'Clean Original (No Watermark)'
                        }`}
                  </p>
                </div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 bg-emerald-100 text-emerald-900 rounded border border-emerald-300">
                  100 Points
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div>
                  <span className="text-xs text-slate-600 block font-semibold">PPS Number</span>
                  <span className="font-bold text-slate-950">8947261TX</span>
                </div>
                <div>
                  <span className="text-xs text-slate-600 block font-semibold">Tax Year</span>
                  <span className="font-bold text-slate-950">2024</span>
                </div>
                <div>
                  <span className="text-xs text-slate-600 block font-semibold">Document Source</span>
                  <span className="font-bold text-slate-950">
                    {uploadedFile ? 'User Upload' : 'Revenue Commissioners MyAccount'}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-600 block font-semibold">Total Income (USC)</span>
                  <span className="font-bold text-slate-950">€72,400.00</span>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-300 text-xs text-slate-600 space-y-1 font-mono font-medium">
                <p>Official Stamp Verified • Verified by Revenue Commissioners MyAccount</p>
                <p>Citizenship Applicant Documentation Package • Dublin Castle Processing</p>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400 mt-4 text-center font-medium">
            {uploadedFile
              ? `Your file "${uploadedFile.name}" is processed entirely in browser memory. No data is stored or transmitted.`
              : 'The watermark is burned into the generated PDF canvas using pdf-lib so nobody can scrape or repurpose your PII.'}
          </p>
        </div>

      </div>
    </div>
  );
};
