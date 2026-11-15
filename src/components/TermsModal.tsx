import React, { useState, useEffect } from 'react';
import {
  FileText,
  AlertTriangle,
  Scale,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  X,
  ExternalLink,
  ChevronRight,
  HelpCircle,
  Clock,
  Landmark,
} from 'lucide-react';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPrivacy?: () => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({
  isOpen,
  onClose,
  onOpenPrivacy,
}) => {
  const [activeTab, setActiveTab] = useState<'disclaimer' | 'subscription' | 'obligations' | 'legal'>('disclaimer');

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
      aria-labelledby="terms-modal-title"
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
                <Scale className="w-5 h-5" />
              </span>
              <span className="chip chip-emerald text-[11px] font-bold">
                Terms of Service & Usage Directives
              </span>
              <span className="hidden sm:inline-flex chip bg-slate-100 text-slate-700 dark:bg-white/5 dark:text-slate-300 text-[10px] font-mono">
                Jurisdiction: Ireland (EU)
              </span>
            </div>
            <h2 id="terms-modal-title" className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              CitizenScore.ie Terms of Service
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
              Please review these legally binding terms governing your access to CitizenScore.ie, our naturalisation calculator, 150-point scorecard vault, and PDF watermarking utilities.
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
            onClick={() => setActiveTab('disclaimer')}
            className={`flex items-center gap-1.5 py-2 px-3 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'disclaimer'
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Landmark className="w-3.5 h-3.5" />
            <span>1. Statutory Disclaimers</span>
          </button>

          <button
            onClick={() => setActiveTab('subscription')}
            className={`flex items-center gap-1.5 py-2 px-3 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'subscription'
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>2. Pro Subscription (€5/mo)</span>
          </button>

          <button
            onClick={() => setActiveTab('obligations')}
            className={`flex items-center gap-1.5 py-2 px-3 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'obligations'
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>3. User Responsibilities</span>
          </button>

          <button
            onClick={() => setActiveTab('legal')}
            className={`flex items-center gap-1.5 py-2 px-3 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'legal'
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>4. Liability & Jurisdiction</span>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          
          {/* TAB 1: Statutory Disclaimers */}
          {activeTab === 'disclaimer' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="p-4 sm:p-5 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50/60 dark:bg-red-950/30 space-y-3">
                <div className="flex items-center gap-2 text-red-800 dark:text-red-300 font-extrabold text-sm sm:text-base">
                  <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
                  <span>Mandatory Statutory Disclaimer: Non-Governmental Entity</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  <strong>CitizenScore.ie is an independent educational companion and digital auditing software platform.</strong> CitizenScore.ie is <strong>NOT</strong> affiliated with, operated by, endorsed by, or in any way officially connected to the <em>Department of Justice</em>, <em>Immigration Service Delivery (ISD)</em>, <em>An Garda Síochána</em>, or any agency of the Government of Ireland.
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Official immigration information and statutory application portals can only be accessed directly at <a href="https://www.irishimmigration.ie" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline font-semibold inline-flex items-center gap-0.5">irishimmigration.ie <ExternalLink className="w-3 h-3 inline" /></a>.
                </p>
              </div>

              <div className="card-inset p-4 sm:p-5 border-amber-200 dark:border-amber-800/40 bg-amber-50/40 dark:bg-amber-950/20 space-y-2">
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-xs uppercase tracking-wider">
                  <Landmark className="w-4 h-4 text-amber-600" />
                  <span>Absolute Ministerial Discretion (Irish Nationality and Citizenship Act 1956)</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  Under Section 15 of the <strong>Irish Nationality and Citizenship Act 1956</strong> (as amended), the grant of a certificate of naturalisation is an executive act at the <strong>absolute discretion of the Minister for Justice</strong>.
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Meeting the 1,825-day reckonable residency requirement or achieving a 150-point score on CitizenScore.ie does <strong>NOT guarantee</strong> the grant of Irish citizenship. The Minister considers character, tax compliance, national security, and other statutory factors beyond residency calculations.
                </p>
              </div>

              <div className="card-inset p-4 space-y-2 text-xs">
                <span className="font-bold text-slate-900 dark:text-white block">
                  Not Legal Advice (Legal Services Regulation Act 2015)
                </span>
                <p className="text-slate-600 dark:text-slate-400">
                  The computations, scorecard tallies, checklists, and documentation summaries rendered by CitizenScore.ie are automated educational aids based on public ISD Form 8 guidelines. They do not constitute formal legal counsel. For bespoke immigration advice, appeals, or judicial reviews, applicants must engage a qualified solicitor registered with the Law Society of Ireland or an accredited immigration barrister.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: Pro Subscription */}
          {activeTab === 'subscription' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="card-inset p-4 sm:p-5 border-emerald-200 dark:border-emerald-800/40 bg-emerald-50/40 dark:bg-emerald-950/20">
                <div className="flex items-start gap-3">
                  <CreditCard className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                      CitizenScore Pro Plan: €5.00 / month
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                      Clear, honest, recurring subscription designed to assist applicants through the final months of their naturalisation dossier preparation.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-white/10 space-y-1">
                  <span className="font-bold text-slate-900 dark:text-white block">
                    1. Automatic Recurring Monthly Billing
                  </span>
                  <p className="text-slate-600 dark:text-slate-400">
                    Pro access is billed in advance on a recurring monthly cycle of <strong>€5.00 (inclusive of Irish VAT where applicable)</strong>. The subscription automatically renews each month until cancelled.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-white/10 space-y-1">
                  <span className="font-bold text-slate-900 dark:text-white block">
                    2. Instant 1-Click Cancellation Anytime
                  </span>
                  <p className="text-slate-600 dark:text-slate-400">
                    You can cancel your Pro subscription at any moment directly from your <strong>Applicant Profile & Vault Settings</strong>. No phone calls, emails, or cancellation surveys required. Upon cancellation, your Pro privileges remain active until the conclusion of your current prepaid billing period.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-white/10 space-y-1">
                  <span className="font-bold text-slate-900 dark:text-white block">
                    3. Secure Payment Infrastructure & PCI-DSS
                  </span>
                  <p className="text-slate-600 dark:text-slate-400">
                    Card payments and subscription states are handled through Stripe Ireland (Stripe Payments Europe Ltd), an authorized Electronic Money Institution regulated by the Central Bank of Ireland and certified to PCI-DSS Level 1.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-white/10 space-y-1">
                  <span className="font-bold text-slate-900 dark:text-white block">
                    4. Statutory EU 14-Day Right of Withdrawal & Refunds
                  </span>
                  <p className="text-slate-600 dark:text-slate-400">
                    Pursuant to EU Consumer Rights Directive (Directive 2011/83/EU), EU consumers have a right of withdrawal within 14 days, subject to the statutory exception for digital content made immediately accessible with user consent. If you experience technical defects, contact <a href="mailto:support@citizenscore.ie" className="text-emerald-600 dark:text-emerald-400 underline font-semibold">support@citizenscore.ie</a> for a prompt resolution.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: User Responsibilities */}
          {activeTab === 'obligations' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                  Applicant Obligations & Acceptable Use
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                  To preserve the integrity and security of the platform, all users agree to adhere to the following standards:
                </p>
              </div>

              <div className="space-y-3">
                <div className="card-inset p-3.5 flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <span className="font-bold text-slate-900 dark:text-white block">Factual Accuracy of Residency Data</span>
                    <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                      You are solely responsible for ensuring that all stamp dates entered into the Days Calculator match your physical passport entry/exit stamps and your official Department of Justice IRP card records.
                    </p>
                  </div>
                </div>

                <div className="card-inset p-3.5 flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <span className="font-bold text-slate-900 dark:text-white block">Strict Prohibition of Fraudulent or Forged Material</span>
                    <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                      Under the <em>Criminal Justice (Theft and Fraud Offences) Act 2001</em>, forging or altering state identification or immigration documentation is a severe criminal offense. You must never utilize our local watermarking tools to process fraudulent documentation.
                    </p>
                  </div>
                </div>

                <div className="card-inset p-3.5 flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <span className="font-bold text-slate-900 dark:text-white block">Verification against Current ISD Guidance</span>
                    <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                      ISD regularly updates Form 8 guidance, acceptable document point schedules, and electronic submission procedures. Users must verify their final submission against the latest guidance notes published on <a href="https://www.irishimmigration.ie" target="_blank" rel="noopener noreferrer" className="text-emerald-600 underline">irishimmigration.ie</a>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Liability & Jurisdiction */}
          {activeTab === 'legal' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                  Limitation of Liability & Irish Jurisdiction
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Legal provisions defining liability limitations, warranties, and governing law:
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-white/10 space-y-1">
                  <span className="font-bold text-slate-900 dark:text-white block">
                    1. Disclaimer of Warranties ("As Is")
                  </span>
                  <p className="text-slate-600 dark:text-slate-400">
                    CitizenScore.ie provides this platform, tools, and calculators on an "AS IS" and "AS AVAILABLE" basis without warranties of any kind, whether express or statutory, including warranties of merchantability, fitness for a particular purpose, or non-infringement.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-white/10 space-y-1">
                  <span className="font-bold text-slate-900 dark:text-white block">
                    2. Limitation of Financial Liability
                  </span>
                  <p className="text-slate-600 dark:text-slate-400">
                    To the maximum extent permissible under applicable Irish law, in no event shall CitizenScore.ie, its developers, or affiliates be liable for indirect, incidental, punitive, or consequential damages, or any adverse immigration decisions, delays, or refusal of naturalisation applications by the Department of Justice. Our total aggregate liability shall not exceed the total fees paid by you to CitizenScore.ie in the preceding six (6) months.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-white/10 space-y-1">
                  <span className="font-bold text-slate-900 dark:text-white block">
                    3. Governing Law and Exclusive Venue
                  </span>
                  <p className="text-slate-600 dark:text-slate-400">
                    These Terms of Service, and any non-contractual obligations arising out of or in connection with them, shall be governed by and construed in accordance with the substantive laws of <strong>Ireland</strong>. The Courts of Ireland in Dublin shall have exclusive jurisdiction to settle any dispute.
                  </p>
                </div>
              </div>

              <div className="card-inset p-4 space-y-1 text-xs">
                <span className="font-bold text-slate-900 dark:text-white block">
                  Contact & Inquiries:
                </span>
                <p className="text-slate-600 dark:text-slate-400">
                  CitizenScore.ie Legal Operations<br />
                  Dublin 2, Republic of Ireland<br />
                  Legal counsel contact: <a href="mailto:legal@citizenscore.ie" className="text-emerald-600 dark:text-emerald-400 underline font-semibold">legal@citizenscore.ie</a>
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-white/[0.02] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Scale className="w-4 h-4 text-emerald-600" />
            <span>Irish Jurisdiction • Department of Justice Discretion Upheld</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            {onOpenPrivacy && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenPrivacy();
                }}
                className="btn btn-sm btn-ghost text-xs text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                <span>View Privacy Policy (GDPR)</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="btn btn-sm btn-primary text-xs font-bold px-4"
            >
              I Accept & Continue
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
