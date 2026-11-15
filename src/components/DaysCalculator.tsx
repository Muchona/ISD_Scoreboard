import React, { useState, useMemo, useEffect } from 'react';
import {
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  Calendar,
  RotateCcw,
  Printer,
  Info,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { IsdCitation } from './IsdCitation';
import { StampPeriod, StampType } from '../types';
import { ISD_OFFICIAL_URLS } from '../data/isdPointsTable';

interface DaysCalculatorProps {
  onGoToVault: () => void;
}

export function isStampReckonable(stamp: StampType): boolean {
  return ['1', '1G', '4', '3', '5', '6'].includes(stamp);
}

export function calculateDaysBetween(startDateStr: string, endDateStr: string): number {
  if (!startDateStr || !endDateStr) return 0;
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) return 0;
  const diffTime = end.getTime() - start.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1; // inclusive
}

export const DaysCalculator: React.FC<DaysCalculatorProps> = ({ onGoToVault }) => {
  // 1. Applicant Metadata (similar to official ISD calculator)
  const [applicantName, setApplicantName] = useState<string>('');
  const [applicationDate, setApplicationDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [isSpousal, setIsSpousal] = useState<boolean>(false);
  const [finalYearAbsenceDays, setFinalYearAbsenceDays] = useState<number>(() => {
    const saved = localStorage.getItem('isd_final_year_absences');
    const parsed = saved ? parseInt(saved, 10) : NaN;
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 14;
  });

  // 2. Chronological Stamp Periods (Start Date, End Date, Stamp Type)
  const [periods, setPeriods] = useState<StampPeriod[]>(() => {
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
      },
    ];
  });

  // Target Days
  const targetDays = isSpousal ? 1095 : 1825;
  const statutoryYears = isSpousal ? 5 : 9;

  // Compute Statutory Window based on Application Date
  const { statutoryStartDate, finalYearStartDate } = useMemo(() => {
    const appDate = new Date(applicationDate);
    if (isNaN(appDate.getTime())) {
      return { statutoryStartDate: '', finalYearStartDate: '' };
    }
    const statStart = new Date(appDate);
    statStart.setFullYear(statStart.getFullYear() - statutoryYears);

    const finalStart = new Date(appDate);
    finalStart.setFullYear(finalStart.getFullYear() - 1);

    return {
      statutoryStartDate: statStart.toISOString().split('T')[0],
      finalYearStartDate: finalStart.toISOString().split('T')[0],
    };
  }, [applicationDate, statutoryYears]);

  // Calculate live days for each period with ISD Anti-Overlap / Transition Date Deduplication
  const evaluatedPeriods = useMemo(() => {
    let latestCoveredDate: string | null = null;

    return periods.map((p) => {
      const isReck = isStampReckonable(p.stamp);
      const rawDays = calculateDaysBetween(p.startDate, p.endDate);

      if (!p.startDate || !p.endDate || rawDays === 0) {
        return {
          ...p,
          calculatedDays: 0,
          isReckonable: isReck,
          isOverlapAdjusted: false,
          overlapDays: 0,
        };
      }

      let effectiveStart = p.startDate;
      let isOverlapAdjusted = false;
      let overlapDays = 0;

      // In official ISD calculation: if current start date <= latestCoveredDate from previous periods,
      // the overlapping days are already counted. Start date is adjusted to the day after latestCoveredDate.
      if (latestCoveredDate && p.startDate <= latestCoveredDate) {
        isOverlapAdjusted = true;
        const overlapEnd = p.endDate < latestCoveredDate ? p.endDate : latestCoveredDate;
        overlapDays = calculateDaysBetween(p.startDate, overlapEnd);

        // Effective start is day after latestCoveredDate
        const nextDay = new Date(latestCoveredDate);
        nextDay.setDate(nextDay.getDate() + 1);
        effectiveStart = nextDay.toISOString().split('T')[0];
      }

      let calculatedDays = 0;
      if (effectiveStart <= p.endDate) {
        calculatedDays = calculateDaysBetween(effectiveStart, p.endDate);
      }

      // Update latest covered date if this period extends it
      if (!latestCoveredDate || p.endDate > latestCoveredDate) {
        latestCoveredDate = p.endDate;
      }

      return {
        ...p,
        calculatedDays,
        isReckonable: isReck,
        isOverlapAdjusted,
        overlapDays,
        effectiveStartDate: isOverlapAdjusted ? effectiveStart : undefined,
      };
    });
  }, [periods]);

  // Total reckonable days
  const totalReckonableDays = useMemo(() => {
    return evaluatedPeriods
      .filter((p) => p.isReckonable)
      .reduce((sum, p) => sum + p.calculatedDays, 0);
  }, [evaluatedPeriods]);

  const percentage = Math.min(100, Math.round((totalReckonableDays / targetDays) * 100));
  const isDaysGoalReached = totalReckonableDays >= targetDays;

  // Section 15C Absence criteria
  const isAbsenceCompliant = finalYearAbsenceDays <= 70;
  const isAbsenceExceptional = finalYearAbsenceDays > 70 && finalYearAbsenceDays <= 100;
  const isAbsenceHardCapExceeded = finalYearAbsenceDays > 100;

  const isOverallEligible = isDaysGoalReached && !isAbsenceHardCapExceeded;

  // Persist evaluated periods & absence days so Dashboard and Dossier stay in real-time sync
  useEffect(() => {
    localStorage.setItem('isd_periods', JSON.stringify(evaluatedPeriods));
  }, [evaluatedPeriods]);

  useEffect(() => {
    localStorage.setItem('isd_final_year_absences', String(finalYearAbsenceDays));
  }, [finalYearAbsenceDays]);

  const handlePeriodChange = (
    id: string,
    field: 'startDate' | 'endDate' | 'stamp',
    value: string
  ) => {
    setPeriods((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const updated = { ...p, [field]: value };
        const days = calculateDaysBetween(updated.startDate, updated.endDate);
        const isReck = isStampReckonable(updated.stamp);
        return {
          ...updated,
          calculatedDays: days,
          isReckonable: isReck,
        };
      })
    );
  };

  const handleAddPeriod = (stampType: StampType = '4') => {
    const isReck = isStampReckonable(stampType);
    const newPeriod: StampPeriod = {
      id: Date.now().toString(),
      stamp: stampType,
      startDate: '',
      endDate: '',
      calculatedDays: 0,
      isReckonable: isReck,
    };
    setPeriods((prev) => [...prev, newPeriod]);
  };

  const handleRemovePeriod = (id: string) => {
    if (periods.length <= 1) return;
    setPeriods((prev) => prev.filter((p) => p.id !== id));
  };

  const handleResetToDefault = () => {
    setPeriods([
      {
        id: '1',
        stamp: '1',
        startDate: '2021-01-01',
        endDate: '2022-12-31',
        calculatedDays: 730,
        isReckonable: true,
      },
      {
        id: '2',
        stamp: '4',
        startDate: '2023-01-01',
        endDate: '2025-12-31',
        calculatedDays: 1095,
        isReckonable: true,
      },
    ]);
  };

  const triggerCelebration = () => {
    confetti({
      particleCount: 120,
      spread: 75,
      origin: { y: 0.6 },
      colors: ['#00875A', '#10B981', '#F59E0B', '#2563EB'],
    });
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-6xl mx-auto w-full">
      {/* Header Banner */}
      <div className="card p-4 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="chip chip-emerald">
              100% Free Reckonable Clock
            </span>
            <IsdCitation
              title="Official ISD Residency Calculator"
              url={ISD_OFFICIAL_URLS.residencyCalculator}
              tag="ISD Calculator"
            />
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Naturalisation Residency & Absence Calculator
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Calibrated to the official Immigration Service Delivery method: date ranges, stamp permissions, statutory lookback windows, and Section 15C absence rules.
          </p>
        </div>

        {/* Spousal vs General Pathway Switcher */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 w-full sm:w-auto rounded-xl bg-slate-100 p-1 ring-1 ring-inset ring-slate-200 shrink-0 dark:bg-white/5 dark:ring-white/10">
          <button
            onClick={() => setIsSpousal(false)}
            className={`px-3 py-2 text-xs font-semibold rounded-lg text-center transition-all ${
              !isSpousal
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            General (5 Years / 1,825d)
          </button>
          <button
            onClick={() => setIsSpousal(true)}
            className={`px-3 py-2 text-xs font-semibold rounded-lg text-center transition-all ${
              isSpousal
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Spouse of Irish Citizen (3y / 1,095d)
          </button>
        </div>
      </div>

      {/* Calculator Form Controls: Application Parameters */}
      <div className="card p-4 sm:p-6 space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Step 1: Application Date & Statutory Windows</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
              Applicant Name <span className="text-slate-500 dark:text-slate-400 font-normal">(Optional, for summary)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Maria Silva"
              value={applicantName}
              onChange={(e) => setApplicantName(e.target.value)}
              className="input"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
              Target Application Date <span className="text-emerald-600 font-bold">*</span>
            </label>
            <input
              type="date"
              value={applicationDate}
              onChange={(e) => setApplicationDate(e.target.value)}
              className="input font-mono font-medium"
            />
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 font-medium">
              Note: Must be on or before your current IRP permission expires.
            </p>
          </div>

          <div className="card-inset p-3.5 flex flex-col justify-between text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-700 dark:text-slate-300 font-medium">Statutory Window ({statutoryYears}y lookback):</span>
              <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                {statutoryStartDate || '—'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-700 dark:text-slate-300 font-medium">Continuous Final Year Window:</span>
              <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                {finalYearStartDate || '—'} to {applicationDate}
              </span>
            </div>
            <div className="flex justify-between text-[11px] text-slate-600 dark:text-slate-400 pt-1 border-t border-slate-200/80 dark:border-white/5 font-medium">
              <span>Target Threshold:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-slate-200">
                {targetDays} reckonable days
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Stamp Periods Table (Left 7 Cols) & Summary / Absence (Right 5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">

        {/* Left Column: Official-Style Chronological Stamp Periods (7 cols) */}
        <div className="lg:col-span-7 card p-4 sm:p-6 space-y-5 transition-colors">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="eyebrow">Step 2: Permission Stamps</span>
              <h2 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                Immigration Stamp History (Oldest to Newest)
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleAddPeriod('4')}
                className="btn btn-sm btn-primary"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Period</span>
              </button>
              <button
                onClick={handleResetToDefault}
                className="btn btn-sm btn-secondary"
                title="Reset sample periods"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <p className="text-xs text-slate-700 dark:text-slate-300 font-normal">
            Enter your immigration permission history chronologically. Day counts are automatically calculated inclusive of start and end dates.
          </p>

          {/* Chronological Table of Periods */}
          <div className="space-y-3">
            {evaluatedPeriods.map((period, index) => {
              const hasInvalidDates =
                period.startDate &&
                period.endDate &&
                new Date(period.endDate) < new Date(period.startDate);

              return (
                <div
                  key={period.id}
                  className={`p-3.5 sm:p-4 rounded-xl border transition-all ${
                    !period.isReckonable
                      ? 'border-amber-300 dark:border-amber-800/80 bg-amber-50/40 dark:bg-amber-950/20'
                      : 'card-inset'
                  }`}
                >
                  {/* Period Header */}
                  <div className="flex flex-wrap sm:flex-nowrap items-start justify-between gap-2 mb-3">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center font-mono font-bold text-xs text-slate-700 dark:text-slate-300 shrink-0">
                        {index + 1}
                      </span>
                      <span className="font-bold text-xs text-slate-900 dark:text-white">
                        {index === 0
                          ? 'Oldest Stamp Period'
                          : index === evaluatedPeriods.length - 1
                          ? 'Latest / Current Stamp'
                          : `Stamp Period ${index + 1}`}
                      </span>

                      {period.isReckonable ? (
                        <span className="chip chip-emerald font-mono font-bold text-[10px] sm:text-[11px] h-6 px-2 shrink-0">
                          RECKONABLE (+{period.calculatedDays}d)
                        </span>
                      ) : (
                        <span className="chip chip-amber font-mono font-bold text-[10px] sm:text-[11px] h-6 px-2 shrink-0">
                          NON-RECKONABLE (0d)
                        </span>
                      )}

                      {period.isOverlapAdjusted && (
                        <span className="chip bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-300 dark:border-sky-800 font-mono font-semibold text-[10px] h-6 px-2 flex items-center gap-1 shrink-0">
                          <Info className="w-3 h-3 text-sky-600 dark:text-sky-400" />
                          ISD OVERLAP ADJ (-{period.overlapDays}d)
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleRemovePeriod(period.id)}
                      disabled={periods.length <= 1}
                      className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 disabled:opacity-30 disabled:hover:bg-transparent shrink-0"
                      title="Remove stamp period"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Input Fields: Start Date, End Date, Stamp Type */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Start Date (From)
                      </label>
                      <input
                        type="date"
                        value={period.startDate}
                        onChange={(e) =>
                          handlePeriodChange(period.id, 'startDate', e.target.value)
                        }
                        className="input font-mono text-xs font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        End Date (To)
                      </label>
                      <input
                        type="date"
                        value={period.endDate}
                        onChange={(e) =>
                          handlePeriodChange(period.id, 'endDate', e.target.value)
                        }
                        className="input font-mono text-xs font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Stamp Permission
                      </label>
                      <select
                        value={period.stamp}
                        onChange={(e) =>
                          handlePeriodChange(period.id, 'stamp', e.target.value)
                        }
                        className="input text-xs font-semibold text-slate-900 dark:text-slate-100"
                      >
                        <optgroup label="Reckonable Permissions">
                          <option value="1">Stamp 1 (Employment Permit)</option>
                          <option value="1G">Stamp 1G (Third Level / Partner)</option>
                          <option value="4">Stamp 4 (Permanent / Long Term)</option>
                          <option value="3">Stamp 3 (Dependant / Volunteer)</option>
                          <option value="5">Stamp 5 (Without Condition Time)</option>
                          <option value="6">Stamp 6 (Without Condition)</option>
                        </optgroup>
                        <optgroup label="Non-Reckonable Permissions">
                          <option value="2">Stamp 2 (Student — Non-Reckonable)</option>
                          <option value="2A">Stamp 2A (Student — Non-Reckonable)</option>
                          <option value="1A">Stamp 1A (Trainee Accountant)</option>
                        </optgroup>
                      </select>
                    </div>
                  </div>

                  {/* Date Validation or Student Warning */}
                  {hasInvalidDates && (
                    <p className="text-[11px] text-red-600 font-semibold mt-2">
                      End date must be after the start date.
                    </p>
                  )}

                  {period.isOverlapAdjusted && (
                    <div className="mt-2.5 p-2.5 rounded-lg bg-sky-50/80 dark:bg-sky-950/30 border border-sky-200/90 dark:border-sky-800/60 text-[11px] text-sky-900 dark:text-sky-200 flex items-start gap-2">
                      <Info className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-sky-950 dark:text-sky-100">
                          Official ISD Anti-Overlap Rule:
                        </span>{' '}
                        Your prior stamp ended on <span className="font-mono font-semibold">{period.startDate}</span>. To prevent double-counting that same calendar day, the Department of Justice counts this period starting from <span className="font-mono font-semibold">{period.effectiveStartDate}</span> ({period.calculatedDays} days instead of {period.calculatedDays + (period.overlapDays || 0)}). This matches the official ISD calculator with 100% precision.
                      </div>
                    </div>
                  )}

                  {!period.isReckonable && (
                    <div className="mt-2.5 p-2 rounded-lg bg-amber-100/70 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-[11px] text-amber-900 dark:text-amber-200 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                        Student (Stamp 2/2A) and Stamp 1A are excluded from reckonable residence by ISD.
                      </span>
                      <a
                        href={ISD_OFFICIAL_URLS.residencyCalculator}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-700 dark:text-blue-300 underline font-semibold shrink-0 ml-2"
                      >
                        Official Guide ↗
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between text-xs text-slate-500">
            <span>ISD Requirement: Valid IRP card held during all reckonable periods.</span>
            <IsdCitation
              title="Official ISD Eligibility"
              url={ISD_OFFICIAL_URLS.citizenshipGuide}
            />
          </div>
        </div>

        {/* Right Column: Hero Countdown, Section 15C Absences & Results (5 cols) */}
        <div className="lg:col-span-5 space-y-6">

          {/* Big Countdown Card */}
          <div className="card p-6 space-y-5 transition-colors">
            <div className="flex items-center justify-between">
              <span className="eyebrow">
                Reckonable Days Accumulator
              </span>
              {isDaysGoalReached ? (
                <span className="chip chip-emerald font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Target Achieved!
                </span>
              ) : (
                <span className="chip chip-amber font-mono font-bold">
                  {targetDays - totalReckonableDays} days to go
                </span>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-extrabold font-mono text-slate-950 dark:text-white">
                  {totalReckonableDays.toLocaleString()}
                </span>
                <span className="text-lg font-bold text-slate-600 dark:text-slate-400 font-mono">
                  / {targetDays.toLocaleString()} days
                </span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 font-normal">
                {isSpousal
                  ? '3 reckonable years (1,095 days) over the preceding 5 years.'
                  : '5 reckonable years (1,825 days) over the preceding 9 years.'}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="w-full bg-slate-200 dark:bg-white/10 h-3 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    isDaysGoalReached ? 'bg-emerald-500' : 'bg-emerald-600'
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-slate-700 dark:text-slate-400 font-mono font-medium">
                <span>0 days</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400">
                  {percentage}%
                </span>
                <span>{targetDays.toLocaleString()} days</span>
              </div>
            </div>

            {isDaysGoalReached && (
              <button
                onClick={triggerCelebration}
                className="btn btn-secondary w-full"
              >
                <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Celebrate 1,825-Day Milestone!</span>
              </button>
            )}
          </div>

          {/* Section 15C Absences Validator */}
          <div className="card p-6 space-y-4 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <span className="eyebrow">
                  Section 15C Absence Policy
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                  Final Year Absences Validator
                </h3>
              </div>
              <IsdCitation
                title="Section 15C Policy"
                url={ISD_OFFICIAL_URLS.citizenshipLawAndPolicy}
                tag="Absences"
              />
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Between <strong>{finalYearStartDate || 'final year start'}</strong> and{' '}
              <strong>{applicationDate}</strong>, you cannot be absent from Ireland for more than 70 days without exceptional reason.
            </p>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Days Spent Outside Ireland:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {finalYearAbsenceDays} days
                </span>
              </div>

              <input
                type="range"
                min="0"
                max="130"
                value={finalYearAbsenceDays}
                onChange={(e) => setFinalYearAbsenceDays(Number(e.target.value))}
                className="w-full accent-emerald-600"
              />
              <div className="flex justify-between text-[11px] font-mono text-slate-400">
                <span>0d</span>
                <span className="text-emerald-600 font-semibold">70d (Standard)</span>
                <span className="text-amber-600 font-semibold">100d (Exceptional Cap)</span>
                <span>130d</span>
              </div>
            </div>

            {isAbsenceCompliant && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Complies with Section 15C continuous residence.</span>
              </div>
            )}

            {isAbsenceExceptional && (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Between 71 and 100 days ({finalYearAbsenceDays} days)</span>
                  <p className="mt-0.5 text-xs">
                    Permitted only with documentation of acceptable exceptional circumstances (medical treatment, work travel abroad, study, or family emergency).
                  </p>
                </div>
              </div>
            )}

            {isAbsenceHardCapExceeded && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 text-red-800 dark:text-red-300 text-xs flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Over 100-day statutory hard cap ({finalYearAbsenceDays} days)!</span>
                  <p className="mt-0.5 text-xs">
                    ISD caseworkers will consider continuous residence broken. You cannot submit until you complete a new 12-month period.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Statutory Assessment & Next Step Conversion */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white shadow-lg shadow-emerald-700/20 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded">
                Official Recommendation
              </span>
              {isOverallEligible && (
                <span className="text-xs font-mono font-bold bg-emerald-400 text-emerald-950 px-2 py-0.5 rounded-full">
                  ELIGIBLE TO APPLY
                </span>
              )}
            </div>

            <h3 className="text-lg font-bold leading-tight">
              {isOverallEligible
                ? 'You satisfy the reckonable residence conditions!'
                : 'Keep tracking your reckonable clock.'}
            </h3>

            <p className="text-xs text-emerald-100 leading-relaxed">
              {isOverallEligible
                ? `Based on an application date of ${applicationDate}, you have accumulated ${totalReckonableDays.toLocaleString()} reckonable days. Now unlock the Form 8 Scorecard to reach your 150 points for identity and residence.`
                : `You currently have ${totalReckonableDays.toLocaleString()} of the ${targetDays.toLocaleString()} days required. Gather your historical permissions to complete the timeline.`}
            </p>

            <button
              onClick={onGoToVault}
              className="btn w-full bg-white text-emerald-900 shadow-sm hover:bg-emerald-50"
            >
              <span>Score Your 150 Points in the Vault</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
