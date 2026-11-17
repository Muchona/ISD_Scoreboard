import React from 'react';
import {
  ShieldCheck,
  ExternalLink,
  Lock,
  FileText,
  Calendar,
  Scale,
  Sparkles,
  HelpCircle,
  Mail,
  CheckCircle2,
  Globe,
  Award,
  ChevronRight,
} from 'lucide-react';
import { ISD_OFFICIAL_URLS } from '../data/isdPointsTable';
import OnyxBadge from './OnyxBadge';

interface FooterProps {
  onNavigate: (tab: string) => void;
  onOpenPrivacy?: () => void;
  onOpenTerms?: () => void;
  onOpenCookieSettings?: () => void;
  onOpenAuth?: (mode?: 'signin' | 'signup') => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  onOpenPrivacy,
  onOpenTerms,
  onOpenCookieSettings,
  onOpenAuth,
}) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-slate-200/90 dark:border-white/[0.08] bg-slate-50/70 dark:bg-obsidian-900/60 backdrop-blur-xl transition-colors">
      {/* Top Value / Trust Highlights Bar */}
      <div className="border-b border-slate-200/80 dark:border-white/[0.06] py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
            <span className="w-8 h-8 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
              <Lock className="w-4 h-4" />
            </span>
            <div>
              <p className="font-bold text-slate-900 dark:text-white">Zero-Knowledge Vault</p>
              <p className="text-[11px] text-slate-500">100% Client-Side PDF Encryption</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
            <span className="w-8 h-8 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
              <Scale className="w-4 h-4" />
            </span>
            <div>
              <p className="font-bold text-slate-900 dark:text-white">Section 15 Calibrated</p>
              <p className="text-[11px] text-slate-500">Irish Nationality & Citizenship Act</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
            <span className="w-8 h-8 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
              <Globe className="w-4 h-4" />
            </span>
            <div>
              <p className="font-bold text-slate-900 dark:text-white">EU GDPR Sovereign</p>
              <p className="text-[11px] text-slate-500">Frankfurt / Dublin Datacenter</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
            <span className="w-8 h-8 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
              <Award className="w-4 h-4" />
            </span>
            <div>
              <p className="font-bold text-slate-900 dark:text-white">Stripe 3D-Secure</p>
              <p className="text-[11px] text-slate-500">PCI-DSS Level 1 Encryption</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Multi-Column Directory */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-12 pb-6 sm:pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          
          {/* Platform Mission Column (2 cols on large screens, aligned with right boxes) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white font-mono">
              Naturalisation Platform
            </h4>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-sm">
              The high-trust Irish citizenship naturalisation companion. Purpose-built for foreign nationals accumulating their 1,825-day reckonable clocks and compiling audit-ready Form 8 submission dossiers under Section 15 of the Irish Nationality and Citizenship Act.
            </p>

            <div className="flex items-center gap-2 pt-1 flex-wrap">
              <span className="chip chip-emerald text-[11px] font-bold">
                100% Free Residency Calculator
              </span>
              <span className="chip bg-slate-200/80 dark:bg-white/10 text-slate-700 dark:text-slate-300 text-[11px] font-mono">
                v2.4 Naturalisation Release
              </span>
            </div>

            <div className="pt-2 text-xs text-slate-500 space-y-1">
              <p className="flex items-center gap-1.5 font-medium">
                <Mail className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>
                  Contact:{' '}
                  <a
                    href="mailto:support@citizenscore.ie"
                    className="text-emerald-700 dark:text-emerald-400 hover:underline font-semibold"
                  >
                    support@citizenscore.ie
                  </a>
                </span>
              </p>
              <p className="text-[11px] text-slate-400">
                Response time: Within 24 business hours (Monday – Friday)
              </p>
            </div>
          </div>

          {/* Column 2: Application Tools */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white font-mono">
              Compliance Tools
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400 font-medium">
              <li>
                <button
                  onClick={() => onNavigate('calculator')}
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1 text-left"
                >
                  <ChevronRight className="w-3 h-3 text-slate-400" />
                  <span>1,827-Day Reckonable Clock</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('vault')}
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1 text-left"
                >
                  <ChevronRight className="w-3 h-3 text-slate-400" />
                  <span>150-Point Bento Vault</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('watermark')}
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1 text-left"
                >
                  <ChevronRight className="w-3 h-3 text-slate-400" />
                  <span>PDF Anti-Theft Watermarker</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('vault')}
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1 text-left"
                >
                  <ChevronRight className="w-3 h-3 text-slate-400" />
                  <span>Master Dossier PDF Generator</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('calculator')}
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1 text-left"
                >
                  <ChevronRight className="w-3 h-3 text-slate-400" />
                  <span>Section 15C 70-Day Absence Audit</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('pricing')}
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1 text-left"
                >
                  <ChevronRight className="w-3 h-3 text-slate-400" />
                  <span>Pro Membership (€5/mo)</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Official ISD & Government Directives */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white font-mono">
              Official ISD Sources
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400 font-medium">
              <li>
                <a
                  href={ISD_OFFICIAL_URLS.citizenshipGuide}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1 text-left"
                >
                  <span>Citizenship by Naturalisation</span>
                  <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
                </a>
              </li>
              <li>
                <a
                  href={ISD_OFFICIAL_URLS.proofsOfIdentityAndResidence}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1 text-left"
                >
                  <span>150-Point Scorecard Tables</span>
                  <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
                </a>
              </li>
              <li>
                <a
                  href={ISD_OFFICIAL_URLS.residencyCalculator}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1 text-left"
                >
                  <span>Official ISD Online Calculator</span>
                  <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
                </a>
              </li>
              <li>
                <a
                  href={ISD_OFFICIAL_URLS.citizenshipLawAndPolicy}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1 text-left"
                >
                  <span>Section 15C Absence Guidance</span>
                  <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
                </a>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('requirements')}
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1 text-left font-semibold text-emerald-700 dark:text-emerald-400"
                >
                  <span>View All Document Rules Hub</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Legal & Privacy Sovereignty */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white font-mono">
              Privacy & Legal
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400 font-medium">
              <li>
                <button
                  onClick={onOpenPrivacy}
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1 text-left"
                >
                  <ChevronRight className="w-3 h-3 text-slate-400" />
                  <span>GDPR Privacy Notice</span>
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenTerms}
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1 text-left"
                >
                  <ChevronRight className="w-3 h-3 text-slate-400" />
                  <span>Terms of Service & Disclaimer</span>
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenCookieSettings}
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1 text-left"
                >
                  <ChevronRight className="w-3 h-3 text-slate-400" />
                  <span>Cookie & Storage Preferences</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenAuth?.('signin')}
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1 text-left"
                >
                  <ChevronRight className="w-3 h-3 text-slate-400" />
                  <span>Applicant Portal Sign In</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenAuth?.('signup')}
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1 text-left text-emerald-700 dark:text-emerald-400 font-semibold"
                >
                  <ChevronRight className="w-3 h-3" />
                  <span>Create Free Account</span>
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Large Centered Brand Typography Display (Irish Tricolour Edition on Dark Stage) */}
        <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-slate-200/60 dark:border-white/[0.06] text-center select-none">
          <div className="bg-slate-950 dark:bg-black/50 rounded-2xl sm:rounded-3xl py-6 sm:py-8 px-4 border border-slate-800/80 dark:border-white/[0.08] shadow-2xl relative overflow-hidden pointer-events-none inline-block w-full">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/[0.08] via-transparent to-[#FF883E]/[0.08] pointer-events-none" />
            <h2 className="text-4xl sm:text-6xl md:text-7xl lg:text-[96px] xl:text-[116px] font-black tracking-tight leading-none transform scale-y-[0.82] origin-center inline-block cursor-default relative z-10">
              <span className="text-emerald-400">Citizen</span>
              <span className="text-white">Score</span>
              <span className="text-[#FF883E]">.ie</span>
            </h2>
          </div>
        </div>
      </div>

      {/* Bottom Civic Statutory Disclaimer Bar */}
      <div className="border-t border-slate-200/80 dark:border-white/[0.06] bg-slate-100/60 dark:bg-black/40 py-6 px-4 sm:px-6 lg:px-8 text-xs text-slate-600 dark:text-slate-400 space-y-4">
        <div className="max-w-7xl mx-auto space-y-3">
          <p className="leading-relaxed text-[11px] text-slate-500 dark:text-slate-400">
            <strong className="text-slate-700 dark:text-slate-300">Statutory Legal Notice:</strong> CitizenScore.ie is an independent software companion and self-assessment utility designed to help applicants assemble compliant naturalisation documentation. CitizenScore.ie is not a legal practice, does not provide legal advice, and is not affiliated with, endorsed by, or representing the Department of Justice, Immigration Service Delivery (ISD), or the Minister for Justice. The granting of an Irish certificate of naturalisation remains at the absolute discretion of the Minister for Justice pursuant to the Irish Nationality and Citizenship Act 1956 (as amended).
          </p>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-3 border-t border-slate-200/60 dark:border-white/[0.06] text-[11px]">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <p>© {currentYear} CitizenScore.ie. All rights reserved. Calibrated for Form 8.</p>
              <span className="hidden sm:inline opacity-40">•</span>
              <button onClick={onOpenPrivacy} className="hover:underline hover:text-emerald-500 transition-colors">Privacy</button>
              <span className="opacity-40">•</span>
              <button onClick={onOpenTerms} className="hover:underline hover:text-emerald-500 transition-colors">Terms</button>
              <span className="opacity-40">•</span>
              <button onClick={onOpenCookieSettings} className="hover:underline hover:text-emerald-500 transition-colors">Cookies</button>
              <span className="hidden sm:inline opacity-40">•</span>
              <span className="hidden sm:inline">Made with care for Irish naturalisation applicants 🇮🇪</span>
            </div>

            <div className="shrink-0 flex items-center justify-center pt-2 md:pt-0">
              <OnyxBadge />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
