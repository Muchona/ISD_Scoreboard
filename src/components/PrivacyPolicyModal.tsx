import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  FileText,
  Trash2,
  Download,
  CheckCircle2,
  AlertTriangle,
  X,
  ServerOff,
  Cpu,
  EyeOff,
  Scale,
  ExternalLink,
  ChevronRight,
  HelpCircle,
} from 'lucide-react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenTerms?: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({
  isOpen,
  onClose,
  onOpenTerms,
}) => {
  const [activeSection, setActiveSection] = useState<'architecture' | 'rights' | 'retention' | 'legal'>('architecture');

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="privacy-modal-title"
    >
      {/* Background click dismissal */}
      <div
        className="fixed inset-0 -z-10"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Main Modal Card */}
      <div className="relative card w-full max-w-4xl max-h-[92vh] flex flex-col p-0 shadow-2xl border border-slate-300 dark:border-white/15 overflow-hidden animate-in zoom-in-95 duration-200 bg-white dark:bg-obsidian-900">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-white/[0.02] flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <span className="chip chip-emerald text-[11px] font-bold">
                EU GDPR & Irish DPA 2018 Compliant
              </span>
              <span className="hidden sm:inline-flex chip bg-slate-100 text-slate-700 dark:bg-white/5 dark:text-slate-300 text-[10px] font-mono">
                Version 2.4 • Effective Nov 2026
              </span>
            </div>
            <h2 id="privacy-modal-title" className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Data Protection & Privacy Policy
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
              CitizenScore.ie is engineered around a radical <strong className="text-emerald-600 dark:text-emerald-400">Zero-Knowledge Client-Side Architecture</strong>. Your sensitive documents, PPSN, and naturalisation calculations stay strictly in your device memory.
            </p>
          </div>

          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-200/50 dark:hover:bg-white/10 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-white/10 px-5 sm:px-6 bg-white dark:bg-obsidian-900 overflow-x-auto no-scrollbar gap-2 sm:gap-4 py-2">
          <button
            onClick={() => setActiveSection('architecture')}
            className={`flex items-center gap-1.5 py-2 px-3 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
              activeSection === 'architecture'
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ServerOff className="w-3.5 h-3.5" />
            <span>1. Zero-Knowledge Architecture</span>
          </button>

          <button
            onClick={() => setActiveSection('rights')}
            className={`flex items-center gap-1.5 py-2 px-3 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
              activeSection === 'rights'
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>2. Your GDPR Rights</span>
          </button>

          <button
            onClick={() => setActiveSection('retention')}
            className={`flex items-center gap-1.5 py-2 px-3 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
              activeSection === 'retention'
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>3. Retention & Deletion</span>
          </button>

          <button
            onClick={() => setActiveSection('legal')}
            className={`flex items-center gap-1.5 py-2 px-3 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
              activeSection === 'legal'
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>4. Legal Basis & Contact</span>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          
          {/* SECTION 1: Zero-Knowledge Architecture */}
          {activeSection === 'architecture' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="card-inset p-4 sm:p-5 border-emerald-200 dark:border-emerald-800/40 bg-emerald-50/40 dark:bg-emerald-950/20">
                <div className="flex items-start gap-3">
                  <Cpu className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                      Core Pillar: Zero-Knowledge Client-Side Execution
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                      Unlike traditional immigration portals or online PDF converters, CitizenScore.ie was purposefully architected so that your highly private legal documents <strong>never touch an external application server</strong>.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="card-inset p-4 space-y-2">
                  <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xs uppercase tracking-wider">
                    <EyeOff className="w-4 h-4 text-emerald-600" />
                    <span>In-Browser PDF Watermarking</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    When you upload utility bills, bank statements, or revenue notices to the Watermark Engine, the binary manipulation runs 100% inside your browser’s local WebAssembly/Canvas memory via <code className="text-emerald-600 dark:text-emerald-400">pdf-lib</code>. The files are never transmitted across the network.
                  </p>
                </div>

                <div className="card-inset p-4 space-y-2">
                  <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xs uppercase tracking-wider">
                    <Lock className="w-4 h-4 text-emerald-600" />
                    <span>PPSN & IRP Sandboxing</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Your Irish Personal Public Service Number (PPSN), Irish Residence Permit (IRP) card details, and passport numbers are processed solely in local memory for generating the official ISD watermarking string and Form 8 dossier checklists.
                  </p>
                </div>

                <div className="card-inset p-4 space-y-2">
                  <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xs uppercase tracking-wider">
                    <ServerOff className="w-4 h-4 text-emerald-600" />
                    <span>Reckonable Days Math</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Stamp 1, Stamp 1G, and Stamp 4 residency period chronologies, including the mandatory 365-day continuous residency audit prior to application, are calculated instantly on your local CPU.
                  </p>
                </div>

                <div className="card-inset p-4 space-y-2">
                  <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xs uppercase tracking-wider">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Zero Data Monetisation</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    CitizenScore.ie does not sell, lease, barter, or distribute your telemetry or immigration profile to third-party data brokers, insurers, advertising networks, or immigration intermediaries.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02] space-y-2 text-xs">
                <span className="font-bold text-slate-900 dark:text-white block">
                  Summary of Data Categories Processed Locally:
                </span>
                <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
                  <li><strong>Residency Stamp Logs:</strong> Stamp classifications (1, 1G, 4, etc.) and date spans.</li>
                  <li><strong>Scorecard Point Ledger:</strong> Document checklist categories (Type A and Type B identity & residence points).</li>
                  <li><strong>Account Credentials:</strong> Full legal name and email address for session authentication and Pro license status.</li>
                  <li><strong>Preferences:</strong> Dark/light mode theme selection and cookie choice.</li>
                </ul>
              </div>
            </div>
          )}

          {/* SECTION 2: GDPR User Rights */}
          {activeSection === 'rights' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                  Your Statutory Rights under EU GDPR (Articles 15–22)
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                  As an EU resident or individual whose data is processed within Ireland, you are invested with comprehensive, non-derogable rights under Regulation (EU) 2016/679:
                </p>
              </div>

              <div className="space-y-3">
                <div className="card-inset p-3.5 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    15
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-xs">Right of Access (Article 15)</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                      You have the right to request a full copy of all personal data held about you. Because CitizenScore stores your naturalisation dossier in your browser, you can export your entire state instantly via JSON at any time.
                    </p>
                  </div>
                </div>

                <div className="card-inset p-3.5 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    16
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-xs">Right to Rectification (Article 16)</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                      You have the absolute right to correct any inaccurate personal details, including legal name, current stamp type, and target naturalisation year directly from the Applicant Profile Settings modal.
                    </p>
                  </div>
                </div>

                <div className="card-inset p-3.5 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-md bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    17
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-xs">Right to Erasure / "To Be Forgotten" (Article 17)</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                      You can instantly delete all your naturalisation records, saved calculations, and cached session tokens by clicking <strong>'Delete Vault Data'</strong> in your settings. Local storage is immediately wiped.
                    </p>
                  </div>
                </div>

                <div className="card-inset p-3.5 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    20
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-xs">Right to Data Portability (Article 20)</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                      You can export your reckonable day periods, 150-point scorecard checklist, and profile configuration in machine-readable JSON format for transfer to your legal counsel or immigration solicitor.
                    </p>
                  </div>
                </div>

                <div className="card-inset p-3.5 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    77
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-xs">Right to Lodge a Supervisory Complaint (Article 77)</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                      You have the right to lodge a complaint with the lead supervisory authority: the <strong>Data Protection Commission (DPC)</strong>, 21 Fitzwilliam Square South, Dublin 2, D02 RD28, Ireland (Website: <a href="https://www.dataprotection.ie" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline font-semibold">dataprotection.ie</a>).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: Retention & Deletion */}
          {activeSection === 'retention' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                  Data Retention & One-Click Account Deletion
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                  We subscribe strictly to the GDPR principle of <em>Storage Limitation (Article 5(1)(e))</em>. We retain data only as long as necessary to provide auditing services to you.
                </p>
              </div>

              <div className="card-inset p-4 sm:p-5 border-amber-200 dark:border-amber-800/40 bg-amber-50/40 dark:bg-amber-950/20 space-y-3">
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-sm">
                  <Trash2 className="w-4 h-4 shrink-0" />
                  <span>How to Permanently Wipe Your Data</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  You can purge all records from CitizenScore.ie at any second. Navigate to <strong>Applicant Profile & Vault Settings</strong> in the top-right user menu and select <strong>'Delete Vault Data'</strong>. This action triggers an atomic purge of:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                  <div className="p-2 rounded bg-white/70 dark:bg-black/30 border border-slate-200 dark:border-white/5">
                    localStorage.isd_user
                  </div>
                  <div className="p-2 rounded bg-white/70 dark:bg-black/30 border border-slate-200 dark:border-white/5">
                    localStorage.isd_theme
                  </div>
                  <div className="p-2 rounded bg-white/70 dark:bg-black/30 border border-slate-200 dark:border-white/5">
                    localStorage.isd_cookie_consent
                  </div>
                  <div className="p-2 rounded bg-white/70 dark:bg-black/30 border border-slate-200 dark:border-white/5">
                    Cached session tokens
                  </div>
                  <div className="p-2 rounded bg-white/70 dark:bg-black/30 border border-slate-200 dark:border-white/5">
                    Reckonable calculations
                  </div>
                  <div className="p-2 rounded bg-white/70 dark:bg-black/30 border border-slate-200 dark:border-white/5">
                    Scorecard checklist state
                  </div>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <h4 className="font-bold text-slate-900 dark:text-white">Pro Subscription Billing Data:</h4>
                <p className="text-slate-600 dark:text-slate-400">
                  If you purchase a CitizenScore Pro subscription (€5.00/month), your payment transaction is tokenized directly via Stripe Ireland / Stripe Payments Europe Ltd (a regulated PCI-DSS Level 1 Service Provider). CitizenScore.ie never sees or holds your full credit card number, expiration date, or CVC code on our infrastructure.
                </p>
                <p className="text-slate-600 dark:text-slate-400">
                  You can terminate your subscription anytime with 1 click in your Profile Settings; no recurring charges will occur post-cancellation.
                </p>
              </div>
            </div>
          )}

          {/* SECTION 4: Legal Basis & Contact */}
          {activeSection === 'legal' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                  Lawful Basis & Data Controller Information
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                  We process personal data strictly pursuant to Article 6 and Article 9 of the General Data Protection Regulation:
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-white/10 space-y-1">
                  <span className="font-bold text-slate-900 dark:text-white block">
                    1. Article 6(1)(a) GDPR — Explicit Consent
                  </span>
                  <p className="text-slate-600 dark:text-slate-400">
                    You provide explicit consent when checking the consent box during registration and by configuring your reckonable residency history in the calculation interface.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-white/10 space-y-1">
                  <span className="font-bold text-slate-900 dark:text-white block">
                    2. Article 6(1)(b) GDPR — Performance of Contract
                  </span>
                  <p className="text-slate-600 dark:text-slate-400">
                    Processing necessary to deliver the Master Dossier audit features, high-resolution PDF watermarking, and continuous residency compliance monitoring associated with CitizenScore Pro licenses.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-white/10 space-y-1">
                  <span className="font-bold text-slate-900 dark:text-white block">
                    3. Article 9(2)(a) GDPR — Special Category Data Safeguards
                  </span>
                  <p className="text-slate-600 dark:text-slate-400">
                    To the extent that naturalisation applications touch on national origin or biometric travel documents, such artifacts are restricted exclusively to client-side ephemeral memory, preventing any centralized disclosure or secondary processing.
                  </p>
                </div>
              </div>

              <div className="card-inset p-4 space-y-2 text-xs">
                <span className="font-bold text-slate-900 dark:text-white block text-sm">
                  Data Controller & Privacy Inquiries:
                </span>
                <p className="text-slate-600 dark:text-slate-400">
                  CitizenScore.ie Operations & Compliance Directorate<br />
                  Silicon Docks, Dublin 2, Ireland<br />
                  Official Compliance Email: <a href="mailto:privacy@citizenscore.ie" className="text-emerald-600 dark:text-emerald-400 underline font-semibold">privacy@citizenscore.ie</a>
                </p>
                <p className="text-[11px] text-slate-500 pt-1">
                  Response SLA: Under statutory GDPR Article 12, all verified Data Subject Access Requests (DSAR) and erasure notices are resolved within thirty (30) calendar days.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-white/[0.02] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Encrypted EU Privacy Standards Applied</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            {onOpenTerms && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenTerms();
                }}
                className="btn btn-sm btn-ghost text-xs text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                <span>View Terms of Service</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="btn btn-sm btn-primary text-xs font-bold px-4"
            >
              I Understand & Acknowledge
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
