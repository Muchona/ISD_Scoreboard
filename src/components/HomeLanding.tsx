import React, { useState } from 'react';
import {
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Lock,
  FileText,
  Clock,
  Sparkles,
  ExternalLink,
  HelpCircle,
  AlertCircle,
  FileCheck,
  ChevronRight,
  Scale,
  Play,
  X,
  Award,
  Layers,
} from 'lucide-react';
import { IsdCitation } from './IsdCitation';
import { DemoVideoPlayer } from './DemoVideoPlayer';
import { ISD_OFFICIAL_URLS } from '../data/isdPointsTable';

interface HomeLandingProps {
  onNavigate: (tab: string) => void;
}

export const HomeLanding: React.FC<HomeLandingProps> = ({ onNavigate }) => {
  const [showDemoModal, setShowDemoModal] = useState<boolean>(false);

  return (
    <div className="space-y-20 md:space-y-28 max-w-6xl mx-auto">
      
      {/* ========================================================
          1. HERO SECTION (With High-Trust Visual Mockup)
          ======================================================== */}
      <section className="relative pt-6 md:pt-12 text-center space-y-6">
        
        {/* Top Trust Eyebrow */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="chip chip-emerald">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            Designed for Irish Naturalisation Applicants
          </span>
          <IsdCitation
            variant="orange"
            title="Calibrated to ISD Form 8 Directives"
            url={ISD_OFFICIAL_URLS.proofsOfIdentityAndResidence}
            tag="Official ISD"
          />
        </div>

        {/* Main Display Headline */}
        <div className="max-w-4xl mx-auto space-y-4">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.12]">
            Never Risk a Form 8 Rejection.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 dark:from-emerald-400 dark:via-teal-300 dark:to-emerald-400">
              Score Your 150 Points.
            </span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-slate-700 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
            The high-trust companion platform for foreign nationals accumulating their 5-year reckonable clocks. Free continuous days calculator, official 150-point scorecard engine, and automated PDF anti-theft watermarking.
          </p>
        </div>

        {/* Action Buttons: Irish Flag Tricolour (Green - White - Orange) */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {/* Button 1: Irish Green */}
          <button
            onClick={() => onNavigate('calculator')}
            className="btn btn-primary h-12 px-6 text-sm w-full sm:w-auto shadow-md shadow-emerald-700/20"
          >
            <span>Calculate Reckonable Days (100% Free)</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Button 2: Irish White (Solid White in both Light & Dark Mode) */}
          <button
            onClick={() => setShowDemoModal(true)}
            className="h-12 px-6 text-sm w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl font-bold bg-white hover:bg-slate-100 text-slate-950 border border-slate-200 shadow-md shadow-black/5 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-950 dark:border-white transition-all duration-150 active:scale-[0.98] select-none whitespace-nowrap group"
          >
            <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 group-hover:scale-110 transition-transform">
              <Play className="w-3.5 h-3.5 fill-emerald-600" />
            </div>
            <span>Watch 60-Sec Demo</span>
          </button>

          {/* Button 3: Irish Flag Orange */}
          <button
            onClick={() => onNavigate('vault')}
            className="h-12 px-6 text-sm w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl font-semibold bg-[#FF883E] hover:bg-[#F2782A] text-white shadow-md shadow-orange-500/25 transition-all duration-150 active:scale-[0.98] select-none whitespace-nowrap"
          >
            <ShieldCheck className="w-4 h-4 text-white" />
            <span>Open 150-Point Vault</span>
          </button>
        </div>

        {/* Social Proof & Security Badges */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-700 dark:text-slate-400 font-medium">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>No Account Required for Calculator</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Client-Side PII Security (GDPR)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Scale className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Section 15C 70-Day Absence Checked</span>
          </div>
        </div>

        {/* High-Fidelity Hero Visual (Irish Passport + Form 8 Dossier Stack) */}
        <div className="pt-8">
          <div className="card p-6 md:p-8 text-left border border-slate-300 dark:border-white/10 relative overflow-hidden bg-gradient-to-b from-white to-slate-50/70 dark:from-obsidian-800 dark:to-obsidian-900">
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Left Column: Live Progress Summary */}
              <div className="lg:col-span-7 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 items-start">
                  <div>
                    <span className="eyebrow">Naturalisation Readiness Dashboard</span>
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                      Sample Applicant: 5-Year General Pathway
                    </h3>
                  </div>
                  <span className="chip chip-emerald font-bold shrink-0 self-start sm:self-auto text-xs py-1 px-2.5">
                    Eligible to Apply in 45 Days
                  </span>
                </div>

                {/* Days Meter Bar */}
                <div className="card-inset p-3.5 sm:p-4 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1 text-xs">
                    <span className="font-semibold text-slate-800 dark:text-slate-300">
                      Reckonable Days Accumulation (Stamp 1 + Stamp 4)
                    </span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                      1,780 <span className="text-slate-600 dark:text-slate-400 font-normal">/ 1,825 days</span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-200/90 dark:bg-white/10 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-600 dark:bg-emerald-500 h-full rounded-full transition-all duration-700" style={{ width: '97.5%' }} />
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] text-slate-600 dark:text-slate-400 font-mono font-medium">
                    <span>9-Year Statutory Window</span>
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold">97.5% Complete</span>
                    <span>1,825 Days Target</span>
                  </div>
                </div>

                {/* Mini Scorecard Rings — Irish Tricolour (Green - White - Orange) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                  {/* Card 1: Green */}
                  <div className="relative overflow-hidden p-3 rounded-xl border border-slate-300 dark:border-white/10 border-t-2 border-t-emerald-500 bg-white dark:bg-slate-900/90 shadow-[0_-8px_20px_-3px_rgba(16,185,129,0.22)] flex flex-col items-center text-center">
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-28 h-12 bg-emerald-500/25 rounded-full blur-xl pointer-events-none" />
                    <span className="relative z-10 font-mono font-bold text-sm text-emerald-700 dark:text-emerald-400">150 / 150</span>
                    <span className="relative z-10 text-xs font-semibold text-slate-900 dark:text-slate-200 mt-0.5">Identity</span>
                    <span className="relative z-10 text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">✓ In-Date Passport</span>
                  </div>

                  {/* Card 2: White / Silver */}
                  <div className="relative overflow-hidden p-3 rounded-xl border border-slate-300 dark:border-white/20 border-t-2 border-t-white dark:border-t-white bg-white dark:bg-slate-900/90 shadow-[0_-10px_24px_-3px_rgba(255,255,255,0.35)] dark:shadow-[0_-10px_24px_-3px_rgba(255,255,255,0.3)] flex flex-col items-center text-center">
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-28 h-12 bg-white/45 dark:bg-white/30 rounded-full blur-xl pointer-events-none" />
                    <span className="relative z-10 font-mono font-bold text-sm text-slate-900 dark:text-white">150 / 150</span>
                    <span className="relative z-10 text-xs font-semibold text-slate-900 dark:text-slate-200 mt-0.5">Year 5 ({new Date().getFullYear()})</span>
                    <span className="relative z-10 text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">✓ Type A + Type B</span>
                  </div>

                  {/* Card 3: Irish Orange */}
                  <div className="relative overflow-hidden p-3 rounded-xl border border-slate-300 dark:border-white/10 border-t-2 border-t-[#FF883E] bg-white dark:bg-slate-900/90 shadow-[0_-8px_20px_-3px_rgba(255,136,62,0.28)] flex flex-col items-center text-center">
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-28 h-12 bg-[#FF883E]/25 rounded-full blur-xl pointer-events-none" />
                    <span className="relative z-10 font-mono font-bold text-sm text-[#FF883E] dark:text-[#ff944d]">100 / 150</span>
                    <span className="relative z-10 text-xs font-semibold text-slate-900 dark:text-slate-200 mt-0.5">Year 4 ({new Date().getFullYear() - 1})</span>
                    <span className="relative z-10 text-[11px] text-[#FF883E] dark:text-[#ff944d] font-semibold">Needs Type B (50pt)</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-700 dark:text-slate-300 pt-1 font-medium">
                  <span>Continuous Residence: <strong className="text-slate-900 dark:text-white">14 / 70 Days Absent</strong> (Section 15C Compliant)</span>
                  <button
                    onClick={() => onNavigate('calculator')}
                    className="text-emerald-700 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1 self-start sm:self-auto"
                  >
                    <span>Test Your Dates</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Right Column: Realistic Irish Passport Booklet & Stamped Document Visual */}
              <div className="lg:col-span-5 relative flex items-center justify-center p-2">
                
                {/* Backdrop Layer: Watermarked Document */}
                <div className="w-full max-w-[320px] rounded-2xl border border-slate-300 dark:border-white/10 bg-white dark:bg-obsidian-800 p-4 shadow-xl transform rotate-2 hover:rotate-0 transition-transform duration-300">
                  <div className="flex items-center justify-between text-xs mb-2 pb-2 border-b border-slate-200 dark:border-white/5">
                    <span className="font-bold text-slate-900 dark:text-slate-200 flex items-center gap-1.5">
                      <FileCheck className="w-4 h-4 text-emerald-600" />
                      <span>Form 8 Dossier Package</span>
                    </span>
                    <span className="chip chip-emerald text-[10px] h-5 px-1.5 font-mono">
                      Watermarked
                    </span>
                  </div>

                  {/* Watermarked Stamp Preview */}
                  <div className="relative rounded-lg border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02] p-3 text-xs overflow-hidden select-none">
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 opacity-25">
                      <span className="transform -rotate-25 font-mono font-bold text-slate-900 dark:text-white text-[10px] tracking-widest border-y border-dashed border-slate-500 py-1 px-4 whitespace-nowrap">
                        FOR ISD CITIZENSHIP ONLY • CITIZEN-7892
                      </span>
                    </div>

                    <div className="space-y-1 text-[11px] font-mono text-slate-700 dark:text-slate-300">
                      <div className="font-bold text-slate-950 dark:text-slate-100">Revenue Commissioners EDS</div>
                      <div>Tax Year: 2024 • Verified Proof</div>
                      <div className="text-emerald-700 dark:text-emerald-400 font-bold">+100 Points Awarded</div>
                    </div>
                  </div>

                  {/* Photorealistic Irish Passport Card */}
                  <div className="mt-3 rounded-xl p-3.5 bg-gradient-to-br from-[#4A0E17] via-[#5B101E] to-[#3B0B12] text-[#F3E5AB] shadow-md border border-[#D4AF37]/30 flex items-center gap-3">
                    {/* Gold Harp Emblem */}
                    <div className="w-10 h-10 rounded-lg bg-[#3B0B12] border border-[#D4AF37]/40 flex items-center justify-center shrink-0 shadow-inner">
                      <Award className="w-5 h-5 text-[#D4AF37]" />
                    </div>
                    <div>
                      <div className="text-[10px] tracking-widest font-mono text-[#D4AF37] uppercase">
                        ÉIRE • IRELAND
                      </div>
                      <div className="text-xs font-bold tracking-wider text-white">
                        PAS • PASSPORT
                      </div>
                      <div className="text-[10px] text-emerald-300 font-medium flex items-center gap-1 mt-0.5">
                        <CheckCircle2 className="w-3 h-3" /> 150 Identity Points
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onNavigate('vault')}
                    className="btn btn-primary w-full btn-sm mt-3"
                  >
                    <span>Build Your Application Vault</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>

            </div>
          </div>
        </div>

      </section>

      {/* ========================================================
          2. THE PROBLEM WE SOLVE (The 3 Options)
          ======================================================== */}
      <section className="space-y-8">
        <div className="text-center space-y-2">
          <span className="eyebrow">The Cost of a Single Documentation Mistake</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-950 dark:text-white tracking-tight">
            Why 20,000+ Expats Struggle With Form 8
          </h2>
          <p className="text-sm text-slate-700 dark:text-slate-300 max-w-xl mx-auto font-normal">
            A rejected citizenship application means losing your non-refundable €175 application fee and delaying your Irish passport by up to 18 months.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Emerald Green (Official Govt PDFs) */}
          <div className="relative overflow-hidden card p-6 space-y-4 border-slate-300 dark:border-white/10 border-t-2 border-t-emerald-500 shadow-[0_-12px_28px_-4px_rgba(16,185,129,0.24),0_4px_16px_rgba(15,23,42,0.06)] dark:shadow-[0_-14px_32px_-4px_rgba(16,185,129,0.32)] group">
            {/* Top Ambient Radiant Spotlight (Higgsfield Style) */}
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-20 bg-emerald-500/25 dark:bg-emerald-400/20 rounded-full blur-2xl pointer-events-none opacity-60 group-hover:opacity-90 transition-opacity" />
            
            <div className="relative z-10 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Official Government PDFs
              </h3>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                ISD only provides static 20+ page PDFs with dense legal tables. Applicants struggle to verify whether their utility bills or bank statements count as Type A or Type B proof.
              </p>
              <div className="pt-2 border-t border-slate-200 dark:border-white/5 text-xs text-amber-700 dark:text-amber-400 font-semibold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>High risk of point deficits & rejection</span>
              </div>
            </div>
          </div>

          {/* Card 2: White / Silver (Immigration Solicitors) */}
          <div className="relative overflow-hidden card p-6 space-y-4 border-slate-300 dark:border-white/20 border-t-2 border-t-white dark:border-t-white shadow-[0_-14px_32px_-4px_rgba(255,255,255,0.35),0_4px_16px_rgba(15,23,42,0.06)] dark:shadow-[0_-16px_36px_-4px_rgba(255,255,255,0.35)] group">
            {/* Top Ambient Radiant Spotlight (Higgsfield Style) */}
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-20 bg-white/45 dark:bg-white/30 rounded-full blur-2xl pointer-events-none opacity-70 group-hover:opacity-100 transition-opacity" />
            
            <div className="relative z-10 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/10 border border-slate-300 dark:border-white/20 flex items-center justify-center text-slate-700 dark:text-slate-300">
                <Scale className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Immigration Solicitors
              </h3>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                Solicitors charge between <strong className="text-slate-950 dark:text-white">€1,500 and €2,500+</strong> just to manually review your bank statements and tax records. They offer zero client software to track your clock as you accumulate days.
              </p>
              <div className="pt-2 border-t border-slate-200 dark:border-white/5 text-xs text-slate-600 dark:text-slate-400 font-medium">
                Extremely expensive for simple record-checking
              </div>
            </div>
          </div>

          {/* Card 3: Irish Flag Orange (CitizenScore.ie) */}
          <div className="relative overflow-hidden card p-6 space-y-4 border-slate-300 dark:border-white/10 border-t-2 border-t-[#FF883E] shadow-[0_-12px_28px_-4px_rgba(255,136,62,0.28),0_4px_16px_rgba(15,23,42,0.06)] dark:shadow-[0_-14px_32px_-4px_rgba(255,136,62,0.35)] group">
            {/* Top Ambient Radiant Spotlight (Higgsfield Style) */}
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-20 bg-[#FF883E]/30 dark:bg-[#FF883E]/25 rounded-full blur-2xl pointer-events-none opacity-60 group-hover:opacity-90 transition-opacity" />
            
            <div className="relative z-10 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-[#FF883E] flex items-center justify-center text-white shadow-sm shadow-orange-500/30">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                CitizenScore.ie
              </h3>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                Automated, instant precision. 100% free reckonable days calculator, live 150-point progress meters, Section 15C absence guardrails, and automated PDF watermarking for just <strong className="text-slate-950 dark:text-white">€5/month</strong>.
              </p>
              <div className="pt-2 border-t border-slate-200 dark:border-white/5 text-xs text-[#FF883E] dark:text-[#ff944d] font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Full compliance with peace of mind</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================
          3. HOW IT WORKS (3 Simple Steps)
          ======================================================== */}
      <section className="card p-8 md:p-12 space-y-8">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <span className="eyebrow">Your Roadmap to the Irish Passport</span>
          <h2 className="text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight">
            Three Steps to an Audit-Ready Application
          </h2>
          <p className="text-sm text-slate-700 dark:text-slate-300 font-normal">
            From your very first Stamp 1 to the final ceremony in Dublin Castle.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Step 1 */}
          <div className="space-y-3">
            <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-mono font-bold text-sm flex items-center justify-center ring-1 ring-emerald-600/30">
              01
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              Track Your Reckonable Clock
            </h4>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
              Enter your historical permission dates. Our calculator filters reckonable Stamps (1, 1G, 4, 3, 5, 6), excludes student periods (Stamp 2), and tracks your 1,825-day countdown.
            </p>
          </div>

          {/* Step 2 */}
          <div className="space-y-3">
            <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-mono font-bold text-sm flex items-center justify-center ring-1 ring-emerald-600/30">
              02
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              Score 150 Points per Year
            </h4>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
              Check off your valid passport for 150 identity points, then pair one Type A document (100 pts) with one Type B document (50 pts) for every single reckonable residency year.
            </p>
          </div>

          {/* Step 3 */}
          <div className="space-y-3">
            <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-mono font-bold text-sm flex items-center justify-center ring-1 ring-emerald-600/30">
              03
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              Watermark & Compile Dossier
            </h4>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
              Apply semi-transparent anti-theft security watermarks to protect your PII, then export a structured submission package ready for your Form 8 declaration.
            </p>
          </div>

        </div>

        <div className="pt-6 border-t border-slate-200 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
            Have questions about your stamps or points? Check our verified guidelines.
          </span>
          <button
            onClick={() => onNavigate('requirements')}
            className="btn btn-sm btn-secondary"
          >
            <span>View Official ISD Scorecard Schedule</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* ========================================================
          4. CITATION & GOVERNMENT TRUST ASSURANCE
          ======================================================== */}
      <section className="card p-6 md:p-8 bg-blue-50/60 dark:bg-blue-950/20 border-blue-300 dark:border-blue-900/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="chip chip-blue">
              Official Transparency Guarantee
            </span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            100% Backed by Official Irish Government Citations
          </h3>
          <p className="text-xs text-slate-700 dark:text-slate-300 max-w-xl leading-relaxed font-normal">
            We never guess or approximate point values. Every document classification, stamp eligibility rule, and absence policy links directly to official directives on <code className="font-mono text-blue-800 dark:text-blue-300 font-semibold">irishimmigration.ie</code>.
          </p>
        </div>

        <a
          href={ISD_OFFICIAL_URLS.proofsOfIdentityAndResidence}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary btn-sm shrink-0 whitespace-nowrap"
        >
          <span>Verify on official ISD website</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </section>

      {/* ========================================================
          5. BOTTOM CONVERSION BANNER
          ======================================================== */}
      <section className="text-center p-8 md:p-12 rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 text-white shadow-xl space-y-6">
        <div className="max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full">
            Start Your Journey Today
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to Check Your Reckonable Days?
          </h2>
          <p className="text-sm text-emerald-100 leading-relaxed">
            Join thousands of legal residents navigating their naturalisation journey with absolute clarity and peace of mind.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => onNavigate('calculator')}
            className="btn h-11 px-6 bg-white text-emerald-950 font-bold hover:bg-emerald-50 shadow-sm text-xs sm:text-sm w-full sm:w-auto"
          >
            <span>Launch Free Calculator</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => onNavigate('pricing')}
            className="btn h-11 px-6 bg-emerald-700/80 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm w-full sm:w-auto border border-emerald-400/30"
          >
            <span>View Subscription Plans (€5/mo)</span>
          </button>
        </div>
      </section>

      {/* ========================================================
          6. "WATCH 60-SEC DEMO" VIDEO WALKTHROUGH MODAL
          ======================================================== */}
      {showDemoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-md p-4 sm:p-6 overflow-y-auto">
          <div className="relative w-full max-w-4xl animate-in fade-in zoom-in-95 duration-200">
            {/* Close Button at top right */}
            <button
              onClick={() => setShowDemoModal(false)}
              className="absolute -top-10 right-0 p-2 text-slate-700 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white transition-colors flex items-center gap-1.5 text-xs font-semibold"
            >
              <span>Close</span>
              <X className="w-5 h-5" />
            </button>

            {/* High-Fidelity Video Player Component */}
            <DemoVideoPlayer
              onNavigate={onNavigate}
              onClose={() => setShowDemoModal(false)}
            />
          </div>
        </div>
      )}

    </div>
  );
};
