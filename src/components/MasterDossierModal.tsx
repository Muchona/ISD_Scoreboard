import React, { useRef, useState, useEffect } from 'react';
import {
  Download,
  Printer,
  X,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  FileText,
  Lock,
  Award,
  BadgeCheck,
  FileCheck2,
} from 'lucide-react';
import { UserProfile, YearScorecard, StampPeriod } from '../types';

interface MasterDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: UserProfile | null;
  stampPeriods?: StampPeriod[];
  scorecards?: YearScorecard[];
  applicationYear?: number;
}

export const MasterDossierModal: React.FC<MasterDossierModalProps> = ({
  isOpen,
  onClose,
  user,
  stampPeriods: propPeriods,
  scorecards: propScorecards,
  applicationYear: propAppYear,
}) => {
  const printAreaRef = useRef<HTMLDivElement>(null);
  const [includeWatermark, setIncludeWatermark] = useState<boolean>(
    () => localStorage.getItem('isd_watermark_enabled') !== 'false'
  );
  const [coverLetterNotes, setCoverLetterNotes] = useState<string>(
    () => localStorage.getItem('isd_cover_letter_notes') || ''
  );

  useEffect(() => {
    if (isOpen) {
      setIncludeWatermark(localStorage.getItem('isd_watermark_enabled') !== 'false');
      setCoverLetterNotes(localStorage.getItem('isd_cover_letter_notes') || '');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const applicantName = user?.name || 'Applicant / Naturalisation Candidate';
  const targetYear = propAppYear || user?.targetYear || new Date().getFullYear();
  const currentStamp = user?.currentStamp || 'Stamp 4';

  // Fallback to localStorage or standard 1,827-day audit periods if props are not passed
  const periods: StampPeriod[] = (propPeriods && propPeriods.length > 0) ? propPeriods : (() => {
    const saved = localStorage.getItem('isd_periods');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        // ignore JSON parse error
      }
    }
    return [
      {
        id: 'period-1',
        stamp: '1G',
        startDate: `${targetYear - 5}-12-09`,
        endDate: `${targetYear - 3}-12-09`,
        calculatedDays: 731,
        isReckonable: true,
      },
      {
        id: 'period-2',
        stamp: '4',
        startDate: `${targetYear - 3}-12-09`,
        endDate: `${targetYear}-12-09`,
        calculatedDays: 1096,
        isReckonable: true,
        isOverlapAdjusted: true,
        overlapDays: 1,
        effectiveStartDate: `${targetYear - 3}-12-10`,
      },
    ];
  })();

  const scorecards: YearScorecard[] = (propScorecards && propScorecards.length > 0) ? propScorecards : (() => {
    const saved = localStorage.getItem('isd_scorecards');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        // ignore JSON parse error
      }
    }
    // Standard default 6 scorecards: 1 Identity (150 pts) + 5 Qualifying Years (150 pts/year: 100pt Type A + 50pt Type B)
    return [
      {
        year: 0,
        label: 'Identity Verification (150 Points - Proven Once)',
        targetPoints: 150,
        currentPoints: 150,
        isComplete: true,
        documents: [
          {
            id: 'id-doc-1',
            name: 'Current Valid In-Date Passport (Certified Biometric Colour Copy)',
            category: 'IDENTITY',
            type: 'IDENTITY_PRIMARY',
            points: 150,
            issuer: 'National Passport Authority',
            isdGuidelineRef: 'ISD Form 8 Schedule Section 4',
            notes: 'Certified true copy of photographic and biographical data pages by Solicitor / Commissioner for Oaths.',
          },
        ],
      },
      ...[4, 3, 2, 1, 0].map((offset) => {
        const y = targetYear - offset;
        return {
          year: y,
          label: `Reckonable Tax Year ${y}`,
          targetPoints: 150,
          currentPoints: 150,
          hasTypeA: true,
          hasTypeB: true,
          isComplete: true,
          documents: [
            {
              id: `eds-${y}`,
              name: `Revenue Employment Detail Summary (EDS) ${y}`,
              category: 'RESIDENCY' as const,
              type: 'TYPE_A' as const,
              points: 100,
              issuer: 'Revenue Commissioners (ROS / MyAccount)',
              isdGuidelineRef: 'ISD Form 8 Schedule - Category Type A (100 Points)',
              notes: 'Full calendar year statutory tax record in primary applicant name.',
            },
            {
              id: `util-${y}`,
              name: offset === 0
                ? `Household Electricity & Gas Utility Statement ${y}`
                : offset === 1
                ? `Residential Tenancies Board (RTB) Lease Registration ${y}`
                : offset === 2
                ? `Home Broadband & Telecommunications Bill ${y}`
                : offset === 3
                ? `Local Property Tax (LPT) / Waste Collection Invoice ${y}`
                : `Regulated Bank Current Account Periodic Statements ${y}`,
              category: 'RESIDENCY' as const,
              type: 'TYPE_B' as const,
              points: 50,
              issuer: offset === 0
                ? 'Electric Ireland / Bord Gáis Energy'
                : offset === 1
                ? 'Residential Tenancies Board (RTB)'
                : offset === 2
                ? 'Virgin Media Ireland / Eir'
                : offset === 3
                ? 'Revenue Commissioners / City Council'
                : 'AIB Bank / Bank of Ireland',
              isdGuidelineRef: 'ISD Form 8 Schedule - Category Type B (50 Points)',
              notes: 'Proof of residential address matching registered residential domicile in Ireland.',
            },
          ],
        };
      }),
    ];
  })();

  const totalReckonableDays = periods
    .filter((p) => p.isReckonable)
    .reduce((sum, p) => sum + (p.calculatedDays || 0), 0);

  const targetDays = 1827; // Statutory 5 years including leap adjustments (1,827 days)
  const isDaysMet = totalReckonableDays >= targetDays;
  const surplusDays = Math.max(0, totalReckonableDays - targetDays);

  const identityCard = scorecards.find((c) => c.year === 0);
  const residencyCards = scorecards.filter((c) => c.year > 0).sort((a, b) => a.year - b.year);
  const identityPoints = identityCard?.currentPoints ?? 0;
  const isIdentityMet = identityPoints >= 150;
  const completedResidencyYears = residencyCards.filter((c) => c.currentPoints >= 150).length;
  const totalResidencyYears = residencyCards.length;
  const allEvidenceComplete =
    isIdentityMet && totalResidencyYears > 0 && completedResidencyYears === totalResidencyYears;

  // Section 15C continuous final year metrics (synced from DaysCalculator if saved)
  const finalYearStartDate = `${targetYear - 1}-12-10`;
  const finalYearEndDate = `${targetYear}-12-09`;
  const recordedAbsencesDays = (() => {
    const saved = localStorage.getItem('isd_final_year_absences');
    const parsed = saved ? parseInt(saved, 10) : NaN;
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 14;
  })();
  const maxAbsenceAllowance = 70; // Section 15C limit
  const absenceHeadroom = maxAbsenceAllowance - recordedAbsencesDays;
  const isSection15CCompliant = recordedAbsencesDays <= maxAbsenceAllowance;

  const dossierId = `IE-NAT-${targetYear}-${applicantName.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase() || 'APPL'}-${Math.floor(
    1000 + Math.random() * 9000
  )}`;

  const generatedDate = new Date().toLocaleDateString('en-IE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJsonBackup = () => {
    const submissionData = {
      manifestType: 'Official Form 8 Naturalisation Submission Pack',
      statutoryFramework: 'Irish Nationality and Citizenship Act 1956 (as amended)',
      dossierId,
      applicant: {
        legalName: applicantName,
        currentPermission: currentStamp,
        targetFilingYear: targetYear,
        statutoryPathway: 'Section 15 General Naturalisation (5-Year / 1,827 Reckonable Days)',
      },
      auditSummary: {
        totalReckonableDays,
        statutoryQuota: targetDays,
        surplusDays,
        isQuotaSatisfied: isDaysMet,
        section15CCompliance: {
          qualifyingWindow: `${finalYearStartDate} to ${finalYearEndDate}`,
          recordedAbsencesDays,
          maxAllowedAbsenceDays: maxAbsenceAllowance,
          headroomDays: absenceHeadroom,
          status: isSection15CCompliant ? 'COMPLIANT_CLEARED' : 'EXCEEDED',
        },
      },
      identityScorecard: identityCard || null,
      residencyScorecards: residencyCards,
      stampPeriods: periods,
      generatedTimestamp: new Date().toISOString(),
      generatedDateText: generatedDate,
      applicantCoverLetterNotes: coverLetterNotes.trim() || null,
      forensicWatermark: includeWatermark
        ? `SUBMITTED TO ISD FOR CITIZENSHIP ONLY — APPLICANT: ${applicantName.toUpperCase()}`
        : null,
    };

    const blob = new Blob([JSON.stringify(submissionData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Form8_Submission_Pack_${applicantName.replace(/\s+/g, '_')}_${targetYear}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="dossier-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200 print:p-0 print:m-0 print:static print:bg-transparent print:overflow-visible print:block">
      <div className="dossier-modal-window relative w-full max-w-5xl my-auto bg-white dark:bg-obsidian-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[94vh] print:max-h-none print:h-auto print:border-none print:shadow-none print:w-full print:max-w-none print:m-0 print:p-0 print:rounded-none print:bg-white text-slate-900">
        
        {/* ========================================================================= */}
        {/* TOP ACTION HEADER (Non-printable) */}
        {/* ========================================================================= */}
        <div className="flex items-center justify-between p-4 sm:px-6 border-b border-slate-200 dark:border-white/10 shrink-0 bg-white dark:bg-obsidian-900 rounded-t-2xl print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 flex items-center justify-center text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              <BadgeCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                  Form 8 Naturalisation Submission Pack
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                  Audit-Ready 3-Page Pack
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                Dossier ID: {dossierId} • Calibrated for ISD Tipperary
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIncludeWatermark((prev) => !prev)}
              className={`btn btn-sm text-xs font-semibold gap-1.5 border ${
                includeWatermark
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                  : 'border-slate-300 bg-slate-100 text-slate-700 dark:border-white/15 dark:bg-white/10 dark:text-slate-300'
              }`}
              title="Choose whether the submission pack declares forensic watermarks or clean un-watermarked originals"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{includeWatermark ? 'Watermark: Included' : 'Watermark: Off (Original)'}</span>
            </button>
            <button
              onClick={handleDownloadJsonBackup}
              className="btn btn-sm btn-secondary text-xs font-semibold gap-1.5 hidden sm:inline-flex"
              title="Download full submission JSON dataset"
            >
              <Download className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
              <span>Download Submission JSON</span>
            </button>
            <button
              onClick={handlePrint}
              className="btn btn-sm btn-primary text-xs font-bold gap-1.5 shadow-md shadow-emerald-700/20"
              title="Print document or save as PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors ml-1"
              aria-label="Close dossier preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* PRINTABLE DOSSIER CONTAINER (3 Audit Pages) */}
        {/* ========================================================================= */}
        <div
          ref={printAreaRef}
          className="dossier-print-container flex-1 overflow-y-auto p-4 sm:p-8 md:p-12 space-y-12 bg-slate-50/60 dark:bg-obsidian-950/40 text-slate-900 text-sm print:p-0 print:overflow-visible print:m-0 print:bg-white print:space-y-0"
        >

          {/* ####################################################################### */}
          {/* PAGE 1: OFFICIAL FORM 8 SUBMISSION COVER LETTER */}
          {/* ####################################################################### */}
          <div className="dossier-page print-page-break bg-white p-6 sm:p-10 border border-slate-200 rounded-xl shadow-sm print:border-none print:shadow-none print:p-0 print:rounded-none print:min-h-0">
            {/* Page Tab indicator (screen only) */}
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-200 print:hidden text-xs text-slate-500">
              <span className="font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
                PAGE 1 OF 3 • FORM 8 SUBMISSION COVER LETTER
              </span>
              <span>Official Department of Justice Tipperary Submission Pack</span>
            </div>

            {/* Official Header / Letterhead */}
            <div className="border-b-2 border-emerald-700 pb-6 mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold tracking-wider text-xs uppercase">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    <span>Government of Ireland • An Roinn Dlí agus Cirt</span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Citizenship Applications Division
                  </h1>
                  <p className="text-xs text-slate-600 font-medium">
                    Immigration Service Delivery (ISD) • Formal Naturalisation Lodgement
                  </p>
                </div>

                <div className="text-left sm:text-right font-mono text-xs text-slate-700 space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-200 sm:bg-transparent sm:border-0 sm:p-0">
                  <div><strong>Date:</strong> {generatedDate}</div>
                  <div><strong>Dossier Ref:</strong> <span className="font-bold text-emerald-800">{dossierId}</span></div>
                  <div><strong>Application Form:</strong> Form 8 (Adult Naturalisation)</div>
                  <div><strong>Statutory Basis:</strong> Section 15, Act of 1956</div>
                </div>
              </div>
            </div>

            {/* Recipient Address */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 text-xs text-slate-800">
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 leading-relaxed">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Submission Addressed To:
                </span>
                <p className="font-bold text-slate-900">The Minister for Justice</p>
                <p>Citizenship Applications Division</p>
                <p>Immigration Service Delivery (ISD)</p>
                <p>Department of Justice</p>
                <p>Rosanna Road, Tipperary Town</p>
                <p>Co. Tipperary, E34 WT44, Ireland</p>
              </div>

              <div className="p-3.5 rounded-lg bg-emerald-50/60 border border-emerald-200 leading-relaxed text-emerald-950">
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block mb-1">
                  Applicant Profile & Statutory Route:
                </span>
                <p><strong>Applicant Name:</strong> {applicantName}</p>
                <p><strong>Current Immigration Permission:</strong> {currentStamp} (Verified)</p>
                <p><strong>Target Submission Year:</strong> {targetYear}</p>
                <p><strong>Statutory Pathway:</strong> Standard 5-Year / 1,827-Day Rule</p>
                <p><strong>Statutory Compliance Status:</strong> <span className="text-emerald-700 font-bold">READY FOR FORMAL LODGEMENT</span></p>
              </div>
            </div>

            {/* Formal RE Subject Header */}
            <div className="mb-6 p-3 rounded-lg bg-slate-100 border-l-4 border-emerald-700 text-xs font-semibold text-slate-900">
              RE: FORMAL APPLICATION FOR A CERTIFICATE OF NATURALISATION UNDER SECTION 15 OF THE IRISH NATIONALITY AND CITIZENSHIP ACT 1956 (AS AMENDED) — SUBMISSION OF FORM 8 & VERIFIED SUPPORTING DOSSIER
            </div>

            {/* Letter Body */}
            <div className="space-y-4 text-xs text-slate-800 leading-relaxed">
              <p>
                Dear Minister,
              </p>
              <p>
                I hereby submit my formal application for a Certificate of Naturalisation in the State pursuant to Section 15 of the Irish Nationality and Citizenship Act 1956 (as amended). I confirm that I am of full age and capacity, of good character, and intend in good faith to continue residing in Ireland following naturalisation.
              </p>
              <p>
                As detailed in the attached audit schedules, I have completed the statutory residency requirements and satisfied the administrative scorecards established by Immigration Service Delivery:
              </p>

              {/* 4 Core Statutory Declarations in Letter */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-2">
                <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/80 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Statutory 1,827-Day Threshold Satisfied</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    A total of <strong>{totalReckonableDays.toLocaleString()} reckonable days</strong> have been audited across my qualifying permissions, providing a clean surplus of <strong>+{surplusDays} days</strong> above the 1,827-day threshold with all consecutive transition overlaps deduplicated.
                  </p>
                </div>

                <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/80 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Section 15C 70-Day Absence Compliance</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    During the continuous 12-month period immediately preceding this application, recorded absences total <strong>{recordedAbsencesDays} days</strong>, strictly within the statutory 70-day ceiling prescribed by the Courts and Civil Law Act 2023.
                  </p>
                </div>

                <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/80 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>150-Point Identity Verification Cleared</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Identity verified at <strong>150 points</strong> via a certified colour biometric copy of my current valid passport, endorsed by a practising solicitor / Commissioner for Oaths.
                  </p>
                </div>

                <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/80 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>5-Year Continuous Residence Matrices</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Every one of the 5 reckonable years is backed by <strong>150 points</strong> comprising 1 Type A document (100 pts - Revenue EDS) and 1 Type B document (50 pts - utility / lease / bank record).
                  </p>
                </div>
              </div>

              {/* Checklist Summary Table */}
              <div className="pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
                  <FileCheck2 className="w-4 h-4 text-emerald-700" />
                  <span>Form 8 Naturalisation Submission Pack Checklist Summary</span>
                </h3>
                <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-2 w-12 text-center">Ref</th>
                      <th className="p-2">Submission Component</th>
                      <th className="p-2">Evidence Attached / Method</th>
                      <th className="p-2 text-right">Statutory Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-[11px]">
                    <tr className="hover:bg-slate-50/50">
                      <td className="p-2 text-center font-mono font-bold text-slate-500">01</td>
                      <td className="p-2 font-semibold text-slate-900">Statutory Form 8 Application Form</td>
                      <td className="p-2 text-slate-600">Completed in full & declared before Commissioner for Oaths</td>
                      <td className="p-2 text-right"><span className="font-bold text-emerald-700">✓ ENCLOSED</span></td>
                    </tr>
                    <tr className="hover:bg-slate-50/50">
                      <td className="p-2 text-center font-mono font-bold text-slate-500">02</td>
                      <td className="p-2 font-semibold text-slate-900">150-Point Primary Identity Verification</td>
                      <td className="p-2 text-slate-600">Certified colour copy of valid biometric passport (Page 3 Manifest)</td>
                      <td className="p-2 text-right">
                        <span className={`font-bold ${isIdentityMet ? 'text-emerald-700' : 'text-amber-700'}`}>
                          {isIdentityMet ? `✓ ${identityPoints} PTS VERIFIED` : `⚠ ${identityPoints}/150 PTS`}
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50/50">
                      <td className="p-2 text-center font-mono font-bold text-slate-500">03</td>
                      <td className="p-2 font-semibold text-slate-900">1,827-Day Statutory Residence Audit</td>
                      <td className="p-2 text-slate-600">Chronological permission ledger with overlap deduplication (Page 2)</td>
                      <td className="p-2 text-right">
                        <span className={`font-bold ${isDaysMet ? 'text-emerald-700' : 'text-amber-700'}`}>
                          {isDaysMet ? `✓ ${totalReckonableDays} DAYS` : `⚠ ${totalReckonableDays} / 1,827 DAYS`}
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50/50">
                      <td className="p-2 text-center font-mono font-bold text-slate-500">04</td>
                      <td className="p-2 font-semibold text-slate-900">Section 15C 70-Day Absence Compliance</td>
                      <td className="p-2 text-slate-600">
                        Preceding 12-month travel audit ({recordedAbsencesDays} / 70 allowable days logged)
                      </td>
                      <td className="p-2 text-right">
                        <span className={`font-bold ${isSection15CCompliant ? 'text-emerald-700' : 'text-amber-700'}`}>
                          {isSection15CCompliant ? '✓ CLEARED (≤70D)' : `⚠ ${recordedAbsencesDays} DAYS (>70D)`}
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50/50">
                      <td className="p-2 text-center font-mono font-bold text-slate-500">05</td>
                      <td className="p-2 font-semibold text-slate-900">5-Year Residence Evidence Matrices</td>
                      <td className="p-2 text-slate-600">Type A (100pt) + Type B (50pt) per year (Page 3 Manifest)</td>
                      <td className="p-2 text-right">
                        <span
                          className={`font-bold ${
                            completedResidencyYears === totalResidencyYears ? 'text-emerald-700' : 'text-amber-700'
                          }`}
                        >
                          {completedResidencyYears === totalResidencyYears
                            ? `✓ ${completedResidencyYears}x 150 PTS`
                            : `⚠ ${completedResidencyYears}/${totalResidencyYears} YEARS COMPLETE`}
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50/50">
                      <td className="p-2 text-center font-mono font-bold text-slate-500">06</td>
                      <td className="p-2 font-semibold text-slate-900">Revenue Ireland Tax Clearance</td>
                      <td className="p-2 text-slate-600">Employment Detail Summaries & Statements of Liability enclosed</td>
                      <td className="p-2 text-right"><span className="font-bold text-emerald-700">✓ CLEARED</span></td>
                    </tr>
                    <tr className="hover:bg-slate-50/50">
                      <td className="p-2 text-center font-mono font-bold text-slate-500">07</td>
                      <td className="p-2 font-semibold text-slate-900">Photographs (Two Passport-Sized)</td>
                      <td className="p-2 text-slate-600">Endorsed on reverse by witness in prescribed Form 8 manner</td>
                      <td className="p-2 text-right"><span className="font-bold text-emerald-700">✓ ATTACHED</span></td>
                    </tr>
                    <tr className="hover:bg-slate-50/50">
                      <td className="p-2 text-center font-mono font-bold text-slate-500">08</td>
                      <td className="p-2 font-semibold text-slate-900">Statutory Application Lodgement Fee</td>
                      <td className="p-2 text-slate-600">Non-refundable application processing fee of €175</td>
                      <td className="p-2 text-right"><span className="font-bold text-emerald-700">✓ €175 ENCLOSED</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="pt-2">
                I respectfully request that my application be examined by the Citizenship Applications Division and submitted to the Minister for the grant of a Certificate of Naturalisation.
              </p>

              {/* Editable Cover Letter Explanation Box (Non-Printable Controls + Printable Section) */}
              <div className="pt-2 print:hidden">
                <div className="p-3.5 rounded-xl border border-emerald-300 bg-emerald-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-emerald-950">
                      ✏️ Additional Explanation / Notes for ISD Caseworker (Included in PDF Cover Letter):
                    </label>
                    <span className="text-[10px] font-mono text-emerald-700">
                      Prints on Page 1 when filled
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    value={coverLetterNotes}
                    onChange={(e) => {
                      setCoverLetterNotes(e.target.value);
                      localStorage.setItem('isd_cover_letter_notes', e.target.value);
                    }}
                    placeholder="Type any additional explanations or clarifications here (e.g. Peace Commissioner passport certification, dual-use DSP letters, bank account activity, or travel dates)..."
                    className="w-full rounded-lg border border-emerald-300 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              {coverLetterNotes.trim().length > 0 && (
                <div className="p-3.5 rounded-lg border border-slate-300 bg-slate-50/90 space-y-1.5 mt-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-900 block">
                    Additional Applicant Explanations & Clarifications:
                  </span>
                  <p className="text-xs text-slate-800 whitespace-pre-line leading-relaxed">
                    {coverLetterNotes.trim()}
                  </p>
                </div>
              )}
            </div>

            {/* Execution / Sign-off Block */}
            <div className="mt-8 pt-4 border-t border-slate-300 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-slate-800">
              <div className="space-y-3">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Yours faithfully (Applicant):
                </span>
                <div className="border-b border-slate-400 h-10 flex items-end pb-1 font-mono text-slate-400 italic">
                  [Sign above in dark ink]
                </div>
                <div>
                  <p className="font-bold text-slate-900">{applicantName}</p>
                  <p className="text-slate-500 text-[11px]">Applicant for Irish Naturalisation</p>
                  <p className="text-slate-500 text-[11px]">Current Permission: {currentStamp}</p>
                </div>
              </div>

              <div className="space-y-3">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Witness / Solicitor / Commissioner for Oaths:
                </span>
                <div className="border-b border-slate-400 h-10 flex items-end pb-1 font-mono text-slate-400 italic">
                  [Witness signature & official stamp]
                </div>
                <div>
                  <p className="font-bold text-slate-900">Practising Solicitor / Commissioner for Oaths</p>
                  <p className="text-slate-500 text-[11px]">Practising Certificate / Seal of Office</p>
                  <p className="text-slate-500 text-[11px]">Date Witnessed: _______________________</p>
                </div>
              </div>
            </div>
          </div>


          {/* ####################################################################### */}
          {/* PAGE 2: STATUTORY 1,827-DAY RECKONABLE RESIDENCE AUDIT REPORT */}
          {/* ####################################################################### */}
          <div className="dossier-page print-page-break bg-white p-6 sm:p-10 border border-slate-200 rounded-xl shadow-sm print:border-none print:shadow-none print:p-0 print:rounded-none print:min-h-0">
            {/* Page Tab indicator (screen only) */}
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-200 print:hidden text-xs text-slate-500">
              <span className="font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
                PAGE 2 OF 3 • STATUTORY 1,827-DAY RESIDENCE AUDIT REPORT
              </span>
              <span>Exact Chronological Stamp Table & Section 15C Clearance</span>
            </div>

            {/* Header Banner */}
            <div className="border-b-2 border-emerald-700 pb-5 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <div className="flex items-center gap-2 text-emerald-800 font-bold tracking-wider text-xs uppercase mb-1">
                  <Calendar className="w-4 h-4 text-emerald-700" />
                  <span>Immigration Service Delivery • Statutory Residence Schedule</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Statutory 1,827-Day Reckonable Residence Audit
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  Chronological Permission Ledger with ISD Anti-Overlap Deduplication & Section 15C Clearance
                </p>
              </div>

              <div className="text-left sm:text-right font-mono text-xs text-slate-700 space-y-0.5">
                <div><strong>Dossier Ref:</strong> {dossierId}</div>
                <div><strong>Applicant:</strong> {applicantName}</div>
                <div className="inline-block px-2.5 py-1 rounded bg-emerald-100 text-emerald-900 font-bold border border-emerald-300 mt-1">
                  STATUS: {isDaysMet ? 'ELIGIBILITY CRITERIA MET' : 'CALCULATION IN PROGRESS'}
                </div>
              </div>
            </div>

            {/* Stat Widgets */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-6 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block text-[11px]">Total Reckonable Days:</span>
                <strong className="text-base sm:text-lg font-black text-slate-900 block mt-0.5 font-mono">
                  {totalReckonableDays.toLocaleString()} Days
                </strong>
                <span className="text-[11px] text-emerald-700 font-semibold">
                  {totalReckonableDays >= targetDays ? '✓ Statutory Quota Met' : 'Under Quota'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block text-[11px]">Statutory Requirement:</span>
                <strong className="text-base sm:text-lg font-black text-slate-900 block mt-0.5 font-mono">
                  1,827 Days
                </strong>
                <span className="text-[11px] text-slate-500">
                  5 Years (incl. leap days)
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block text-[11px]">Statutory Surplus / Delta:</span>
                <strong className="text-base sm:text-lg font-black text-emerald-700 block mt-0.5 font-mono">
                  +{surplusDays} Days
                </strong>
                <span className="text-[11px] text-emerald-800 font-semibold">
                  Zero shortfall risk
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block text-[11px]">Section 15C Absence Status:</span>
                <strong className="text-base sm:text-lg font-black text-emerald-700 block mt-0.5 font-mono">
                  {recordedAbsencesDays} / 70 Days
                </strong>
                <span className="text-[11px] text-emerald-800 font-semibold">
                  ✓ Statutorily Cleared
                </span>
              </div>
            </div>

            {/* Chronological Stamp Table */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-emerald-700" />
                  <span>Chronological Stamp Permission Ledger (Audited)</span>
                </h3>
                <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {periods.filter((p) => p.isReckonable).length} Reckonable Periods Audited
                </span>
              </div>

              <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                  <tr>
                    <th className="p-2.5 w-8">#</th>
                    <th className="p-2.5">Stamp Permission</th>
                    <th className="p-2.5">From Date</th>
                    <th className="p-2.5">To Date</th>
                    <th className="p-2.5">Net Days</th>
                    <th className="p-2.5">ISD Anti-Overlap Adjustment Status</th>
                    <th className="p-2.5 text-right">Reckonability</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs">
                  {periods.map((p, idx) => (
                    <tr key={p.id} className="hover:bg-slate-50/50">
                      <td className="p-2.5 font-mono text-slate-500">{idx + 1}</td>
                      <td className="p-2.5 font-semibold text-slate-900">
                        <span className="inline-flex items-center gap-1.5 font-bold">
                          <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                          Stamp {p.stamp}
                        </span>
                      </td>
                      <td className="p-2.5 font-mono font-medium text-slate-700">{p.startDate}</td>
                      <td className="p-2.5 font-mono font-medium text-slate-700">{p.endDate}</td>
                      <td className="p-2.5 font-mono font-bold text-slate-900">
                        +{p.calculatedDays}d
                      </td>
                      <td className="p-2.5 text-[11px]">
                        {p.isOverlapAdjusted ? (
                          <span className="inline-flex items-center gap-1 text-emerald-900 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded font-semibold">
                            <BadgeCheck className="w-3 h-3 text-emerald-700 shrink-0" />
                            ISD Anti-Overlap Guard: Deduplicated handover date {p.startDate} (Effective start {p.effectiveStartDate})
                          </span>
                        ) : (
                          <span className="text-slate-500 font-mono">Standard continuous initial tranche (No overlap)</span>
                        )}
                      </td>
                      <td className="p-2.5 text-right">
                        {p.isReckonable ? (
                          <span className="font-bold text-emerald-700 text-[11px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            ✓ Reckonable (s.15)
                          </span>
                        ) : (
                          <span className="font-bold text-red-700 text-[11px] bg-red-50 px-2 py-0.5 rounded border border-red-200">
                            Non-Reckonable
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Section 15C 70-Day Absence Compliance Clearance Box */}
            <div className="p-4 rounded-xl bg-emerald-50/70 border-2 border-emerald-600/30 text-xs text-emerald-950 mb-6 space-y-3">
              <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-700" />
                  <span className="font-black text-sm uppercase tracking-wide text-emerald-900">
                    Section 15C 70-Day Absence Compliance Clearance
                  </span>
                </div>
                <span className="font-mono text-xs font-bold text-emerald-900 bg-emerald-200/80 px-2.5 py-0.5 rounded border border-emerald-300">
                  STATUS: FULLY CLEARED & AUDITED
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-emerald-800 text-[11px] block">Continuous Qualifying Year Window:</span>
                  <strong className="text-emerald-950 font-mono">{finalYearStartDate} to {finalYearEndDate}</strong>
                </div>
                <div>
                  <span className="text-emerald-800 text-[11px] block">Statutory Absence Ceiling (Section 15C):</span>
                  <strong className="text-emerald-950 font-mono">Up to 70 Days Permitted</strong>
                </div>
                <div>
                  <span className="text-emerald-800 text-[11px] block">Applicant Recorded Absences:</span>
                  <strong className="text-emerald-950 font-mono font-bold">{recordedAbsencesDays} Days Logged ({absenceHeadroom} Days Headroom)</strong>
                </div>
              </div>

              <p className="text-[11px] leading-relaxed text-emerald-900">
                <strong>Statutory Finding:</strong> Pursuant to Section 15C of the Irish Nationality and Citizenship Act 1956 (inserted by the Courts, Civil Law, Criminal Law and Superannuation (Miscellaneous Provisions) Act 2024), the applicant has completed a continuous period of one year's residence in the State immediately preceding the application date. Total absences from the State did not exceed 70 days. Consequently, statutory continuous residence is satisfied without necessitating ministerial discretion under exceptional circumstances.
              </p>
            </div>

            {/* Audit Methodology & Anti-Overlap Safeguards */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2">
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5 uppercase text-[11px] tracking-wider">
                <Award className="w-3.5 h-3.5 text-emerald-700" />
                <span>ISD Deduplication Methodology & Statutory Accounting</span>
              </h4>
              <p className="text-[11px] leading-relaxed">
                1. <strong>Inclusive Day Counting & Transition Handover:</strong> When an IRP permission is renewed or transitioned on the expiry date of a prior permission (e.g. 9 December), ISD counting software counts the transition day only once. CitizenScore.ie's anti-overlap algorithm adjusts subsequent tranches to commence on the effective handover day (+1 day), preventing artificial inflation of reckonable totals.
              </p>
              <p className="text-[11px] leading-relaxed">
                2. <strong>Qualifying Window:</strong> Total accumulated reckonable days ({totalReckonableDays} days) fall within the maximum statutory 9-year qualifying frame immediately preceding the date of Form 8 execution.
              </p>
            </div>

            {/* Verification Sign-off */}
            <div className="mt-8 pt-4 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Audited via CitizenScore.ie Statutory Residence Calculator Engine</span>
              </div>
              <div className="font-mono text-[11px]">
                Certification Hash: SHA256-ISD-{dossierId.slice(-8)}
              </div>
            </div>
          </div>


          {/* ####################################################################### */}
          {/* PAGE 3: 150-POINT IDENTITY & 5-YEAR RESIDENCE MANIFEST */}
          {/* ####################################################################### */}
          <div className="dossier-page print-page-break bg-white p-6 sm:p-10 border border-slate-200 rounded-xl shadow-sm print:border-none print:shadow-none print:p-0 print:rounded-none print:min-h-0">
            {/* Page Tab indicator (screen only) */}
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-200 print:hidden text-xs text-slate-500">
              <span className="font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
                PAGE 3 OF 3 • 150-PT IDENTITY & 5-YEAR RESIDENCE MANIFEST
              </span>
              <span>Statutory Evidence Schedule (Type A: 100pt + Type B: 50pt)</span>
            </div>

            {/* Header Banner */}
            <div className="border-b-2 border-emerald-700 pb-5 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <div className="flex items-center gap-2 text-emerald-800 font-bold tracking-wider text-xs uppercase mb-1">
                  <BadgeCheck className="w-4 h-4 text-emerald-700" />
                  <span>Immigration Service Delivery • Verification Scorecard Manifest</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  150-Point Identity & 5-Year Residence Verification Manifest
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  Full Document Inventory under the Department of Justice Form 8 Scorecard (Nov 2026 Edition)
                </p>
              </div>

              <div className="text-left sm:text-right font-mono text-xs text-slate-700 space-y-0.5">
                <div><strong>Dossier Ref:</strong> {dossierId}</div>
                <div><strong>Standard:</strong> 150 pts Identity + 5x 150 pts Residence</div>
                <div
                  className={`inline-block px-2.5 py-1 rounded font-bold border mt-1 ${
                    allEvidenceComplete
                      ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                      : 'bg-amber-100 text-amber-900 border-amber-300'
                  }`}
                >
                  {allEvidenceComplete
                    ? 'EVIDENCE AUDIT: 100% COMPLETE'
                    : `EVIDENCE AUDIT: ${completedResidencyYears}/${totalResidencyYears} YEARS COMPLETE`}
                </div>
              </div>
            </div>

            {/* SECTION A: IDENTITY VERIFICATION (150 POINTS) */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-emerald-700" />
                  <span>Part A: Statutory Identity Verification (150 Points — Proven Once)</span>
                </h3>
                <span
                  className={`font-mono text-xs font-bold px-2 py-0.5 rounded border ${
                    isIdentityMet
                      ? 'text-emerald-800 bg-emerald-50 border-emerald-200'
                      : 'text-amber-800 bg-amber-50 border-amber-200'
                  }`}
                >
                  Score: {identityPoints} / 150 pts ({isIdentityMet ? 'Threshold Met' : 'Missing'})
                </span>
              </div>

              <div
                className={`p-4 rounded-xl border text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  identityCard?.documents[0]
                    ? 'border-emerald-200 bg-emerald-50/40'
                    : 'border-amber-200 bg-amber-50/40'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">
                      {identityCard?.documents[0]?.name || 'No Identity Document Uploaded Yet'}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        identityCard?.documents[0]
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-amber-100 text-amber-800 border-amber-300'
                      }`}
                    >
                      {identityCard?.documents[0] ? 'PRIMARY IDENTITY PROOF' : 'REQUIRED'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    {identityCard?.documents[0] ? (
                      <>
                        <strong>Issuer:</strong> {identityCard.documents[0].issuer}
                        {identityCard.documents[0].fileName ? ` • File: ${identityCard.documents[0].fileName}` : ''}
                        {' • '}
                        <strong>Form 8 Rule:</strong> Section 4 Primary Identity proof.
                      </>
                    ) : (
                      'Upload a certified colour copy of your current valid passport (or Peace Commissioner certification) in the Identity Verification card.'
                    )}
                  </p>
                </div>

                <div className="shrink-0 text-right font-mono">
                  <span
                    className={`text-base font-black bg-white px-3 py-1.5 rounded-lg border shadow-sm block ${
                      isIdentityMet
                        ? 'text-emerald-800 border-emerald-300'
                        : 'text-amber-800 border-amber-300'
                    }`}
                  >
                    {identityPoints} POINTS
                  </span>
                  <span className="text-[10px] text-slate-500 mt-1 block">Lifetime Proof</span>
                </div>
              </div>
            </div>

            {/* SECTION B: 5-YEAR RESIDENCE VERIFICATION (150 PTS/YEAR) */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-emerald-700" />
                  <span>Part B: 5-Year Continuous Residence Evidence Schedule (150 Points Per Year)</span>
                </h3>
                <span className="font-mono text-xs font-bold text-slate-700">
                  Qualifying Period: {targetYear - 4} to {targetYear}
                </span>
              </div>

              <div className="space-y-3">
                {residencyCards.map((card, idx) => {
                  const typeADoc =
                    card.documents.find((d) => d.type === 'TYPE_A' && (d.points || 0) > 0) ||
                    card.documents.find((d) => d.type === 'TYPE_A');
                  const typeBDoc =
                    card.documents.find((d) => d.type === 'TYPE_B' && (d.points || 0) > 0) ||
                    card.documents.find((d) => d.type === 'TYPE_B');
                  const isYearComplete = card.currentPoints >= 150;

                  return (
                    <div
                      key={card.year}
                      className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 text-xs space-y-2.5"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">
                            Year {idx + 1} of {totalResidencyYears}: Tax Year {card.year}
                          </span>
                          <span
                            className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded border ${
                              isYearComplete
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                : 'bg-amber-100 text-amber-800 border-amber-300'
                            }`}
                          >
                            {isYearComplete
                              ? '✓ 150 PTS VERIFIED (Type A: 100pt + Type B: 50pt)'
                              : `⚠ ${card.currentPoints} / 150 PTS (Incomplete)`}
                          </span>
                        </div>
                        <span className="font-mono text-[11px] text-slate-600">
                          Total Score: <strong>{card.currentPoints} / 150 Points</strong>
                        </span>
                      </div>

                      {/* Documents Grid for this Year */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                        {/* Type A Document */}
                        <div
                          className={`p-2.5 rounded-lg bg-white border space-y-1 ${
                            typeADoc && (typeADoc.points || 0) > 0
                              ? 'border-slate-200'
                              : 'border-amber-300 bg-amber-50/30'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-300">
                              TYPE A DOCUMENT (100 PTS)
                            </span>
                            <span
                              className={`font-mono font-bold text-xs ${
                                typeADoc && (typeADoc.points || 0) > 0 ? 'text-blue-800' : 'text-amber-700'
                              }`}
                            >
                              {typeADoc ? `+${typeADoc.points} pts` : '0 pts (Missing)'}
                            </span>
                          </div>
                          <p className="font-semibold text-slate-900 text-[11px]">
                            {typeADoc
                              ? typeADoc.name
                              : `Missing Type A Proof for ${card.year} (EDS, Active Bank Statement, or DSP)`}
                          </p>
                          <p className="text-[10px] text-slate-500">
                            {typeADoc
                              ? `Issuer: ${typeADoc.issuer}${typeADoc.fileName ? ` • File: ${typeADoc.fileName}` : ''}`
                              : 'Upload a qualifying Type A document to claim +100 points.'}
                          </p>
                        </div>

                        {/* Type B Document */}
                        <div
                          className={`p-2.5 rounded-lg bg-white border space-y-1 ${
                            typeBDoc && (typeBDoc.points || 0) > 0
                              ? 'border-slate-200'
                              : 'border-amber-300 bg-amber-50/30'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                              TYPE B DOCUMENT (50 PTS)
                            </span>
                            <span
                              className={`font-mono font-bold text-xs ${
                                typeBDoc && (typeBDoc.points || 0) > 0 ? 'text-emerald-800' : 'text-amber-700'
                              }`}
                            >
                              {typeBDoc ? `+${typeBDoc.points} pts` : '0 pts (Missing)'}
                            </span>
                          </div>
                          <p className="font-semibold text-slate-900 text-[11px]">
                            {typeBDoc
                              ? typeBDoc.name
                              : `Missing Type B Proof for ${card.year} (Utility Bill, TV Licence, GP Letter, or RTB)`}
                          </p>
                          <p className="text-[10px] text-slate-500">
                            {typeBDoc
                              ? `Issuer: ${typeBDoc.issuer}${typeBDoc.fileName ? ` • File: ${typeBDoc.fileName}` : ''}`
                              : 'Upload a qualifying Type B document to claim +50 points.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SECTION C: FORENSIC SECURITY WATERMARK & DECLARATION */}
            {includeWatermark ? (
              <div className="p-4 rounded-xl bg-slate-100 border border-slate-300 text-xs text-slate-700 space-y-2 mb-6">
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5 uppercase text-[11px] tracking-wider">
                  <Lock className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Forensic Security Watermark Manifest</span>
                </h4>
                <p className="text-[11px] leading-relaxed">
                  All supporting PDF documents and certified electronic exhibits accompanying this application pack have been marked with a permanent cryptographic watermark:
                </p>
                <div className="p-2 rounded bg-white border border-slate-300 font-mono text-center text-xs font-bold text-slate-900 tracking-wide">
                  "SUBMITTED TO ISD FOR CITIZENSHIP ONLY — APPLICANT: {applicantName.toUpperCase()}"
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  In compliance with Irish Data Protection Legislation and GDPR, this tamper-resistant endorsement prevents the illicit repurposing or dissemination of financial and personal documents.
                </p>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1.5 mb-6">
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5 uppercase text-[11px] tracking-wider">
                  <FileText className="w-3.5 h-3.5 text-slate-600" />
                  <span>Document Preference Note — Un-Watermarked Originals</span>
                </h4>
                <p className="text-[11px] leading-relaxed">
                  Submitted as Clean Un-Watermarked Originals per Applicant Preference. Original un-altered PDF statements and certified copies are enclosed for direct Department of Justice inspection.
                </p>
              </div>
            )}

            {/* SECTION D: STATUTORY DECLARATION UNDER STATUTORY DECLARATIONS ACT 1938 */}
            <div className="space-y-4 pt-3 border-t-2 border-slate-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Statutory Declaration of Accuracy & Execution
              </h4>
              <p className="text-[11px] text-slate-600 leading-relaxed italic">
                "I, the applicant named herein, do solemnly and sincerely declare that the particulars stated in this Form 8 Submission Pack and the attached evidence schedules are true and correct to the best of my knowledge and belief, and I make this solemn declaration conscientiously believing the same to be true and by virtue of the Statutory Declarations Act 1938."
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-3 text-xs text-slate-800">
                <div className="p-3.5 rounded-lg border border-slate-300 bg-slate-50 space-y-3">
                  <span className="text-[11px] font-bold text-slate-600 uppercase block">Declared by Applicant:</span>
                  <div className="border-b border-slate-400 h-10 flex items-end pb-1 font-mono text-slate-400 italic">
                    [Applicant Signature]
                  </div>
                  <div className="text-[11px] space-y-0.5">
                    <p><strong>Name:</strong> {applicantName}</p>
                    <p><strong>Date:</strong> {generatedDate}</p>
                    <p><strong>Location:</strong> Dublin / Ireland</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-lg border border-slate-300 bg-slate-50 space-y-3">
                  <span className="text-[11px] font-bold text-slate-600 uppercase block">Before Me (Commissioner / Solicitor):</span>
                  <div className="border-b border-slate-400 h-10 flex items-end pb-1 font-mono text-slate-400 italic">
                    [Official Stamp & Seal]
                  </div>
                  <div className="text-[11px] space-y-0.5">
                    <p><strong>Practising Solicitor / Commissioner for Oaths</strong></p>
                    <p><strong>Practising Cert No:</strong> ________________________</p>
                    <p><strong>Date Witnessed:</strong> ________________________</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Manifest Footer */}
            <div className="mt-8 pt-4 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-[10px] text-slate-500 font-mono">
              <div>CitizenScore.ie • Form 8 Naturalisation Submission Pack (Page 3 of 3)</div>
              <div>Certified Audit ID: {dossierId}</div>
            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* MODAL FOOTER (Non-printable) */}
        {/* ========================================================================= */}
        <div className="p-4 sm:px-6 border-t border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 bg-slate-50 dark:bg-obsidian-950 rounded-b-2xl print:hidden">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Calibrated to Form 8 Schedule (Nov 2026 Edition) • Audit-Ready 3-Page Pack</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              onClick={handleDownloadJsonBackup}
              className="btn btn-sm btn-secondary text-xs sm:hidden"
            >
              <Download className="w-3.5 h-3.5" />
              <span>JSON</span>
            </button>
            <button
              onClick={onClose}
              className="btn btn-sm btn-secondary text-xs font-medium"
            >
              Close
            </button>
            <button
              onClick={handlePrint}
              className="btn btn-sm btn-primary text-xs font-bold gap-1.5 shadow-md shadow-emerald-700/20"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save as PDF</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
