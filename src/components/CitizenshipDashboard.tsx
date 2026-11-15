import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  FileText,
  Sparkles,
  ArrowRight,
  Upload,
  Calendar,
  Award,
  Download,
  ExternalLink,
  Lock,
  ChevronRight,
  Check,
  RotateCcw,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile, YearScorecard, StampPeriod } from '../types';
import { ISD_OFFICIAL_URLS } from '../data/isdPointsTable';
import { MasterDossierModal } from './MasterDossierModal';

interface CitizenshipDashboardProps {
  user: UserProfile | null;
  onNavigate: (tab: string, extra?: any) => void;
  onOpenAuth?: (mode?: 'signin' | 'signup') => void;
}

export const CitizenshipDashboard: React.FC<CitizenshipDashboardProps> = ({
  user,
  onNavigate,
  onOpenAuth,
}) => {
  // If no user is logged in, show protected dashboard gate
  if (!user) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <div className="rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-obsidian-900/70 backdrop-blur-2xl p-8 sm:p-12 shadow-2xl">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-6 ring-1 ring-emerald-500/20 shadow-inner">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
            Citizenship Dashboard is Locked
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-8 leading-relaxed">
            The Citizenship Readiness Dashboard tracks your personal Form 8 naturalisation progress, reckonable days, and 150-point scorecards. Please sign in to view your dashboard.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => onOpenAuth?.('signin')}
              className="btn btn-primary px-6 py-2.5 text-sm font-bold w-full sm:w-auto shadow-lg shadow-emerald-700/20"
            >
              Sign In to Your Account
            </button>
            <button
              onClick={() => onNavigate('home')}
              className="btn btn-secondary px-6 py-2.5 text-sm font-semibold w-full sm:w-auto"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const applicantName = user.name || 'Applicant';
  const targetYear = user.targetYear || new Date().getFullYear();
  const currentStamp = user.currentStamp || 'Stamp 4';

  const [dossierModalOpen, setDossierModalOpen] = useState<boolean>(false);
  const [coverLetterNotes, setCoverLetterNotes] = useState<string>(
    () => localStorage.getItem('isd_cover_letter_notes') || ''
  );

  useEffect(() => {
    if (!dossierModalOpen) {
      setCoverLetterNotes(localStorage.getItem('isd_cover_letter_notes') || '');
    }
  }, [dossierModalOpen]);

  // Retrieve saved scorecards or use defaults
  const [scorecards, setScorecards] = useState<YearScorecard[]>(() => {
    const saved = localStorage.getItem('isd_scorecards');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    // Default 6 cards (Identity + 5 years)
    const y = targetYear;
    return [
      {
        year: 0,
        label: 'Identity Verification',
        targetPoints: 150,
        currentPoints: 150,
        isComplete: true,
        documents: [
          {
            id: 'id-1',
            name: 'Current Valid In-Date Passport (Certified Biometric Copy)',
            category: 'IDENTITY',
            type: 'IDENTITY_PRIMARY',
            points: 150,
            issuer: 'National Passport Authority',
            isdGuidelineRef: ISD_OFFICIAL_URLS.proofsOfIdentityAndResidence,
            isWatermarked: true,
          },
        ],
      },
      {
        year: y,
        label: `Year 5 (${y})`,
        targetPoints: 150,
        currentPoints: 150,
        isComplete: true,
        hasTypeA: true,
        hasTypeB: true,
        documents: [
          {
            id: `${y}-1`,
            name: 'Employment Detail Summary (EDS)',
            category: 'RESIDENCY',
            type: 'TYPE_A',
            points: 100,
            year: y,
            issuer: 'Revenue Commissioners',
            isdGuidelineRef: ISD_OFFICIAL_URLS.proofsOfIdentityAndResidence,
            isWatermarked: true,
          },
          {
            id: `${y}-2`,
            name: 'Electric Ireland Electricity Bill',
            category: 'RESIDENCY',
            type: 'TYPE_B',
            points: 50,
            year: y,
            issuer: 'Electric Ireland',
            isdGuidelineRef: ISD_OFFICIAL_URLS.proofsOfIdentityAndResidence,
            isWatermarked: true,
          },
        ],
      },
      {
        year: y - 1,
        label: `Year 4 (${y - 1})`,
        targetPoints: 150,
        currentPoints: 100,
        isComplete: false,
        hasTypeA: true,
        hasTypeB: false,
        documents: [
          {
            id: `${y - 1}-1`,
            name: 'Employment Detail Summary (EDS)',
            category: 'RESIDENCY',
            type: 'TYPE_A',
            points: 100,
            year: y - 1,
            issuer: 'Revenue Commissioners',
            isdGuidelineRef: ISD_OFFICIAL_URLS.proofsOfIdentityAndResidence,
            isWatermarked: true,
          },
        ],
      },
      {
        year: y - 2,
        label: `Year 3 (${y - 2})`,
        targetPoints: 150,
        currentPoints: 150,
        isComplete: true,
        hasTypeA: true,
        hasTypeB: true,
        documents: [
          {
            id: `${y - 2}-1`,
            name: 'Revenue Statement EDS',
            category: 'RESIDENCY',
            type: 'TYPE_A',
            points: 100,
            year: y - 2,
            issuer: 'Revenue Commissioners',
            isdGuidelineRef: ISD_OFFICIAL_URLS.proofsOfIdentityAndResidence,
            isWatermarked: true,
          },
          {
            id: `${y - 2}-2`,
            name: 'RTB Tenancy Agreement Letter',
            category: 'RESIDENCY',
            type: 'TYPE_B',
            points: 50,
            year: y - 2,
            issuer: 'Residential Tenancies Board',
            isdGuidelineRef: ISD_OFFICIAL_URLS.proofsOfIdentityAndResidence,
            isWatermarked: true,
          },
        ],
      },
      {
        year: y - 3,
        label: `Year 2 (${y - 3})`,
        targetPoints: 150,
        currentPoints: 150,
        isComplete: true,
        hasTypeA: true,
        hasTypeB: true,
        documents: [
          {
            id: `${y - 3}-1`,
            name: 'AIB Bank Statements (POS Transactions)',
            category: 'RESIDENCY',
            type: 'TYPE_A',
            points: 100,
            year: y - 3,
            issuer: 'AIB Bank Ireland',
            isdGuidelineRef: ISD_OFFICIAL_URLS.proofsOfIdentityAndResidence,
            isWatermarked: true,
          },
          {
            id: `${y - 3}-2`,
            name: 'Bord Gáis Energy Utility Bill',
            category: 'RESIDENCY',
            type: 'TYPE_B',
            points: 50,
            year: y - 3,
            issuer: 'Bord Gáis Energy',
            isdGuidelineRef: ISD_OFFICIAL_URLS.proofsOfIdentityAndResidence,
            isWatermarked: true,
          },
        ],
      },
      {
        year: y - 4,
        label: `Year 1 (${y - 4})`,
        targetPoints: 150,
        currentPoints: 150,
        isComplete: true,
        hasTypeA: true,
        hasTypeB: true,
        documents: [
          {
            id: `${y - 4}-1`,
            name: 'Employment Detail Summary (EDS)',
            category: 'RESIDENCY',
            type: 'TYPE_A',
            points: 100,
            year: y - 4,
            issuer: 'Revenue Commissioners',
            isdGuidelineRef: ISD_OFFICIAL_URLS.proofsOfIdentityAndResidence,
            isWatermarked: true,
          },
          {
            id: `${y - 4}-2`,
            name: 'Virgin Media Broadband Bill',
            category: 'RESIDENCY',
            type: 'TYPE_B',
            points: 50,
            year: y - 4,
            issuer: 'Virgin Media Ireland',
            isdGuidelineRef: ISD_OFFICIAL_URLS.proofsOfIdentityAndResidence,
            isWatermarked: true,
          },
        ],
      },
    ];
  });

  // Calculate live reckonable days from stored periods
  const [stampPeriods, setStampPeriods] = useState<StampPeriod[]>(() => {
    const saved = localStorage.getItem('isd_periods');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      {
        id: '1',
        stamp: '4',
        startDate: '2021-12-09',
        endDate: '2023-12-09',
        calculatedDays: 731,
        isReckonable: true,
      },
      {
        id: '2',
        stamp: '4',
        startDate: '2023-12-09',
        endDate: '2026-12-09',
        calculatedDays: 1096,
        isReckonable: true,
        isOverlapAdjusted: true,
        overlapDays: 1,
        effectiveStartDate: '2023-12-10',
      },
    ];
  });

  // Calculations
  const totalDays = useMemo(() => {
    return stampPeriods
      .filter((p) => p.isReckonable)
      .reduce((sum, p) => sum + (p.calculatedDays || 0), 0);
  }, [stampPeriods]);

  const targetDays = 1825;
  const isDaysMet = totalDays >= targetDays;
  const daysPct = Math.min(100, Math.round((totalDays / targetDays) * 100));

  const identityCard = scorecards.find((c) => c.year === 0);
  const isIdentityMet = (identityCard?.currentPoints || 0) >= 150;

  const residencyCards = scorecards.filter((c) => c.year > 0);
  const completedResidencyYears = residencyCards.filter((c) => c.isComplete).length;
  const totalResidencyYears = residencyCards.length || 5;
  const isResidencyMet = completedResidencyYears === totalResidencyYears;

  // Incomplete years
  const incompleteYears = residencyCards.filter((c) => !c.isComplete);

  // Overall Readiness Score: Days (35%), Identity (25%), 5-Year Residence (40%)
  const daysScorePart = isDaysMet ? 35 : (totalDays / targetDays) * 35;
  const idScorePart = isIdentityMet ? 25 : 0;
  const resScorePart = (completedResidencyYears / totalResidencyYears) * 40;
  const overallReadiness = Math.min(100, Math.round(daysScorePart + idScorePart + resScorePart));

  const isFullyReady = isDaysMet && isIdentityMet && isResidencyMet;

  const handleTriggerCelebration = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Welcome & Application Readiness Overview */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-900 via-obsidian-900 to-emerald-950 p-6 md:p-8 text-white shadow-xl dark:border-white/10">
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Irish Citizenship Naturalisation Dossier • Form 8</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
              Welcome back, {applicantName}
            </h1>
            <p className="text-sm sm:text-base text-slate-300">
              Tracking your path to Irish citizenship for target year <strong className="text-white">{targetYear}</strong> under{' '}
              <strong className="text-emerald-400">{currentStamp}</strong>. Everything is calibrated directly to Department of Justice Section 15 standards.
            </p>
          </div>

          {/* Overall Readiness Ring Card */}
          <div className="flex items-center gap-5 p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md shrink-0 w-full sm:w-auto justify-between sm:justify-start">
            <div className="relative flex items-center justify-center w-20 h-20 shrink-0">
              <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-white/10"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={overallReadiness >= 100 ? 'text-emerald-400' : 'text-amber-400'}
                  strokeDasharray={`${overallReadiness}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-xl font-extrabold font-mono text-white leading-none">
                  {overallReadiness}%
                </span>
                <span className="text-[10px] text-slate-400 font-medium mt-0.5">Ready</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-xs font-semibold text-slate-300">Form 8 Filing Status</div>
              <div className="text-base font-bold text-white flex items-center gap-1.5">
                {isFullyReady ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Eligible to Submit</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>In Progress</span>
                  </>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                {isFullyReady
                  ? 'All criteria fulfilled for submission.'
                  : `${incompleteYears.length} item(s) pending completion.`}
              </p>
            </div>
          </div>
        </div>

        {/* Ambient subtle glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-10 -right-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"
        />
      </div>

      {/* The 3 Core Pillars Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              The 3 Naturalisation Pillars
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Department of Justice statutory requirements under the Irish Nationality and Citizenship Act.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Pillar 1: Reckonable Days */}
          <div className="card p-5 flex flex-col justify-between hover:border-emerald-500/50 transition-all">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Pillar 1
                  </span>
                </div>
                {isDaysMet ? (
                  <span className="chip chip-emerald text-[11px] font-bold">
                    ✓ Complete
                  </span>
                ) : (
                  <span className="chip chip-amber text-[11px] font-bold">
                    {targetDays - totalDays}d needed
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Statutory Reckonable Days
                </h3>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-black font-mono text-slate-900 dark:text-white">
                    {totalDays.toLocaleString()}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    / {targetDays.toLocaleString()} days
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-white/5 rounded-full h-2 mt-2 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${daysPct}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-white/5 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex justify-between">
                  <span>Stamp history:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {stampPeriods.length} periods logged
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>ISD Overlap Deduplication:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    Active (09/12/2023)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Final Year Absence Cap:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    14 / 70d (Compliant)
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onNavigate('calculator')}
              className="btn btn-secondary w-full mt-4 flex items-center justify-center gap-1.5 text-xs font-semibold"
            >
              <span>Open Days Calculator</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Pillar 2: Identity Verification */}
          <div className="card p-5 flex flex-col justify-between hover:border-emerald-500/50 transition-all">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-950/60 flex items-center justify-center text-sky-600 dark:text-sky-400">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Pillar 2
                  </span>
                </div>
                {isIdentityMet ? (
                  <span className="chip chip-emerald text-[11px] font-bold">
                    ✓ 150/150 pts
                  </span>
                ) : (
                  <span className="chip chip-amber text-[11px] font-bold">
                    Pending
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Identity Verification
                </h3>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-black font-mono text-slate-900 dark:text-white">
                    {identityCard?.currentPoints || 0}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">/ 150 points</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-white/5 rounded-full h-2 mt-2 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, ((identityCard?.currentPoints || 0) / 150) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-white/5 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex justify-between">
                  <span>Requirement:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    Proven ONCE in lifetime
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Active Document:</span>
                  <span className="font-semibold text-slate-900 dark:text-white truncate max-w-[140px]" title="Current Valid In-Date Passport">
                    Valid Passport (150pt)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Name Lock:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    Verified ({applicantName.split(' ')[0]})
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onNavigate('vault')}
              className="btn btn-secondary w-full mt-4 flex items-center justify-center gap-1.5 text-xs font-semibold"
            >
              <span>View Identity Proof</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Pillar 3: 5-Year Continuous Residence */}
          <div className="card p-5 flex flex-col justify-between hover:border-emerald-500/50 transition-all">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
                    <FileText className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Pillar 3
                  </span>
                </div>
                {isResidencyMet ? (
                  <span className="chip chip-emerald text-[11px] font-bold">
                    ✓ 5/5 Years
                  </span>
                ) : (
                  <span className="chip chip-amber text-[11px] font-bold">
                    {completedResidencyYears}/{totalResidencyYears} Years
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  5-Year Continuous Residence
                </h3>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-black font-mono text-slate-900 dark:text-white">
                    {completedResidencyYears}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">/ 5 years complete</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-white/5 rounded-full h-2 mt-2 overflow-hidden">
                  <div
                    className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(completedResidencyYears / totalResidencyYears) * 100}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-white/5 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex justify-between">
                  <span>Rule:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    150 pts per reckonable year
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Target Years:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {targetYear} down to {targetYear - 4}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Pending Action:</span>
                  <span className="font-semibold text-amber-600 dark:text-amber-400">
                    {incompleteYears.length === 0 ? 'None' : `Year ${incompleteYears[0].year} needs 50pts`}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onNavigate('vault')}
              className="btn btn-secondary w-full mt-4 flex items-center justify-center gap-1.5 text-xs font-semibold"
            >
              <span>Open 150-Point Vault</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Immediate Action Item Banner */}
      {!isFullyReady && incompleteYears.length > 0 && (
        <div className="card p-5 border-amber-300/80 bg-amber-50/60 dark:border-amber-500/30 dark:bg-amber-950/20">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-200 dark:bg-amber-900/60 flex items-center justify-center text-amber-800 dark:text-amber-200 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-amber-950 dark:text-amber-200">
                  Priority Action Item: Complete Year {incompleteYears[0].year} Residency Proof
                </h4>
                <p className="text-xs text-amber-900/80 dark:text-amber-300/90 mt-0.5">
                  Year {incompleteYears[0].year} currently has <strong>{incompleteYears[0].currentPoints} points</strong> (EDS verified).
                  Upload 1 Type B document (such as an Electric Ireland / Bord Gáis utility bill, RTB tenancy registration, or TV licence) worth <strong>50 points</strong> to satisfy the 150-point requirement.
                </p>
              </div>
            </div>

            <button
              onClick={() => onNavigate('vault')}
              className="btn btn-primary shrink-0 w-full sm:w-auto flex items-center justify-center gap-1.5 text-xs font-bold"
            >
              <Upload className="w-4 h-4" />
              <span>Add Document for {incompleteYears[0].year}</span>
            </button>
          </div>
        </div>
      )}

      {/* Year-by-Year Scorecard Progress Strip */}
      <div className="card p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              5-Year Continuous Residence Timeline ({targetYear - 4} – {targetYear})
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Each year must strictly total 150 points using Department of Justice approved documents.
            </p>
          </div>

          <button
            onClick={() => onNavigate('vault')}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            <span>Manage All Vault Scorecards</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 pt-2">
          {residencyCards.map((card) => {
            const isDone = card.isComplete;
            return (
              <div
                key={card.year}
                onClick={() => onNavigate('vault')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all hover:scale-[1.02] ${
                  isDone
                    ? 'border-emerald-300 dark:border-emerald-800/80 bg-emerald-50/40 dark:bg-emerald-950/20'
                    : 'border-amber-300 dark:border-amber-800/80 bg-amber-50/40 dark:bg-amber-950/20 ring-1 ring-amber-400/40'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono font-bold text-xs text-slate-900 dark:text-white">
                    {card.year}
                  </span>
                  {isDone ? (
                    <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  ) : (
                    <span className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-mono font-bold text-[10px]">
                      !
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="text-lg font-black font-mono text-slate-900 dark:text-white">
                    {card.currentPoints} <span className="text-[10px] text-slate-500 font-normal">/ 150 pts</span>
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-400">
                    {card.documents.length} document(s)
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-white/5 flex items-center justify-between text-[10px]">
                  <span className={isDone ? 'text-emerald-700 dark:text-emerald-400 font-semibold' : 'text-amber-700 dark:text-amber-400 font-semibold'}>
                    {isDone ? '✓ Verified' : 'Needs 50 pts'}
                  </span>
                  <span className="text-slate-400">View →</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Launch & Security Watermark Suite */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Dossier Export & Printing */}
        <div className="card p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              <Download className="w-3.5 h-3.5" />
              <span>Official Submission Pack</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Export Master Form 8 Citizenship Dossier
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Generate an official, indexed PDF compilation containing your Cover Letter, 1,827-day reckonable residence report, and 150-point document checklist to attach to Form 8.
            </p>
          </div>

          {/* Additional Explanation / Cover Letter Notes Input */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Additional Explanation for Cover Letter (Optional)
              </label>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                Auto-included in PDF Page 1
              </span>
            </div>
            <textarea
              rows={3}
              value={coverLetterNotes}
              onChange={(e) => {
                setCoverLetterNotes(e.target.value);
                localStorage.setItem('isd_cover_letter_notes', e.target.value);
              }}
              placeholder="Type any short explanations or clarifications for the ISD caseworker here (e.g. why a Peace Commissioner certified your passport, why a DSP letter is used as Type B, or notes on bank activity / absences)..."
              className="w-full rounded-xl border border-slate-300 dark:border-white/15 bg-slate-50 dark:bg-white/[0.03] px-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none transition-colors"
            />
          </div>

          <div className="pt-1">
            <button
              onClick={() => {
                handleTriggerCelebration();
                setDossierModalOpen(true);
              }}
              className="btn btn-primary w-full flex items-center justify-center gap-2 text-xs font-bold"
            >
              <Download className="w-4 h-4" />
              <span>Preview & Export Master Dossier (PDF)</span>
            </button>
          </div>
        </div>

        {/* Anti-Theft Watermark Suite */}
        <div className="card p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
              <Lock className="w-3.5 h-3.5" />
              <span>Identity Theft Protection</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Client-Side PDF Anti-Theft Watermarker
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              All documents stored in CitizenScore are stamped with a certified forensic watermark (<em>"SUBMITTED TO ISD FOR IRISH CITIZENSHIP ONLY"</em>) using client-side WebAssembly, ensuring your financial statements and identity copies can never be reused fraudulently.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={() => onNavigate('watermark')}
              className="btn btn-secondary w-full flex items-center justify-center gap-2 text-xs font-semibold"
            >
              <Lock className="w-4 h-4 text-emerald-600" />
              <span>Open Standalone PDF Watermarker</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Official Master Form 8 Citizenship Dossier Modal */}
      <MasterDossierModal
        isOpen={dossierModalOpen}
        onClose={() => setDossierModalOpen(false)}
        user={user}
        stampPeriods={stampPeriods}
        scorecards={scorecards}
        applicationYear={targetYear}
      />
    </div>
  );
};
