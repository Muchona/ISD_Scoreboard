import React, { useState, useRef, useEffect } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  FileText,
  Plus,
  Download,
  Lock,
  Check,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  X,
  Upload,
  Calendar,
} from 'lucide-react';
import { IsdCitation } from './IsdCitation';
import { OFFICIAL_ISD_DOCUMENTS, ISD_OFFICIAL_URLS } from '../data/isdPointsTable';
import { YearScorecard, ScorecardDocument, UserProfile } from '../types';
import { MasterDossierModal } from './MasterDossierModal';
import { extractPdfText, auditPdfContent, DocumentAuditResult } from '../utils/pdfAuditor';
import { createBlankScorecards } from '../utils/blankScorecards';
import { pushUserCloudRow } from '../lib/supabase';
import { Loader2, Search, CheckCircle, ShieldAlert, FileCheck, Layers, RotateCcw } from 'lucide-react';

interface ScorecardBentoProps {
  onGoToPricing?: () => void;
  user?: UserProfile | null;
  onOpenCheckout?: () => void;
}

interface QuickCategoryCard {
  templateName: string;
  plainTitle: string;
  plainSubtitle: string;
  category: 'IDENTITY' | 'RESIDENCY';
}

const PLAIN_ENGLISH_QUICK_CARDS: QuickCategoryCard[] = [
  {
    templateName: 'Current Valid In-Date Passport (Certified Colour Biometric Copy)',
    plainTitle: 'Passport or Peace Commissioner Copy',
    plainSubtitle: 'Certified colour photo page or Peace Commissioner letter',
    category: 'IDENTITY',
  },
  {
    templateName: 'Employment Detail Summary (EDS) in Applicant’s Name',
    plainTitle: 'Salary / Revenue Tax Summary (EDS or P60)',
    plainSubtitle: 'Annual tax summary downloaded from myAccount on revenue.ie',
    category: 'RESIDENCY',
  },
  {
    templateName: 'Bank Statements (3+ Consecutive Monthly POS Transactions in Ireland)',
    plainTitle: 'Bank Statement (Daily Irish Purchases)',
    plainSubtitle: '3+ consecutive months showing regular local card spending',
    category: 'RESIDENCY',
  },
  {
    templateName: 'Department of Social Protection Annual Statement (Contribution or Payment)',
    plainTitle: 'Social Welfare / DSP Payment Letter',
    plainSubtitle: 'Child Benefit, Back to School Allowance, Jobseeker’s, PRSI',
    category: 'RESIDENCY',
  },
  {
    templateName: 'Household Electricity / Gas / Water Utility Bill',
    plainTitle: 'Electricity, Gas, or Water Bill',
    plainSubtitle: 'Electric Ireland, Bord Gáis, Energia, SSE Airtricity, Irish Water',
    category: 'RESIDENCY',
  },
  {
    templateName: 'Household Broadband / Landline Telephone / Cable TV Bill',
    plainTitle: 'Broadband, Phone, or Cable TV Bill',
    plainSubtitle: 'Virgin Media, eir, Vodafone, Sky, Three',
    category: 'RESIDENCY',
  },
  {
    templateName: 'Television Licence (An Post / Ceadúnas Teilifíse)',
    plainTitle: 'TV Licence (An Post)',
    plainSubtitle: 'Annual An Post Television Licence renewal or payment receipt',
    category: 'RESIDENCY',
  },
  {
    templateName: 'Residential Tenancy Agreement / RTB Registration Letter',
    plainTitle: 'Rent Lease / RTB Tenancy Letter',
    plainSubtitle: 'Residential Tenancies Board letter or signed lease in your name',
    category: 'RESIDENCY',
  },
  {
    templateName: 'Doctor / GP Medical Attendance Letter or Clinic Registration',
    plainTitle: 'Doctor / GP or Hospital Attendance Letter',
    plainSubtitle: 'Confirmation of visits or registration from an Irish GP or clinic',
    category: 'RESIDENCY',
  },
  {
    templateName: 'Official Correspondence on Local Property Tax (LPT) / Social Welfare',
    plainTitle: 'Council / LPT / Official Government Letter',
    plainSubtitle: 'Local Property Tax, County Council, Electoral Register, or DSP (as Type B)',
    category: 'RESIDENCY',
  },
  {
    templateName: 'Residential Proof Affidavit (ISD Form Citz-009/2026)',
    plainTitle: 'ISD Residency Affidavit (Form Citz-009)',
    plainSubtitle: 'Sworn fallback form ONLY when standard 150-pt proofs are unavailable',
    category: 'RESIDENCY',
  },
];

// Automated Factory: Generates the 6 Form 8 Scorecards (Identity + 5 Continuous Years)
// Dynamically calibrated to ANY naturalisation application filing year (e.g. 2026 -> 2022 to 2026)
const createInitialScorecards = (appYear: number): YearScorecard[] => [
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
        notes: 'Proven once. Satisfies the full 150-point requirement on its own.',
      },
    ],
  },
  {
    year: appYear,
    label: `Year 5 (${appYear})`,
    targetPoints: 150,
    currentPoints: 150,
    isComplete: true,
    hasTypeA: true,
    hasTypeB: true,
    documents: [
      {
        id: `${appYear}-1`,
        name: 'Employment Detail Summary (EDS) in Applicant’s Name',
        category: 'RESIDENCY',
        type: 'TYPE_A',
        points: 100,
        year: appYear,
        issuer: 'Revenue Commissioners',
        isdGuidelineRef: ISD_OFFICIAL_URLS.proofsOfIdentityAndResidence,
        isWatermarked: true,
      },
      {
        id: `${appYear}-2`,
        name: 'Electric Ireland Electricity Bill',
        category: 'RESIDENCY',
        type: 'TYPE_B',
        points: 50,
        year: appYear,
        issuer: 'Electric Ireland',
        isdGuidelineRef: ISD_OFFICIAL_URLS.proofsOfIdentityAndResidence,
        isWatermarked: true,
      },
    ],
  },
  {
    year: appYear - 1,
    label: `Year 4 (${appYear - 1})`,
    targetPoints: 150,
    currentPoints: 100, // Deficit: Missing Type B (50 pts)
    isComplete: false,
    hasTypeA: true,
    hasTypeB: false,
    documents: [
      {
        id: `${appYear - 1}-1`,
        name: 'Employment Detail Summary (EDS)',
        category: 'RESIDENCY',
        type: 'TYPE_A',
        points: 100,
        year: appYear - 1,
        issuer: 'Revenue Commissioners',
        isdGuidelineRef: ISD_OFFICIAL_URLS.proofsOfIdentityAndResidence,
        isWatermarked: true,
      },
    ],
  },
  {
    year: appYear - 2,
    label: `Year 3 (${appYear - 2})`,
    targetPoints: 150,
    currentPoints: 150,
    isComplete: true,
    hasTypeA: true,
    hasTypeB: true,
    documents: [
      {
        id: `${appYear - 2}-1`,
        name: 'Revenue Statement EDS',
        category: 'RESIDENCY',
        type: 'TYPE_A',
        points: 100,
        year: appYear - 2,
        issuer: 'Revenue Commissioners',
        isdGuidelineRef: ISD_OFFICIAL_URLS.proofsOfIdentityAndResidence,
        isWatermarked: true,
      },
      {
        id: `${appYear - 2}-2`,
        name: 'RTB Tenancy Agreement Letter',
        category: 'RESIDENCY',
        type: 'TYPE_B',
        points: 50,
        year: appYear - 2,
        issuer: 'Residential Tenancies Board',
        isdGuidelineRef: ISD_OFFICIAL_URLS.proofsOfIdentityAndResidence,
        isWatermarked: true,
      },
    ],
  },
  {
    year: appYear - 3,
    label: `Year 2 (${appYear - 3})`,
    targetPoints: 150,
    currentPoints: 150,
    isComplete: true,
    hasTypeA: true,
    hasTypeB: true,
    documents: [
      {
        id: `${appYear - 3}-1`,
        name: 'AIB Bank Statements (3 Months POS Transactions in Ireland)',
        category: 'RESIDENCY',
        type: 'TYPE_A',
        points: 100,
        year: appYear - 3,
        issuer: 'AIB Bank Ireland',
        isdGuidelineRef: ISD_OFFICIAL_URLS.proofsOfIdentityAndResidence,
        isWatermarked: true,
      },
      {
        id: `${appYear - 3}-2`,
        name: 'Bord Gáis Energy Utility Bill',
        category: 'RESIDENCY',
        type: 'TYPE_B',
        points: 50,
        year: appYear - 3,
        issuer: 'Bord Gáis Energy',
        isdGuidelineRef: ISD_OFFICIAL_URLS.proofsOfIdentityAndResidence,
        isWatermarked: true,
      },
    ],
  },
  {
    year: appYear - 4,
    label: `Year 1 (${appYear - 4})`,
    targetPoints: 150,
    currentPoints: 150,
    isComplete: true,
    hasTypeA: true,
    hasTypeB: true,
    documents: [
      {
        id: `${appYear - 4}-1`,
        name: 'Revenue P21 / EDS Balancing Statement',
        category: 'RESIDENCY',
        type: 'TYPE_A',
        points: 100,
        year: appYear - 4,
        issuer: 'Revenue Commissioners',
        isdGuidelineRef: ISD_OFFICIAL_URLS.proofsOfIdentityAndResidence,
        isWatermarked: true,
      },
      {
        id: `${appYear - 4}-2`,
        name: 'Virgin Media Broadband Bill',
        category: 'RESIDENCY',
        type: 'TYPE_B',
        points: 50,
        year: appYear - 4,
        issuer: 'Virgin Media Ireland',
        isdGuidelineRef: ISD_OFFICIAL_URLS.proofsOfIdentityAndResidence,
        isWatermarked: true,
      },
    ],
  },
];

/**
 * Strict ISD Form 8 Scorecard Calculation Engine:
 * - Identity (Year 0): Requires 150 points (proven once, e.g. valid biometric passport = 150 pts).
 * - Reckonable Years (Years 1 to 5):
 *   * Exactly 1 Type A document counts towards points (capped at 100 pts max).
 *     Additional Type A documents do NOT stack (+100 +100 +100 is forbidden under ISD rules).
 *     They serve as "Supporting / Backup Proofs" (0 additional countable points).
 *   * Exactly 1 Type B document counts towards points (capped at 50 pts max).
 *     Additional Type B documents serve as "Supporting Proofs" (0 additional countable points).
 *   * Single-year score is strictly capped at 150 points.
 *   * A year is Complete ONLY when BOTH 1 Type A (100 pts) AND 1 Type B (50 pts) are present and valid.
 *   * Inactive / failed documents (0 pts) do not count towards requirements.
 */
export function recalculateYearScorecard(card: YearScorecard): YearScorecard {
  if (card.year === 0) {
    const totalIdentity = card.documents.reduce((acc, d) => acc + (d.points || 0), 0);
    const currentPoints = Math.min(150, totalIdentity);
    return {
      ...card,
      currentPoints,
      isComplete: totalIdentity >= 150,
      hasTypeA: true,
      hasTypeB: true,
    };
  }

  // Reckonable years (1 to 5)
  const validDocs = card.documents.filter((d) => (d.points || 0) > 0);
  const hasTypeA = validDocs.some((d) => d.type === 'TYPE_A');
  const hasTypeB = validDocs.some((d) => d.type === 'TYPE_B');

  const typeAPoints = hasTypeA ? 100 : 0;
  const typeBPoints = hasTypeB ? 50 : 0;
  const currentPoints = Math.min(150, typeAPoints + typeBPoints);
  const isComplete = hasTypeA && hasTypeB && currentPoints >= 150;

  return {
    ...card,
    currentPoints,
    isComplete,
    hasTypeA,
    hasTypeB,
  };
}

export const ScorecardBento: React.FC<ScorecardBentoProps> = ({
  onGoToPricing,
  user,
  onOpenCheckout,
}) => {
  const [guestApplicantName, setGuestApplicantName] = useState<string>(
    () => localStorage.getItem('isd_guest_applicant_name') || ''
  );
  const applicantName = user?.name || guestApplicantName.trim();
  const [modalNameMismatch, setModalNameMismatch] = useState<boolean>(false);
  const [modalNameMismatchNotice, setModalNameMismatchNotice] = useState<string | null>(null);

  // Automated Application Filing Year: Defaults to current calendar year (2026)
  const currentCalendarYear = new Date().getFullYear();
  const [applicationYear, setApplicationYear] = useState<number>(() => {
    const saved = localStorage.getItem('isd_filing_year');
    return saved ? parseInt(saved, 10) : currentCalendarYear;
  });

  const [activeModalYear, setActiveModalYear] = useState<number | null>(null);
  const [isProUnlocked, setIsProUnlocked] = useState<boolean>(false);
  const isUserPro = Boolean(user?.isPro || isProUnlocked);
  const [showProModal, setShowProModal] = useState<boolean>(false);
  const [dossierModalOpen, setDossierModalOpen] = useState<boolean>(false);
  const [coverLetterNotes, setCoverLetterNotes] = useState<string>(
    () => localStorage.getItem('isd_cover_letter_notes') || ''
  );

  useEffect(() => {
    if (!dossierModalOpen) {
      setCoverLetterNotes(localStorage.getItem('isd_cover_letter_notes') || '');
    }
  }, [dossierModalOpen]);

  // Anti-Loophole Year Detection & In-Depth PDF Auditor State
  const [modalUploadFile, setModalUploadFile] = useState<File | null>(null);
  const [modalDocYear, setModalDocYear] = useState<number>(applicationYear);
  const [modalYearMismatchError, setModalYearMismatchError] = useState<string | null>(null);
  const modalFileInputRef = useRef<HTMLInputElement>(null);

  // Automated PDF Content Audit States
  const [isAuditingPdf, setIsAuditingPdf] = useState<boolean>(false);
  const [auditProgressText, setAuditProgressText] = useState<string>(
    'Auditing document transactions, legal dates, and applicant identity matching in memory...'
  );
  const [pdfAuditResult, setPdfAuditResult] = useState<DocumentAuditResult | null>(null);
  const [pdfAuditError, setPdfAuditError] = useState<string | null>(null);
  const [showManualCategories, setShowManualCategories] = useState<boolean>(false);
  const [showAllOfficialCategories, setShowAllOfficialCategories] = useState<boolean>(false);
  const [dspDualChoice, setDspDualChoice] = useState<'TYPE_A' | 'TYPE_B'>('TYPE_A');
  const [watermarkEnabled, setWatermarkEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('isd_watermark_enabled');
    return saved !== null ? saved === 'true' : true;
  });

  const [saveToast, setSaveToast] = useState<string | null>(null);

  // State: 1 Identity Verification Card + 5 Reckonable Years
  const [scorecards, setScorecards] = useState<YearScorecard[]>(() => {
    const saved = localStorage.getItem('isd_scorecards');
    if (saved) {
      try {
        const parsed: YearScorecard[] = JSON.parse(saved);
        // Strict Form 8 Sanitization on load:
        // - Type B documents are strictly 50 pts max
        // - Type A documents are strictly 100 pts max
        const sanitized = parsed.map((c) => {
          const sanitizedDocs = (c.documents || []).map((d) => {
            if (d.type === 'TYPE_B' && (d.points || 0) > 50) {
              return { ...d, points: 50 };
            }
            if (d.type === 'TYPE_A' && (d.points || 0) > 100) {
              return { ...d, points: 100 };
            }
            return d;
          });
          return recalculateYearScorecard({
            ...c,
            documents: sanitizedDocs,
          });
        });
        return sanitized;
      } catch (e) {}
    }
    if (user && user.id !== 'demo-user-1') {
      return createBlankScorecards(applicationYear);
    }
    return createInitialScorecards(applicationYear);
  });

  const loadYearDocsArchive = (): Record<string, ScorecardDocument[]> => {
    try {
      const raw = localStorage.getItem('isd_year_docs_archive');
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  };

  // Persist scorecards & per-year document archive so Dashboard stays in 100% real-time sync
  useEffect(() => {
    localStorage.setItem('isd_scorecards', JSON.stringify(scorecards));
    const archive = loadYearDocsArchive();
    for (const card of scorecards) {
      archive[String(card.year)] = card.documents || [];
    }
    localStorage.setItem('isd_year_docs_archive', JSON.stringify(archive));
    if (user && user.id !== 'demo-user-1') {
      const timer = window.setTimeout(() => {
        void pushUserCloudRow(user.id, user);
      }, 600);
      return () => window.clearTimeout(timer);
    }
  }, [scorecards, user]);

  // Dynamically extract the 5 reckonable years from the scorecards (e.g. [2026, 2025, 2024, 2023, 2022])
  const reckonableYears = scorecards.filter((c) => c.year > 0).map((c) => c.year);

  const handleApplicationYearChange = (newYear: number) => {
    const archive = loadYearDocsArchive();
    for (const card of scorecards) {
      archive[String(card.year)] = card.documents || [];
    }
    localStorage.setItem('isd_year_docs_archive', JSON.stringify(archive));

    const isCustomVault = scorecards.some(
      (c) => c.documents.length === 0 || c.documents.some((d) => Boolean(d.fileName))
    );
    const templateCards = createInitialScorecards(newYear);
    const currentByYear = new Map<number, YearScorecard>(scorecards.map((c) => [c.year, c]));

    // Preserve Identity card (year 0) if present in current scorecards or archive
    const existingIdentity = currentByYear.get(0);
    const archivedIdentityDocs = archive['0'];
    const identityTemplate = templateCards.find((c) => c.year === 0)!;
    const identityCard: YearScorecard =
      existingIdentity !== undefined
        ? recalculateYearScorecard({ ...existingIdentity })
        : archivedIdentityDocs !== undefined
        ? recalculateYearScorecard({ ...identityTemplate, documents: archivedIdentityDocs })
        : identityTemplate;

    const targetYears = [newYear, newYear - 1, newYear - 2, newYear - 3, newYear - 4];
    const yearCards: YearScorecard[] = targetYears.map((yr, idx) => {
      const label = `Year ${5 - idx} (${yr})`;
      const existingCard = currentByYear.get(yr);
      const archivedDocs = archive[String(yr)];

      if (existingCard !== undefined) {
        return recalculateYearScorecard({
          ...existingCard,
          label,
        });
      }
      if (archivedDocs !== undefined) {
        return recalculateYearScorecard({
          year: yr,
          label,
          targetPoints: 150,
          currentPoints: 0,
          isComplete: false,
          hasTypeA: false,
          hasTypeB: false,
          documents: archivedDocs,
        });
      }
      if (isCustomVault) {
        return {
          year: yr,
          label,
          targetPoints: 150,
          currentPoints: 0,
          isComplete: false,
          hasTypeA: false,
          hasTypeB: false,
          documents: [],
        };
      }
      return (
        templateCards.find((c) => c.year === yr) || {
          year: yr,
          label,
          targetPoints: 150,
          currentPoints: 0,
          isComplete: false,
          hasTypeA: false,
          hasTypeB: false,
          documents: [],
        }
      );
    });

    setApplicationYear(newYear);
    localStorage.setItem('isd_filing_year', newYear.toString());
    setScorecards([identityCard, ...yearCards]);
    setActiveModalYear(null);
    setModalUploadFile(null);
    setModalYearMismatchError(null);
    setModalNameMismatch(false);
    setPdfAuditResult(null);
    setModalDocYear(newYear);
  };

  const handleOpenAddModal = (year: number) => {
    setActiveModalYear(year);
    setModalUploadFile(null);
    setModalDocYear(year === 0 ? 0 : year);
    setModalYearMismatchError(null);
    setModalNameMismatch(false);
    setModalNameMismatchNotice(null);
    setPdfAuditResult(null);
    setPdfAuditError(null);
    setShowManualCategories(false);
    setShowAllOfficialCategories(false);
    setDspDualChoice('TYPE_A');
  };

  const handleModalFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setModalUploadFile(file);
    setPdfAuditResult(null);
    setPdfAuditError(null);
    setShowManualCategories(false);
    setShowAllOfficialCategories(false);
    setDspDualChoice('TYPE_A');

    let yearMismatchMsg: string | null = null;
    let detectedDocYearFromPdf: number | null = null;

    // Trigger instant automated deep content audit on PDFs & image scans (via local OCR)
    if (
      file.type === 'application/pdf' ||
      file.name.toLowerCase().endsWith('.pdf') ||
      file.type.startsWith('image/')
    ) {
      setIsAuditingPdf(true);
      setAuditProgressText(
        'Auditing document transactions, legal dates, and applicant identity matching in memory...'
      );
      try {
        const text = await extractPdfText(file, (msg) => setAuditProgressText(msg));
        const targetYear = activeModalYear ?? applicationYear;
        const audit = auditPdfContent(text, targetYear, applicantName, file.name);
        setPdfAuditResult(audit);

        // Auto-select dual-use role for DSP statements based on whether target year already has Type A
        if (audit.detectedType === 'DSP_STATEMENT') {
          const targetCard = scorecards.find((c) => c.year === targetYear);
          const hasValidTypeA = Boolean(
            targetCard?.documents.some((d) => d.type === 'TYPE_A' && (d.points || 0) > 0)
          );
          const hasValidTypeB = Boolean(
            targetCard?.documents.some((d) => d.type === 'TYPE_B' && (d.points || 0) > 0)
          );
          setDspDualChoice(hasValidTypeA && !hasValidTypeB ? 'TYPE_B' : 'TYPE_A');
        }

        if (audit.detectedYear && activeModalYear && activeModalYear > 0) {
          detectedDocYearFromPdf = audit.detectedYear;
          setModalDocYear(audit.detectedYear);
          if (audit.detectedYear !== activeModalYear) {
            yearMismatchMsg = `⚠️ Form 8 Anti-Trick Guard: Document text indicates year ${audit.detectedYear}, but you are uploading into Year ${activeModalYear} slot.`;
          }
        }
      } catch (err: any) {
        console.warn('PDF content extraction note:', err);
        setPdfAuditError('Could not read PDF text directly (might be a scanned image or protected). Manual selection is available below.');
      } finally {
        setIsAuditingPdf(false);
      }
    }

    // 1. Automated Name Verification: Check if filename contains a different person's name
    const cleanFileName = file.name.replace(/\.[^/.]+$/, '').toLowerCase();

    // Extract tokens of registered applicant name (e.g. ["mamikon", "hovhannisyan"])
    const applicantParts = applicantName
      .toLowerCase()
      .split(/[\s,._-]+/)
      .filter((p) => p.length >= 3);

    // Standard non-name document terms common in official Irish applications
    const commonDocKeywords = new Set([
      'birth', 'certificate', 'cert', 'eds', 'employment', 'detail', 'summary',
      'revenue', 'statement', 'p60', 'p21', 'p45', 'tax', 'balancing', 'bill',
      'electric', 'ireland', 'esb', 'bord', 'gais', 'energy', 'eir', 'broadband',
      'vodafone', 'three', 'virgin', 'media', 'tenancy', 'rtb', 'lease', 'agreement',
      'rent', 'bank', 'statement', 'aib', 'boi', 'bankofireland', 'permanent', 'tsb',
      'revolut', 'an', 'post', 'credit', 'union', 'dsp', 'social', 'protection',
      'welfare', 'passport', 'irish', 'naturalisation', 'citizenship', 'form8', 'form',
      'residence', 'proof', 'identity', 'doc', 'document', 'scan', 'copy', 'pdf', 'img',
      'file', 'page', 'official', 'signed', 'verified', 'letter', 'annual', 'current',
      'joint', 'account', 'application', 'submission', 'proofs', 'id',
    ]);

    // Extract word tokens from filename (excluding pure numbers)
    const wordsInFile = cleanFileName
      .split(/[\s_.-]+/)
      .filter((w) => w.length >= 3 && !/^\d+$/.test(w));

    // Words that are neither standard document terms nor applicant name parts
    const foreignWords = wordsInFile.filter(
      (w) => !commonDocKeywords.has(w) && !applicantParts.some((p) => p.includes(w) || w.includes(p))
    );

    // Check if filename explicitly contains parts of the applicant's name
    const matchesApplicant = applicantParts.some((p) => cleanFileName.includes(p));

    // If there are personal name tokens in the filename (like "anna", "maria", "john"),
    // and NONE of the applicant's name parts are matched (only enforce when an applicant name is configured):
    if (applicantParts.length > 0 && foreignWords.length > 0 && !matchesApplicant) {
      const detectedName = foreignWords[0].charAt(0).toUpperCase() + foreignWords[0].slice(1);
      setModalNameMismatch(true);
      setModalNameMismatchNotice(
        `⚠️ Automated Identity Rejection: "${file.name}" is issued to "${detectedName}", not registered vault owner "${applicantName}". Under Department of Justice Form 8 rules, naturalisation points can ONLY be claimed for documents in the applicant's legal name. Points Awarded: 0 pts.`
      );
    } else {
      setModalNameMismatch(false);
      setModalNameMismatchNotice(null);
    }

    // 2. Anti-Loophole Protection: Check if file name indicates a historical year (e.g. 2015-2035)
    if (activeModalYear && activeModalYear > 0) {
      const match = file.name.match(/\b(20[1-3][0-9])\b/);
      if (match) {
        const extractedYear = parseInt(match[1], 10);
        if (!detectedDocYearFromPdf) {
          setModalDocYear(extractedYear);
        }
        if (extractedYear !== activeModalYear) {
          setModalDocYear(extractedYear);
          yearMismatchMsg = `⚠️ Form 8 Anti-Trick Guard: "${file.name}" is dated ${extractedYear}, but you are uploading into the Year ${activeModalYear} slot. Under Department of Justice rules, historical documents cannot be used to prove residence in ${activeModalYear}. Points Awarded: 0 pts. To audit your ${extractedYear} records, please unlock the full Pro Vault.`;
        }
      }
    }
    setModalYearMismatchError(yearMismatchMsg);
  };

  const handleYearChange = (newYear: number) => {
    setModalDocYear(newYear);
    if (activeModalYear && activeModalYear > 0 && newYear !== activeModalYear) {
      setModalYearMismatchError(
        `⚠️ Form 8 Anti-Trick Guard: You selected Tax Year ${newYear}, but this card is calibrated exclusively for Year ${activeModalYear}. Under ISD rules, you cannot use older documents to verify ${activeModalYear}. Points Awarded: 0 pts. To audit ${newYear} records, please unlock the Pro Vault.`
      );
    } else {
      setModalYearMismatchError(null);
    }
  };

  const handleAddDocToYear = (year: number, docTemplate: typeof OFFICIAL_ISD_DOCUMENTS[0]) => {
    // If there is an active name mismatch, block adding points!
    if (modalNameMismatch) {
      alert(
        `Cannot award points to ${applicantName} using a document issued to another person. Department of Justice Form 8 statutory guidance requires all proofs to be directly in the primary applicant's legal name.`
      );
      return;
    }

    // If there is an active year mismatch, block adding points to the card!
    if (year > 0 && modalDocYear !== year) {
      setModalYearMismatchError(
        `⚠️ Rejection Risk: You cannot add a ${modalDocYear} document to the ${year} slot. This earns 0 points.`
      );
      return;
    }

    // Determine points to award based on automated PDF audit result
    let awardedPoints = docTemplate.points;
    let auditNote = docTemplate.notes;

    if (pdfAuditResult) {
      if (pdfAuditResult.pointsRecommended === 0) {
        awardedPoints = 0;
        auditNote = `⚠️ Audit Flag (0 pts): ${pdfAuditResult.summaryMessage || 'Insufficient volume or verification failed'}`;
      } else {
        // Enforce strict Form 8 statutory category caps:
        // Type B is strictly 50 pts; Type A is strictly 100 pts
        if (docTemplate.type === 'TYPE_B') {
          awardedPoints = 50;
        } else if (docTemplate.type === 'TYPE_A') {
          awardedPoints = 100;
        } else {
          awardedPoints = Math.min(docTemplate.points, pdfAuditResult.pointsRecommended);
        }
      }
    } else {
      if (docTemplate.type === 'TYPE_B') {
        awardedPoints = 50;
      } else if (docTemplate.type === 'TYPE_A') {
        awardedPoints = 100;
      }
    }

    setScorecards(
      scorecards.map((card) => {
        if (card.year === year) {
          const newDoc: ScorecardDocument = {
            ...docTemplate,
            name: docTemplate.name,
            id: `${year}-${Date.now()}`,
            year: year === 0 ? undefined : year,
            points: awardedPoints,
            isWatermarked: watermarkEnabled,
            notes: auditNote,
            fileName: modalUploadFile?.name,
          };
          const updatedDocs = [...card.documents, newDoc];
          return recalculateYearScorecard({
            ...card,
            documents: updatedDocs,
          });
        }
        return card;
      })
    );
    setActiveModalYear(null);
    setModalUploadFile(null);
    setModalYearMismatchError(null);
    setModalNameMismatch(false);
    setPdfAuditResult(null);
    setShowManualCategories(false);
    setShowAllOfficialCategories(false);
    setDspDualChoice('TYPE_A');

    // Instant auto-save confirmation toast returned to dashboard
    if (awardedPoints === 0) {
      setSaveToast(
        `⚠️ Added with 0 Points: ${docTemplate.name} flagged with ISD audit warning (insufficient transactions or deficit).`
      );
    } else {
      setSaveToast(
        `✓ Auto-Saved to Vault: ${docTemplate.name} successfully verified and credited (+${awardedPoints} pts).`
      );
    }
    setTimeout(() => {
      setSaveToast(null);
    }, 4500);
  };

  const handleRemoveDoc = (year: number, docId: string) => {
    setScorecards(
      scorecards.map((card) => {
        if (card.year === year) {
          const updatedDocs = card.documents.filter((d) => d.id !== docId);
          return recalculateYearScorecard({
            ...card,
            documents: updatedDocs,
          });
        }
        return card;
      })
    );
  };

  const handleToggleGlobalWatermark = (enabled: boolean) => {
    setWatermarkEnabled(enabled);
    localStorage.setItem('isd_watermark_enabled', String(enabled));
    setScorecards((prev) =>
      prev.map((card) => ({
        ...card,
        documents: card.documents.map((doc) => ({
          ...doc,
          isWatermarked: enabled,
        })),
      }))
    );
  };

  const handleToggleDocWatermark = (year: number, docId: string) => {
    setScorecards((prev) =>
      prev.map((card) =>
        card.year === year
          ? {
              ...card,
              documents: card.documents.map((doc) =>
                doc.id === docId
                  ? { ...doc, isWatermarked: !(doc.isWatermarked ?? true) }
                  : doc
              ),
            }
          : card
      )
    );
  };

  const renderCategoryOptionCard = (
    doc: (typeof OFFICIAL_ISD_DOCUMENTS)[0],
    key: string | number,
    displayTitle?: string,
    displaySubtitle?: string
  ) => {
    if (activeModalYear === null) return null;
    const isYearBlocked = activeModalYear > 0 && modalDocYear !== activeModalYear;
    const isBlocked = isYearBlocked || modalNameMismatch;
    const activeCard = scorecards.find((c) => c.year === activeModalYear);
    const alreadyHasTypeA = activeCard?.documents.some((d) => d.type === 'TYPE_A' && (d.points || 0) > 0);
    const alreadyHasTypeB = activeCard?.documents.some((d) => d.type === 'TYPE_B' && (d.points || 0) > 0);
    const isAuditZero = Boolean(pdfAuditResult && pdfAuditResult.pointsRecommended === 0);
    const isSupportingProof =
      activeModalYear !== 0 &&
      !isAuditZero &&
      ((doc.type === 'TYPE_A' && alreadyHasTypeA) || (doc.type === 'TYPE_B' && alreadyHasTypeB));

    return (
      <div
        key={key}
        onClick={() => {
          if (modalNameMismatch) {
            alert(
              `Identity Mismatch: Cannot upload "${modalUploadFile?.name || 'document'}". This file appears to belong to another person, but this vault is registered exclusively to ${applicantName}. Under Department of Justice Form 8 rules, naturalisation points can ONLY be claimed for documents directly in the primary applicant's legal name.`
            );
            return;
          }
          if (isYearBlocked) {
            alert(
              `Cannot credit points to Year ${activeModalYear} using a ${modalDocYear} document. Under ISD rules, each year requires documents strictly issued within that tax year. Upgrade to Pro Vault to audit Year ${modalDocYear}.`
            );
            return;
          }
          handleAddDocToYear(activeModalYear, doc);
        }}
        className={`p-3 rounded-xl border transition-all flex items-center justify-between ${
          isBlocked
            ? 'border-slate-200 dark:border-white/5 bg-slate-100/50 dark:bg-white/[0.02] opacity-60 cursor-not-allowed'
            : 'border-slate-200 dark:border-white/10 hover:border-emerald-500 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/30 cursor-pointer'
        }`}
      >
        <div className="pr-3">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">
              {displayTitle || doc.name}
            </h4>
            {modalNameMismatch ? (
              <span className="text-[10px] font-bold text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-950 px-1.5 py-0.5 rounded">
                0 pts (Name Mismatch)
              </span>
            ) : isYearBlocked ? (
              <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950 px-1.5 py-0.5 rounded">
                0 pts (Year Mismatch)
              </span>
            ) : isAuditZero ? (
              <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950 px-1.5 py-0.5 rounded">
                0 pts (Audit Warning: Inactive Account)
              </span>
            ) : isSupportingProof ? (
              <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 bg-slate-200 dark:bg-white/10 px-1.5 py-0.5 rounded">
                Supporting Proof
              </span>
            ) : null}
          </div>
          <p className="text-xs text-slate-500">{displaySubtitle || doc.issuer}</p>
          {!displaySubtitle && doc.notes && (
            <p className="text-[11px] text-slate-400 mt-0.5">{doc.notes}</p>
          )}
        </div>
        <div className="text-right shrink-0">
          <span
            className={`px-2 py-0.5 rounded font-mono font-bold text-xs ${
              isBlocked || isAuditZero
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                : isSupportingProof
                ? 'bg-slate-200 text-slate-700 dark:bg-white/10 dark:text-slate-300'
                : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
            }`}
          >
            {isBlocked
              ? '0 pts'
              : isAuditZero
              ? '0 pts'
              : isSupportingProof
              ? 'Supporting (+0 pts)'
              : `+${doc.points} pts`}
          </span>
          <span className="block text-xs text-slate-400 font-mono mt-0.5">
            {doc.type === 'TYPE_A'
              ? 'Primary (100 pts)'
              : doc.type === 'TYPE_B'
              ? 'Supporting (50 pts)'
              : 'Identity (150 pts)'}
          </span>
        </div>
      </div>
    );
  };

  const allComplete = scorecards.every((c) => c.isComplete || c.currentPoints >= 150);
  const incompleteCards = scorecards.filter((c) => !c.isComplete && c.currentPoints < 150);

  const handleExportClick = () => {
    setDossierModalOpen(true);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Auto-Save Vault Confirmation Toast */}
      {saveToast && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 border-2 border-emerald-500 text-emerald-950 dark:text-emerald-100 text-xs font-semibold flex items-center justify-between shadow-lg shadow-emerald-700/15 animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{saveToast}</span>
          </div>
          <button
            onClick={() => setSaveToast(null)}
            className="text-xs text-emerald-800 dark:text-emerald-300 hover:text-emerald-950 px-2 py-0.5 rounded font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Vault Header Banner */}
      <div className="card p-4 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors min-w-0 w-full overflow-hidden">
        <div className="min-w-0 w-full">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="chip chip-emerald">
              Official ISD Scorecard Engine
            </span>
            <IsdCitation
              title="Official ISD Proofs of Identity & Residence"
              url={ISD_OFFICIAL_URLS.proofsOfIdentityAndResidence}
              tag="ISD Schedule"
            />
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight break-words">
            150-Point Citizenship Scorecard
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Form 8 requires 150 points for identity (proven once) and exactly <strong>1 Type A (100 pts) + 1 Type B (50 pts)</strong> for each reckonable year.
          </p>

          {/* Automated Application Year Calibrator */}
          <div className="flex flex-wrap items-center gap-2.5 mt-3 pt-3 border-t border-slate-200 dark:border-white/10">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Application Filing Year:</span>
            </div>
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-1 rounded-lg border border-slate-300 dark:border-white/15 p-0.5 bg-slate-100 dark:bg-white/5 max-w-full">
              {[currentCalendarYear + 1, currentCalendarYear, currentCalendarYear - 1, currentCalendarYear - 2].map((yr) => (
                <button
                  key={yr}
                  onClick={() => handleApplicationYearChange(yr)}
                  className={`px-2.5 py-1 rounded-md font-mono text-xs font-bold transition-all ${
                    applicationYear === yr
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
                  }`}
                >
                  {yr}{' '}
                  {yr === currentCalendarYear
                    ? '(Current)'
                    : yr === currentCalendarYear + 1
                    ? '(Upcoming)'
                    : ''}
                </button>
              ))}
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              Reckonable Window: {applicationYear - 4} – {applicationYear}
            </span>
            <button
              type="button"
              onClick={() => handleToggleGlobalWatermark(!watermarkEnabled)}
              title="Toggle whether documents in your vault include an ISD security watermark or remain un-watermarked originals"
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-mono text-xs font-bold transition-all cursor-pointer ${
                watermarkEnabled
                  ? 'border-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50'
                  : 'border-slate-300 dark:border-white/15 bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10'
              }`}
            >
              <Lock className="w-3 h-3 shrink-0" />
              <span>{watermarkEnabled ? 'Watermark: ON' : 'Watermark: OFF (Original)'}</span>
            </button>
            {!user?.name && (
              <div className="flex items-center gap-1.5">
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 whitespace-nowrap">
                  Applicant Name:
                </label>
                <input
                  type="text"
                  value={guestApplicantName}
                  onChange={(e) => {
                    setGuestApplicantName(e.target.value);
                    localStorage.setItem('isd_guest_applicant_name', e.target.value);
                  }}
                  placeholder="e.g. Anna Nikoghosyan"
                  className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-white/15 bg-white dark:bg-white/5 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none w-44"
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              if (window.confirm('Reset all scorecard slots to a blank canvas so you can add your own documents from scratch?')) {
                const blank = scorecards.map((c) => ({
                  ...c,
                  documents: [],
                  currentPoints: 0,
                  isComplete: false,
                  hasTypeA: false,
                  hasTypeB: false,
                }));
                localStorage.removeItem('isd_year_docs_archive');
                setScorecards(blank);
                localStorage.setItem('isd_scorecards', JSON.stringify(blank));
              }
            }}
            className="btn btn-sm border border-slate-300 dark:border-white/15 bg-white dark:bg-white/5 hover:bg-slate-100 text-slate-700 dark:text-slate-300 text-xs font-semibold"
            title="Clear sample documents and start fresh"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear & Start Fresh</span>
          </button>

          <button
            onClick={handleExportClick}
            className={`btn ${
              isProUnlocked && allComplete
                ? 'btn-primary'
                : 'border border-slate-300 dark:border-white/20 bg-slate-100 hover:bg-slate-200 text-slate-900 dark:bg-white/10 dark:text-white dark:hover:bg-white/15'
            }`}
          >
            {isProUnlocked ? (
              <Download className="w-4 h-4" />
            ) : (
              <Lock className="w-4 h-4 text-amber-500" />
            )}
            <span>{isProUnlocked ? 'Export Form 8 Audit Dossier' : 'Export Form 8 Dossier (Pro)'}</span>
          </button>
        </div>
      </div>

      {/* Free Trial / Pro Active Status Banner */}
      <div className="card p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-l-4 border-l-emerald-500">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className={`chip text-xs font-bold ${isProUnlocked ? 'chip-emerald' : 'chip-amber'}`}>
              {isProUnlocked ? '★ Pro Vault Active' : 'Free Trial Active'}
            </span>
            <span className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
              {isProUnlocked
                ? `All 6 Requirements Unlocked (Identity + 5 Years: ${applicationYear - 4}–${applicationYear})`
                : `2 of 6 Requirements Open (Identity + Year 5 / ${applicationYear} Free Trial)`}
            </span>
          </div>
          <p className="text-xs text-slate-700 dark:text-slate-300 font-normal">
            {isProUnlocked
              ? `Full 5-year compliance score active for ${applicationYear} application with 1-click Form 8 audit dossier export.`
              : `Test document uploads and 150-point calculations on Card 1 & Card 2 (Year 5 / ${applicationYear}) for free. Upgrade to Pro (€5/mo) to unlock Years 1–4 and dossier packaging.`}
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {!isUserPro && (
            <button
              onClick={() => {
                if (onOpenCheckout) onOpenCheckout();
                else setShowProModal(true);
              }}
              className="btn btn-sm btn-primary text-xs font-bold shadow-md shadow-emerald-700/20"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Unlock All 5 Years (€5/mo)</span>
            </button>
          )}
        </div>
      </div>

      {/* Diagnostic Gap Alert */}
      {incompleteCards.length > 0 ? (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 text-xs flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="flex items-start gap-2.5 min-w-0 flex-1">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <span className="font-bold text-sm block">Action Needed: Form 8 Point Deficit Detected</span>
              <p className="mt-1 text-xs leading-relaxed text-amber-800 dark:text-amber-300 break-words">
                {incompleteCards
                  .map((c) => {
                    if (c.year === 0) return `${c.label} has only ${c.currentPoints}/150 pts`;
                    if (!c.hasTypeA) return `${c.label} is missing a Type A document (100 pts, e.g. Revenue EDS)`;
                    if (!c.hasTypeB) return `${c.label} is missing a Type B document (50 pts, e.g. Utility Bill or Tenancy Agreement)`;
                    return `${c.label} has ${c.currentPoints}/150 pts`;
                  })
                  .join(' • ')}
                . You must submit 1 Type A (100 pts) and 1 Type B (50 pts) to qualify.
              </p>
            </div>
          </div>
          <div className="shrink-0">
            <IsdCitation
              title="Official Rules ↗"
              url={ISD_OFFICIAL_URLS.proofsOfIdentityAndResidence}
              tag="Score Table"
            />
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-bold text-sm">All 6 Requirements Satisfied (Identity + 5 Continuous Years)!</span>
          </div>
          <span className="font-semibold text-emerald-700 dark:text-emerald-300">Ready for Form 8 Submission</span>
        </div>
      )}

      {/* Bento Grid: 6 Modular Cards (Identity + 5 Years) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {scorecards.map((card, index) => {
          const percent = Math.min(100, Math.round((card.currentPoints / card.targetPoints) * 100));
          const strokeDashoffset = 100 - percent;

          // Free trial rule: Card 0 (Identity) and Card 1 (Year 5 / 2024) are clean and opened.
          // Cards 2, 3, 4, 5 are locked in Free Trial with the exact tricolour blur effect!
          const isLocked = index >= 2 && !isUserPro;

          // Irish Flag Tricolour Color Scheme (Green - White - Orange)
          const tricolour =
            index % 3 === 0
              ? {
                  name: 'green',
                  cardBorder: 'border-slate-300 dark:border-white/10 border-t-2 border-t-emerald-500 dark:border-t-emerald-400',
                  shadowGlow: 'shadow-[0_-12px_28px_-4px_rgba(16,185,129,0.24),0_4px_16px_rgba(15,23,42,0.06)] dark:shadow-[0_-14px_32px_-4px_rgba(16,185,129,0.32)]',
                  spotlight: 'bg-emerald-500/30 dark:bg-emerald-400/25',
                  gaugeColor: 'text-emerald-600 dark:text-emerald-500',
                  eyebrowColor: 'text-emerald-800 dark:text-emerald-300 font-bold',
                  scoreColor: 'text-emerald-800 dark:text-emerald-400',
                  docTypeColor: 'text-emerald-700 dark:text-emerald-400',
                  lockOverlay: 'bg-emerald-950/80 dark:bg-emerald-950/85 border border-emerald-500/40 shadow-[inset_0_0_36px_rgba(16,185,129,0.25)]',
                  lockIconBox: 'bg-emerald-500/25 border border-emerald-500/70 text-emerald-300 shadow-[0_0_24px_rgba(16,185,129,0.5)]',
                  lockBadge: 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/40',
                  lockHeading: 'text-white font-extrabold',
                  lockSubtext: 'text-slate-300 font-normal',
                  lockButton: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30 font-bold',
                }
              : index % 3 === 1
              ? {
                  name: 'white',
                  cardBorder: 'border-slate-300 dark:border-white/20 border-t-2 border-t-white dark:border-t-white',
                  shadowGlow: 'shadow-[0_-14px_32px_-4px_rgba(255,255,255,0.45),0_4px_16px_rgba(15,23,42,0.06)] dark:shadow-[0_-16px_36px_-4px_rgba(255,255,255,0.4)]',
                  spotlight: 'bg-white/50 dark:bg-white/40',
                  gaugeColor: (card.isComplete || card.currentPoints >= 150) ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400',
                  eyebrowColor: 'text-slate-800 dark:text-slate-200 font-bold',
                  scoreColor: (card.isComplete || card.currentPoints >= 150) ? 'text-emerald-800 dark:text-emerald-400' : 'text-slate-900 dark:text-white',
                  docTypeColor: 'text-slate-800 dark:text-slate-200 font-bold',
                  lockOverlay: 'bg-gradient-to-b from-white/95 via-slate-100/95 to-slate-200/90 dark:from-white/95 dark:via-slate-100/95 dark:to-slate-200/95 backdrop-blur-xl border-2 border-white shadow-[0_0_36px_rgba(255,255,255,0.45),inset_0_0_24px_rgba(255,255,255,0.6)]',
                  lockIconBox: 'bg-slate-950 border-2 border-slate-800 text-white shadow-xl shadow-black/25',
                  lockBadge: 'bg-slate-900/10 text-slate-900 ring-1 ring-slate-900/30 font-bold',
                  lockHeading: 'text-slate-950 font-black',
                  lockSubtext: 'text-slate-700 font-medium',
                  lockButton: 'bg-slate-950 hover:bg-slate-800 text-white font-black shadow-xl shadow-black/30',
                }
              : {
                  name: 'orange',
                  cardBorder: 'border-slate-300 dark:border-white/10 border-t-2 border-t-[#FF883E] dark:border-t-[#FF883E]',
                  shadowGlow: 'shadow-[0_-12px_28px_-4px_rgba(255,136,62,0.28),0_4px_16px_rgba(15,23,42,0.06)] dark:shadow-[0_-14px_32px_-4px_rgba(255,136,62,0.35)]',
                  spotlight: 'bg-[#FF883E]/30 dark:bg-[#FF883E]/25',
                  gaugeColor: (card.isComplete || card.currentPoints >= 150) ? 'text-emerald-600 dark:text-emerald-500' : 'text-[#FF883E]',
                  eyebrowColor: 'text-orange-800 dark:text-orange-400 font-bold',
                  scoreColor: (card.isComplete || card.currentPoints >= 150) ? 'text-emerald-800 dark:text-emerald-400' : 'text-[#FF883E]',
                  docTypeColor: 'text-[#FF883E] dark:text-[#ff944d]',
                  lockOverlay: 'bg-[#2A150A]/85 dark:bg-[#200F05]/90 border border-[#FF883E]/45 shadow-[inset_0_0_36px_rgba(255,136,62,0.28)]',
                  lockIconBox: 'bg-[#FF883E]/25 border border-[#FF883E]/70 text-[#FF883E] shadow-[0_0_24px_rgba(255,136,62,0.5)]',
                  lockBadge: 'bg-[#FF883E]/20 text-[#ff944d] ring-1 ring-[#FF883E]/40',
                  lockHeading: 'text-white font-extrabold',
                  lockSubtext: 'text-slate-300 font-normal',
                  lockButton: 'bg-[#FF883E] hover:bg-[#F2782A] text-white shadow-md shadow-orange-500/30 font-bold',
                };

          return (
            <div
              key={card.year}
              className={`relative overflow-hidden p-5 min-h-[310px] rounded-2xl bg-white dark:bg-obsidian-800 border transition-all duration-300 flex flex-col justify-between group ${tricolour.cardBorder} ${tricolour.shadowGlow}`}
            >
              {/* Top Ambient Radiant Spotlight (Higgsfield Style) */}
              <div
                className={`absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-20 rounded-full blur-2xl pointer-events-none opacity-60 group-hover:opacity-90 transition-opacity ${tricolour.spotlight}`}
              />

              {/* Underlying Card Contents (Blurred when locked in Free Trial) */}
              <div className={`relative z-10 ${isLocked ? 'filter blur-[7px] select-none pointer-events-none opacity-30 dark:opacity-20 transition-all' : ''}`}>
                {/* Header with Circular Radial Gauge */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className={`eyebrow ${tricolour.eyebrowColor}`}>
                      {card.year === 0 ? 'Mandatory Identity (Proven Once)' : 'Reckonable Year'}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                      {card.label}
                    </h3>
                  </div>

                  {/* SVG Circular Ring Gauge */}
                  <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
                    <svg className="w-14 h-14 -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-slate-200 dark:text-slate-800"
                        strokeWidth="3.5"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className={`progress-ring-circle ${tricolour.gaugeColor}`}
                        strokeWidth="3.5"
                        strokeDasharray="100, 100"
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <span className={`absolute font-mono font-bold text-xs ${tricolour.scoreColor}`}>
                      {card.currentPoints}
                    </span>
                  </div>
                </div>

                {/* Status Indicator & Rule Checklist */}
                <div className="space-y-1.5 pb-3 border-b border-slate-200 dark:border-white/[0.06] mb-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-700 dark:text-slate-300 font-medium">ISD Status:</span>
                    {card.isComplete ? (
                      <span className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> 150/150 pts Complete
                      </span>
                    ) : (
                      <span className="font-bold text-[#FF883E] dark:text-[#ff944d]">
                        {card.year === 0
                          ? `Needs ${Math.max(0, 150 - card.currentPoints)} pts`
                          : !card.hasTypeA && !card.hasTypeB
                          ? 'Needs 150 pts (Type A + Type B)'
                          : !card.hasTypeA
                          ? 'Needs 100 pts (Missing Type A)'
                          : 'Needs 50 pts (Missing Type B)'}
                      </span>
                    )}
                  </div>

                  {card.year !== 0 && (
                    <div className="flex gap-2 text-[11px] font-mono">
                      <span className={`px-2 py-0.5 rounded font-semibold ${card.hasTypeA ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300' : 'bg-slate-200 text-slate-700 dark:bg-white/10 dark:text-slate-300'}`}>
                        Type A (100pt): {card.hasTypeA ? '✓' : 'Missing'}
                      </span>
                      <span className={`px-2 py-0.5 rounded font-semibold ${card.hasTypeB ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300' : 'bg-slate-200 text-slate-700 dark:bg-white/10 dark:text-slate-300'}`}>
                        Type B (50pt): {card.hasTypeB ? '✓' : 'Missing'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Uploaded Documents List */}
                <div className="space-y-2">
                  {card.documents.length === 0 && (
                    <div className="card-inset p-4 text-center text-xs text-slate-500 dark:text-slate-400 border border-dashed border-slate-300/80 dark:border-white/10">
                      {card.year === 0
                        ? 'No identity document added yet (150 pts required).'
                        : 'No residency proofs added for this year yet (1 Type A + 1 Type B required).'}
                    </div>
                  )}
                  {card.documents.map((doc, docIdx) => {
                    // Check if this document is a secondary duplicate of Type A or Type B
                    const priorValidTypeA = card.documents
                      .slice(0, docIdx)
                      .some((d) => d.type === 'TYPE_A' && (d.points || 0) > 0);
                    const priorValidTypeB = card.documents
                      .slice(0, docIdx)
                      .some((d) => d.type === 'TYPE_B' && (d.points || 0) > 0);
                    const isSecondarySupporting =
                      card.year !== 0 &&
                      (doc.points || 0) > 0 &&
                      ((doc.type === 'TYPE_A' && priorValidTypeA) || (doc.type === 'TYPE_B' && priorValidTypeB));

                    // Extract clean document title and uploaded file name
                    const matchFileName =
                      doc.fileName ||
                      (doc.name.includes('(') ? doc.name.match(/\((.*?)\)/)?.[1] : undefined);
                    const cleanDocName = doc.name.replace(/\s*\(.*?\)\s*$/, '');

                    return (
                      <div
                        key={doc.id}
                        className={`card-inset p-2.5 text-xs flex items-start justify-between gap-2 group transition-all ${
                          (doc.points || 0) === 0 ? 'border border-amber-400/50 bg-amber-50/20 dark:bg-amber-950/20' : ''
                        }`}
                      >
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <FileText className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
                            <span className="font-semibold text-slate-900 dark:text-slate-200 truncate text-xs" title={cleanDocName}>
                              {cleanDocName}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-1.5 text-xs font-medium">
                            {(doc.points || 0) === 0 ? (
                              <span className="font-mono font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/80 px-1.5 py-0.5 rounded text-[10px] whitespace-nowrap">
                                {doc.type.replace('_', ' ')} • 0 pts (Low Volume)
                              </span>
                            ) : isSecondarySupporting ? (
                              <span className="font-mono font-semibold text-slate-700 dark:text-slate-300 bg-slate-200 dark:bg-white/10 px-1.5 py-0.5 rounded text-[10px] whitespace-nowrap">
                                {doc.type.replace('_', ' ')} • Supporting (+0 pts)
                              </span>
                            ) : (
                              <span className={`font-mono font-bold whitespace-nowrap ${tricolour.docTypeColor}`}>
                                {doc.type.replace('_', ' ')} • {doc.points} pts
                              </span>
                            )}
                            <span className="text-slate-300 dark:text-white/20 text-[10px]">•</span>
                            <button
                              type="button"
                              onClick={() => handleToggleDocWatermark(card.year, doc.id)}
                              title="Click to toggle watermark on/off for this document"
                              className={`flex items-center gap-0.5 text-[10px] font-medium whitespace-nowrap px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
                                doc.isWatermarked !== false
                                  ? 'text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10'
                                  : 'text-slate-600 dark:text-slate-400 bg-slate-200/70 dark:bg-white/10 hover:bg-slate-300/70 dark:hover:bg-white/15'
                              }`}
                            >
                              {doc.isWatermarked !== false ? (
                                <>
                                  <Lock className="w-2.5 h-2.5 shrink-0" /> Watermarked
                                </>
                              ) : (
                                <>Original (No Watermark)</>
                              )}
                            </button>
                          </div>

                          {/* Display the uploaded file name */}
                          {matchFileName ? (
                            <div className="flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-400 font-mono truncate pt-0.5">
                              <span className="text-slate-400 dark:text-slate-500 font-sans text-[10px]">File:</span>
                              <span className="truncate font-medium text-slate-800 dark:text-slate-200" title={matchFileName}>
                                {matchFileName}
                              </span>
                            </div>
                          ) : doc.notes ? (
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                              {doc.notes}
                            </p>
                          ) : null}

                          {/* Prominent warning explanation for 0-point documents */}
                          {(doc.points || 0) === 0 && doc.notes && (
                            <p className="text-[10px] text-amber-700 dark:text-amber-400 font-medium line-clamp-1 pt-0.5">
                              {doc.notes}
                            </p>
                          )}
                        </div>

                        <button
                          onClick={() => handleRemoveDoc(card.year, doc.id)}
                          className="rounded-md p-1.5 text-base leading-none text-slate-500 sm:text-slate-400 opacity-100 sm:opacity-0 transition sm:group-hover:opacity-100 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 shrink-0 mt-0.5"
                          title="Remove document"
                          aria-label="Remove document"
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Free Trial Frosted Glassmorphism Lock Overlay */}
              {isLocked && (
                <div className={`absolute inset-0 z-20 flex flex-col items-center justify-center p-5 text-center select-none backdrop-blur-md rounded-2xl ${tricolour.lockOverlay}`}>
                  {/* Glowing Lock Icon Box */}
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-2.5 transition-transform group-hover:scale-105 duration-200 ${tricolour.lockIconBox}`}>
                    <Lock className="w-5 h-5" />
                  </div>

                  {/* Badge */}
                  <span className={`chip text-[10px] font-mono font-bold uppercase tracking-wider mb-2 ${tricolour.lockBadge}`}>
                    Pro Vault • {card.label}
                  </span>

                  {/* Heading */}
                  <h4 className={`text-sm font-extrabold mb-1 ${tricolour.lockHeading}`}>
                    Locked in Free Trial
                  </h4>

                  {/* Subtext */}
                  <p className={`text-[11px] max-w-[210px] leading-relaxed mb-3.5 ${tricolour.lockSubtext}`}>
                    Upgrade to calculate points, store verified records, and audit {card.label}.
                  </p>

                  {/* CTA Button */}
                  <button
                    onClick={() => {
                      if (onOpenCheckout) onOpenCheckout();
                      else setShowProModal(true);
                    }}
                    className={`btn btn-sm ${tricolour.lockButton} text-xs px-4 h-8`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Unlock Vault (€5/mo)</span>
                  </button>
                </div>
              )}

              {/* Add Document Action (Visible when unlocked) */}
              {!isLocked && (
                <div className="relative z-10 mt-4 space-y-2">
                  <button
                    onClick={() => handleOpenAddModal(card.year)}
                    className="btn btn-sm w-full border border-dashed border-slate-300 text-slate-800 hover:border-emerald-500 hover:bg-emerald-50/50 hover:text-emerald-800 font-semibold dark:border-white/15 dark:text-slate-300 dark:hover:border-emerald-400 dark:hover:bg-emerald-500/5 dark:hover:text-emerald-300"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add document</span>
                  </button>
                  {card.year > 0 && !card.isComplete && (
                    <a
                      href="./residency-affidavit-proof-form-citizenship-0092026.pdf"
                      download="ISD_Residential_Proof_Affidavit_Citz-009-2026.pdf"
                      className="flex items-center justify-center gap-1.5 text-[11px] font-medium text-slate-500 hover:text-emerald-700 dark:text-slate-400 dark:hover:text-emerald-400 transition-colors"
                      title="Only use if you cannot reach 150 points with standard documents"
                    >
                      <Download className="w-3 h-3 shrink-0" />
                      <span>Can&apos;t reach 150 pts? Download Affidavit (Citz-009)</span>
                    </a>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Additional Explanation & Cover Letter Dossier Builder Card */}
      <div className="card p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              <FileText className="w-3.5 h-3.5" />
              <span>Optional Form 8 Cover Letter & Dossier Pack</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Additional Explanation for ISD Caseworker (Included in Cover Letter PDF)
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Write any extra explanations, short answers, or clarifications below. When you click <strong>Export Master Form 8 Citizenship Dossier</strong>, your text will be formatted directly onto Page 1 of your printable PDF cover letter.
            </p>
          </div>
          <button
            type="button"
            onClick={handleExportClick}
            className="btn btn-primary text-xs font-bold shrink-0 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Preview & Export Master Dossier (PDF)</span>
          </button>
        </div>

        <div className="space-y-2">
          <textarea
            rows={3}
            value={coverLetterNotes}
            onChange={(e) => {
              setCoverLetterNotes(e.target.value);
              localStorage.setItem('isd_cover_letter_notes', e.target.value);
            }}
            placeholder="Example: Please note that my passport copy is certified by a Peace Commissioner, my 2023 Department of Social Protection statement is submitted as a 50-point Type B supporting proof alongside my Revenue EDS, and household utility bills are shared at my family residence..."
            className="w-full rounded-xl border border-slate-300 dark:border-white/15 bg-slate-50 dark:bg-white/[0.03] px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none transition-colors"
          />
          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
            <span>Saved automatically • Appears on Page 1 of your Form 8 Cover Letter</span>
            {coverLetterNotes.trim().length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setCoverLetterNotes('');
                  localStorage.removeItem('isd_cover_letter_notes');
                }}
                className="text-red-600 dark:text-red-400 hover:underline font-medium cursor-pointer"
              >
                Clear explanation text
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Pro Subscription Modal */}
      {showProModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="relative card max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-5 border-2 border-emerald-500">
            {/* Close Button */}
            <button
              onClick={() => setShowProModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="space-y-1.5 pr-6">
              <span className="chip chip-emerald text-[11px] font-bold">
                CitizenScore Pro Vault
              </span>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                Unlock Full 5-Year Naturalisation Suite
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Immigration solicitors charge €1,500+. CitizenScore gives you automated precision for the price of one coffee a month.
              </p>
            </div>

            {/* Price Box */}
            <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 flex items-baseline justify-between">
              <div>
                <span className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">€5.00</span>
                <span className="text-xs text-slate-500 font-medium"> / month</span>
              </div>
              <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
                Cancel Anytime (1-Click)
              </span>
            </div>

            {/* Feature Checklist */}
            <ul className="space-y-2.5 text-xs text-slate-800 dark:text-slate-200 font-medium">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Unlock all 5 reckonable years (Years 1–5 + Identity)</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Automated PDF Anti-Theft Watermarking for unlimited uploads</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>1-Click Form 8 Dossier ZIP Export with cover summary</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Deficit Diagnostics (pinpoints exact missing proofs)</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>GDPR compliant bank-grade EU encryption</span>
              </li>
            </ul>

            {/* Modal Actions */}
            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  setIsProUnlocked(true);
                  setShowProModal(false);
                }}
                className="btn btn-primary w-full h-11 text-sm font-bold shadow-lg shadow-emerald-700/25"
              >
                <Sparkles className="w-4 h-4" />
                <span>Simulate Pro Unlock (€5.00 / Mo)</span>
              </button>

              {onGoToPricing && (
                <button
                  onClick={() => {
                    setShowProModal(false);
                    onGoToPricing();
                  }}
                  className="btn btn-secondary w-full h-10 text-xs font-semibold"
                >
                  <span>View Full Pricing Comparison</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Document Picker & Anti-Loophole Upload Modal */}
      {activeModalYear !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="card max-w-xl w-full p-6 shadow-2xl space-y-4 border border-slate-300 dark:border-white/10 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/[0.08]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="chip chip-emerald text-[11px] font-bold">
                    {activeModalYear === 0 ? 'Mandatory Identity' : `Reckonable Year ${activeModalYear}`}
                  </span>
                  <span className="text-xs font-mono text-slate-500">
                    Form 8 Schedule 2
                  </span>
                </div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base mt-1">
                  {activeModalYear === 0
                    ? 'Upload / Select Proof of Identity'
                    : `Upload / Audit Year ${activeModalYear} Residency Proof`}
                </h3>
              </div>
              <button
                onClick={() => {
                  setActiveModalYear(null);
                  setModalUploadFile(null);
                  setModalYearMismatchError(null);
                }}
                className="btn btn-sm btn-ghost px-2 text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Step 1: File Upload Zone (Optional / Real File Selection) */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Step 1: Upload Document from your Computer (PDF / Scan)
              </label>
              
              <input
                id="modal-file-upload"
                type="file"
                ref={modalFileInputRef}
                onChange={handleModalFileSelect}
                accept="application/pdf,.pdf,image/png,image/jpeg,image/*"
                className="sr-only"
              />

              <label
                htmlFor="modal-file-upload"
                className="block border-2 border-dashed border-slate-300 dark:border-white/15 hover:border-emerald-500 dark:hover:border-emerald-400 rounded-xl p-4 text-center cursor-pointer bg-slate-50/60 dark:bg-white/[0.02] hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 transition-all group"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <Upload className="w-5 h-5" />
                </div>
                {modalUploadFile ? (
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      Selected: {modalUploadFile.name}
                    </p>
                    <p className="text-[11px] text-slate-500 font-mono">
                      {(modalUploadFile.size / 1024).toFixed(1)} KB • Ready for automated date & issuer audit
                    </p>
                  </div>
                ) : (
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-200">
                      Click to browse or drop your document here
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Supports PDF, PNG, JPG (e.g. Bank Statements, Revenue EDS, Electric Ireland)
                    </p>
                  </div>
                )}
              </label>

              {/* Downloadable ISD Residential Proof Affidavit (Citz-009/2026) Helper */}
              {activeModalYear > 0 && (
                <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-white/[0.02] p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">
                      Missing documents to reach 150 pts for {activeModalYear}?
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                      Use ISD Form <strong>Citz-009/2026</strong> only if standard proofs aren&apos;t available (sign in front of a Solicitor / Peace Commissioner).
                    </span>
                  </div>
                  <a
                    href="/residency-affidavit-proof-form-citizenship-0092026.pdf"
                    download="ISD_Residential_Proof_Affidavit_Citz-009-2026.pdf"
                    className="btn btn-sm btn-secondary shrink-0 text-[11px] font-bold flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Download Affidavit PDF</span>
                  </a>
                </div>
              )}

              {/* Automated In-Browser PDF Content Auditor Card */}
              {isAuditingPdf && (
                <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 text-slate-800 dark:text-slate-200 text-xs flex items-center gap-2.5 animate-pulse">
                  <Loader2 className="w-4 h-4 text-emerald-600 animate-spin shrink-0" />
                  <span className="font-medium">
                    {auditProgressText}
                  </span>
                </div>
              )}

              {pdfAuditResult && (
                <div
                  className={`p-4 rounded-xl border space-y-3 animate-in fade-in duration-200 text-xs ${
                    pdfAuditResult.status === 'PASSED'
                      ? 'border-emerald-500/40 bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-950 dark:text-emerald-100'
                      : 'border-amber-500/50 bg-amber-50/80 dark:bg-amber-950/30 text-amber-950 dark:text-amber-100'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 border-b border-black/10 dark:border-white/10 pb-2">
                    <div className="flex items-center gap-2">
                      {pdfAuditResult.status === 'PASSED' ? (
                        <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      ) : (
                        <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
                      )}
                      <div>
                        <span className="font-extrabold text-sm block">
                          Form 8 PDF Audit: {pdfAuditResult.summaryMessage}
                        </span>
                        <span className="text-[11px] opacity-80 font-mono">
                          Detected: {pdfAuditResult.detectedIssuer} • Classification:{' '}
                          {pdfAuditResult.detectedType === 'DSP_STATEMENT' && dspDualChoice === 'TYPE_B'
                            ? 'TYPE_B (50 pts)'
                            : `${pdfAuditResult.scorecardClassification} (${pdfAuditResult.pointsRecommended} pts)`}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`chip text-[10px] font-bold ${
                        pdfAuditResult.status === 'PASSED' ? 'chip-emerald' : 'chip-amber'
                      }`}
                    >
                      {pdfAuditResult.status === 'PASSED' ? 'ISD Compliant' : 'ISD Risk Detected'}
                    </span>
                  </div>

                  {/* Smart Document Reader Match + Dual-Use Role Selector + 1-Click Confirm */}
                  {(() => {
                    const selectedTemplateName =
                      pdfAuditResult.detectedType === 'DSP_STATEMENT' &&
                      dspDualChoice === 'TYPE_B' &&
                      pdfAuditResult.dualUseTemplateName
                        ? pdfAuditResult.dualUseTemplateName
                        : pdfAuditResult.matchedTemplateName;
                    const smartTemplate = selectedTemplateName
                      ? OFFICIAL_ISD_DOCUMENTS.find((d) => d.name === selectedTemplateName)
                      : undefined;

                    if (!smartTemplate) return null;

                    const smartTargetYear =
                      smartTemplate.category === 'IDENTITY' ? 0 : activeModalYear;
                    const targetCard = scorecards.find((c) => c.year === smartTargetYear);
                    const alreadyHasTypeA = Boolean(
                      targetCard?.documents.some((d) => d.type === 'TYPE_A' && (d.points || 0) > 0)
                    );
                    const alreadyHasTypeB = Boolean(
                      targetCard?.documents.some((d) => d.type === 'TYPE_B' && (d.points || 0) > 0)
                    );
                    const isYearBlocked =
                      smartTargetYear !== null &&
                      smartTargetYear > 0 &&
                      modalDocYear !== smartTargetYear;
                    const isSlotBlocked =
                      activeModalYear === 0 && smartTemplate.category === 'RESIDENCY';
                    const isBlocked = isYearBlocked || isSlotBlocked || modalNameMismatch;
                    const isAuditZero = pdfAuditResult.pointsRecommended === 0;
                    const isSupportingProof =
                      smartTargetYear !== 0 &&
                      !isAuditZero &&
                      ((smartTemplate.type === 'TYPE_A' && alreadyHasTypeA) ||
                        (smartTemplate.type === 'TYPE_B' && alreadyHasTypeB));
                    const effectivePoints =
                      isBlocked || isAuditZero
                        ? 0
                        : smartTemplate.type === 'TYPE_B'
                        ? 50
                        : smartTemplate.type === 'TYPE_A'
                        ? 100
                        : smartTemplate.points;

                    return (
                      <div className="space-y-2.5">
                        {pdfAuditResult.detectedType === 'DSP_STATEMENT' && (
                          <div className="rounded-lg p-2.5 bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/30 text-emerald-950 dark:text-emerald-200 space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-bold text-xs flex items-center gap-1.5">
                                <span>💡</span>
                                <span>Dual-Use DSP Document — Choose how to count it:</span>
                              </span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <button
                                type="button"
                                onClick={() => setDspDualChoice('TYPE_A')}
                                className={`text-left p-2 rounded-lg border text-[11px] transition-all cursor-pointer ${
                                  dspDualChoice === 'TYPE_A'
                                    ? 'border-emerald-600 bg-emerald-500/20 dark:bg-emerald-500/25 font-bold ring-1 ring-emerald-500'
                                    : 'border-black/10 dark:border-white/10 bg-white/50 dark:bg-black/20 opacity-80 hover:opacity-100'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span>Count as Type A</span>
                                  <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300">
                                    100 pts
                                  </span>
                                </div>
                                <span className="block text-[10px] opacity-80 font-normal mt-0.5">
                                  {alreadyHasTypeA
                                    ? 'This year already has a Type A proof'
                                    : 'Main Social Protection statement'}
                                </span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setDspDualChoice('TYPE_B')}
                                className={`text-left p-2 rounded-lg border text-[11px] transition-all cursor-pointer ${
                                  dspDualChoice === 'TYPE_B'
                                    ? 'border-emerald-600 bg-emerald-500/20 dark:bg-emerald-500/25 font-bold ring-1 ring-emerald-500'
                                    : 'border-black/10 dark:border-white/10 bg-white/50 dark:bg-black/20 opacity-80 hover:opacity-100'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span>Count as Type B</span>
                                  <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300">
                                    50 pts
                                  </span>
                                </div>
                                <span className="block text-[10px] opacity-80 font-normal mt-0.5">
                                  {alreadyHasTypeA && !alreadyHasTypeB
                                    ? '✓ Auto-recommended (pairs with Revenue EDS)'
                                    : 'Supporting Official Gov Letter'}
                                </span>
                              </button>
                            </div>
                          </div>
                        )}

                        <div className="rounded-xl p-3.5 bg-white/80 dark:bg-black/30 border border-emerald-500/35 flex flex-col gap-3">
                          <div className="space-y-1">
                            <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-emerald-700 dark:text-emerald-400 block">
                              Smart Document Match
                            </span>
                            <div className="text-sm font-extrabold text-slate-900 dark:text-white">
                              {pdfAuditResult.detectedPlainLabel || smartTemplate.name}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              {smartTemplate.category === 'IDENTITY'
                                ? activeModalYear !== 0
                                  ? 'Identity document detected — will be added to your Identity Verification card'
                                  : 'Primary Identity Proof (150 pts) • Auto-matched'
                                : `${
                                    smartTemplate.type === 'TYPE_A'
                                      ? 'Primary Proof (Type A)'
                                      : 'Supporting Proof (Type B)'
                                  } • ${
                                    isSupportingProof
                                      ? 'Backup proof (slot already covered)'
                                      : `Auto-mapped to +${effectivePoints} pts`
                                  }`}
                            </div>
                          </div>
                          <button
                            type="button"
                            disabled={isBlocked || smartTargetYear === null}
                            onClick={() => {
                              if (smartTargetYear !== null) {
                                handleAddDocToYear(smartTargetYear, smartTemplate);
                              }
                            }}
                            className={`w-full px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm ${
                              isBlocked
                                ? 'bg-slate-200 dark:bg-white/10 text-slate-500 dark:text-slate-400 cursor-not-allowed'
                                : isAuditZero
                                ? 'bg-amber-600 hover:bg-amber-700 text-white cursor-pointer'
                                : 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer'
                            }`}
                          >
                            <span>
                              {modalNameMismatch
                                ? 'Blocked: Name Mismatch (0 pts)'
                                : isYearBlocked
                                ? `Wrong Year: Detected ${modalDocYear} (0 pts)`
                                : isSlotBlocked
                                ? `Open Year ${pdfAuditResult.detectedYear || ''} Card to Add`
                                : isAuditZero
                                ? 'Add Flagged File (0 pts)'
                                : `✓ Confirm & Add ${
                                    pdfAuditResult.detectedPlainLabel || 'Document'
                                  } (${
                                    isSupportingProof
                                      ? 'Backup • +0 net pts'
                                      : `+${effectivePoints} pts`
                                  })`}
                            </span>
                          </button>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Bank Statement Deep Dive Metrics (Specially Built for Wife's Inactivity Issue) */}
                  {pdfAuditResult.bankStatementMetrics && (
                    <div className="rounded-lg p-2.5 bg-black/5 dark:bg-black/30 border border-black/10 dark:border-white/10 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <span className="flex items-center gap-1.5">
                          <span>💳 POS Day-to-Day Transaction Audit</span>
                        </span>
                        <span
                          className={`font-mono ${
                            pdfAuditResult.bankStatementMetrics.isActivitySufficient
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-amber-600 dark:text-amber-400'
                          }`}
                        >
                          {pdfAuditResult.bankStatementMetrics.posTransactionsCount} in-person purchases (~{pdfAuditResult.bankStatementMetrics.averagePosPerMonth}/mo)
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                        <div className="p-1.5 rounded bg-white/60 dark:bg-white/5">
                          <span className="block opacity-70">Months Covered</span>
                          <span className="font-bold text-xs">
                            {pdfAuditResult.bankStatementMetrics.monthsCount} / 3 req.
                          </span>
                        </div>
                        <div className="p-1.5 rounded bg-white/60 dark:bg-white/5">
                          <span className="block opacity-70">POS Purchases</span>
                          <span className="font-bold text-xs">
                            {pdfAuditResult.bankStatementMetrics.posTransactionsCount}
                          </span>
                        </div>
                        <div className="p-1.5 rounded bg-white/60 dark:bg-white/5">
                          <span className="block opacity-70">Avg Per Month</span>
                          <span
                            className={`font-bold text-xs ${
                              pdfAuditResult.bankStatementMetrics.averagePosPerMonth >= 4
                                ? 'text-emerald-600'
                                : 'text-amber-600'
                            }`}
                          >
                            {pdfAuditResult.bankStatementMetrics.averagePosPerMonth} {pdfAuditResult.bankStatementMetrics.averagePosPerMonth >= 4 ? '✓' : '⚠️'}
                          </span>
                        </div>
                      </div>

                      {!pdfAuditResult.bankStatementMetrics.isActivitySufficient && (
                        <div className="text-[11px] text-amber-900 dark:text-amber-200 font-medium bg-amber-500/10 p-2 rounded border border-amber-500/20">
                          ⚠️ <strong>ISD Strict Rule Alert:</strong> Immigration Service Delivery requires bank statements to demonstrate active physical presence in Ireland (usually 8–10 in-person point-of-sale card transactions every month). Statements with sparse activity are frequently deemed insufficient.
                        </div>
                      )}
                    </div>
                  )}

                  {/* Audit Findings Bullet Points */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider font-bold opacity-75">
                      Audit Verification Details:
                    </span>
                    <ul className="space-y-1 text-[11px] list-disc list-inside">
                      {pdfAuditResult.reasons.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Recommendations */}
                  {pdfAuditResult.recommendations.length > 0 && (
                    <div className="pt-2 border-t border-black/10 dark:border-white/10 space-y-1">
                      <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-amber-700 dark:text-amber-300">
                        Recommended Next Step:
                      </span>
                      <ul className="space-y-1 text-[11px] text-amber-900 dark:text-amber-200">
                        {pdfAuditResult.recommendations.map((rec, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span>👉</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {pdfAuditError && (
                <div className="p-3 rounded-xl border border-slate-300 dark:border-white/10 text-slate-500 text-xs">
                  {pdfAuditError}
                </div>
              )}
            </div>

            {/* Step 2: Applicant Identity Authenticator (Anti-Sharing Guard) */}
            <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-white/[0.08]">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Step 2: Document Holder Identity Match:
                </label>
                <span className="text-[11px] font-mono text-slate-500">
                  Vault Owner: <strong>{applicantName}</strong>
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setModalNameMismatch(false)}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all border text-left flex items-center justify-between ${
                    !modalNameMismatch
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-emerald-200 shadow-sm'
                      : 'bg-white dark:bg-white/5 border-slate-300 dark:border-white/10 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <span className="truncate">✓ In Applicant’s Name</span>
                  {!modalNameMismatch && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                </button>

                <button
                  type="button"
                  onClick={() => setModalNameMismatch(true)}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all border text-left flex items-center justify-between ${
                    modalNameMismatch
                      ? 'bg-red-50 dark:bg-red-950/40 border-red-500 text-red-900 dark:text-red-200 shadow-sm'
                      : 'bg-white dark:bg-white/5 border-slate-300 dark:border-white/10 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <span className="truncate">⚠ Other Person / Joint</span>
                  {modalNameMismatch && <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />}
                </button>
              </div>

              {/* Name Mismatch Warning */}
              {modalNameMismatch && (
                <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/50 border-2 border-red-500 text-red-900 dark:text-red-100 text-xs space-y-2 animate-in fade-in">
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <h4 className="text-xs font-extrabold uppercase tracking-wide text-red-900 dark:text-red-100">
                        Identity Rejection Risk: Name Mismatch (0 Points)
                      </h4>
                      <p className="text-xs leading-relaxed text-red-800 dark:text-red-200">
                        {modalNameMismatchNotice || `Under Department of Justice Form 8 rules, residency points can only be awarded for documents issued directly in the primary applicant’s legal name (${applicantName}).`}
                      </p>
                      <p className="text-[11px] text-red-700 dark:text-red-300 font-medium">
                        Third-party documents (spouse, child, roommate, or friend) earn <strong>0 points</strong>. Each applicant must maintain their own dedicated subscription vault.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Step 3: Automated Document Statement / Tax Year Verification */}
            {activeModalYear !== 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-white/[0.08]">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Step 3: Document Statement / Tax Year:
                  </label>
                  <span className="text-[11px] font-mono text-slate-500">
                    Target Card: <strong>{activeModalYear}</strong>
                  </span>
                </div>

                {/* Dynamically Generated Reckonable Years (e.g. 2026, 2025, 2024, 2023, 2022) */}
                <div className="grid grid-cols-5 gap-1.5">
                  {reckonableYears.map((yr, idx) => {
                    const isSelected = modalDocYear === yr;
                    const isTargetCardYear = yr === activeModalYear;
                    return (
                      <button
                        key={yr}
                        type="button"
                        onClick={() => handleYearChange(yr)}
                        className={`py-1.5 px-1.5 rounded-lg text-xs font-mono font-bold transition-all border ${
                          isSelected
                            ? isTargetCardYear
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                              : 'bg-amber-500 text-white border-amber-500 shadow-sm'
                            : 'bg-white dark:bg-white/5 border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-slate-400'
                        }`}
                      >
                        {yr}
                        {isTargetCardYear && <span className="block text-[9px] font-sans opacity-90">Target</span>}
                        {!isTargetCardYear && (
                          <span className="block text-[9px] font-sans opacity-70">
                            {idx === 0 ? 'Year 5' : `Year ${5 - idx}`}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
                  <span>Reckonable Window for {applicationYear} Naturalisation Form 8</span>
                  <button
                    type="button"
                    onClick={() => {
                      const older = prompt(
                        `Enter historical tax year outside the 5-year window (e.g. ${reckonableYears[reckonableYears.length - 1] - 1}):`,
                        (reckonableYears[reckonableYears.length - 1] - 1).toString()
                      );
                      if (older && !isNaN(parseInt(older, 10))) {
                        handleYearChange(parseInt(older, 10));
                      }
                    }}
                    className="text-xs text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 font-semibold underline"
                  >
                    Custom / Older year...
                  </button>
                </div>
              </div>
            )}

            {/* Anti-Loophole Protection Alert (When year does not match activeModalYear) */}
            {activeModalYear !== null && activeModalYear > 0 && modalDocYear !== activeModalYear && (
              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 border-2 border-amber-400 dark:border-amber-600 text-amber-900 dark:text-amber-200 space-y-2 animate-in fade-in">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="text-xs font-extrabold uppercase tracking-wide text-amber-900 dark:text-amber-100 flex items-center gap-1.5">
                      <span>Anti-Loophole Guard: Year Mismatch Detected</span>
                    </h4>
                    <p className="text-xs leading-relaxed text-amber-800 dark:text-amber-200">
                      This document is dated <strong>{modalDocYear}</strong>, but this card is calibrated strictly for <strong>Reckonable Year {activeModalYear}</strong>.
                    </p>
                    <p className="text-[11px] text-amber-700 dark:text-amber-300 font-medium">
                      Under Department of Justice Form 8 rules, historical documents cannot be used to verify residence for a different year. <strong>Points Awarded to Year {activeModalYear}: 0 pts.</strong>
                    </p>
                  </div>
                </div>

                {/* Direct CTA to prevent loophole & convert to Pro */}
                <div className="pt-2 border-t border-amber-200 dark:border-amber-800/60 flex items-center justify-between gap-3">
                  <span className="text-[11px] font-semibold text-amber-900 dark:text-amber-100">
                    Want to audit your {modalDocYear} documents?
                  </span>
                  <button
                    onClick={() => {
                      setActiveModalYear(null);
                      if (onOpenCheckout) onOpenCheckout();
                      else setShowProModal(true);
                    }}
                    className="btn btn-sm bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0 shadow-sm"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Unlock Pro for {modalDocYear} (€5/mo)</span>
                  </button>
                </div>
              </div>
            )}

            {/* Year & Name Validated Match Indicator */}
            {activeModalYear !== null && activeModalYear > 0 && modalDocYear === activeModalYear && !modalNameMismatch && (
              <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/60 text-emerald-900 dark:text-emerald-200 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>
                  <strong>Identity &amp; Year Validated:</strong> Document verified for{' '}
                  {applicantName || 'Applicant'} in Year {activeModalYear}.{' '}
                  {pdfAuditResult?.matchedTemplateName
                    ? `Click "Confirm & Add" below to credit your points.`
                    : 'Select document type below to credit points.'}
                </span>
              </div>
            )}

            {/* Step 4: Smart Category Override / Plain-English Selector */}
            <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-white/[0.08]">
              {pdfAuditResult &&
              pdfAuditResult.detectedType !== 'UNKNOWN' &&
              pdfAuditResult.matchedTemplateName ? (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Smart Reader automatically identified this file above.
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowManualCategories((prev) => !prev)}
                    className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline text-left sm:text-right cursor-pointer"
                  >
                    {showManualCategories
                      ? 'Hide manual options ▴'
                      : 'Wrong document type detected? Change manually ▾'}
                  </button>
                </div>
              ) : (
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  {pdfAuditResult?.detectedType === 'UNKNOWN'
                    ? 'Step 4: Select What This Document Is (Plain English)'
                    : 'Step 4: Select What Document You Are Adding (Plain English)'}
                </label>
              )}

              {(!pdfAuditResult ||
                pdfAuditResult.detectedType === 'UNKNOWN' ||
                !pdfAuditResult.matchedTemplateName ||
                showManualCategories) && (
                <div className="space-y-2">
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {!showAllOfficialCategories
                      ? PLAIN_ENGLISH_QUICK_CARDS.filter((q) =>
                          activeModalYear === 0
                            ? q.category === 'IDENTITY'
                            : q.category === 'RESIDENCY'
                        ).map((q) => {
                          const matchedDoc = OFFICIAL_ISD_DOCUMENTS.find(
                            (d) => d.name === q.templateName
                          );
                          if (!matchedDoc) return null;
                          return renderCategoryOptionCard(
                            matchedDoc,
                            q.templateName,
                            q.plainTitle,
                            q.plainSubtitle
                          );
                        })
                      : OFFICIAL_ISD_DOCUMENTS.filter((doc) =>
                          activeModalYear === 0
                            ? doc.category === 'IDENTITY'
                            : doc.category === 'RESIDENCY'
                        ).map((doc, idx) => renderCategoryOptionCard(doc, `official-${idx}`))}
                  </div>

                  {activeModalYear !== 0 && (
                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={() => setShowAllOfficialCategories((prev) => !prev)}
                        className="text-[11px] font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 underline cursor-pointer"
                      >
                        {showAllOfficialCategories
                          ? 'Back to plain-English view ▴'
                          : 'Show all official Form 8 categories ▾'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-slate-200 dark:border-white/[0.08] flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                  Document Watermark:
                </span>
                <div className="inline-flex rounded-lg border border-slate-300 dark:border-white/15 p-0.5 bg-slate-100 dark:bg-white/5">
                  <button
                    type="button"
                    onClick={() => {
                      setWatermarkEnabled(true);
                      localStorage.setItem('isd_watermark_enabled', 'true');
                    }}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                      watermarkEnabled
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    With ISD Watermark
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setWatermarkEnabled(false);
                      localStorage.setItem('isd_watermark_enabled', 'false');
                    }}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                      !watermarkEnabled
                        ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-950 shadow-sm'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Without Watermark (Original)
                  </button>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                {pdfAuditResult &&
                  pdfAuditResult.detectedType !== 'UNKNOWN' &&
                  pdfAuditResult.matchedTemplateName &&
                  (() => {
                    const chosenTemplateName =
                      pdfAuditResult.dualUseTemplateName && dspDualChoice === 'TYPE_B'
                        ? pdfAuditResult.dualUseTemplateName
                        : pdfAuditResult.matchedTemplateName;
                    const smartTemplate = OFFICIAL_ISD_DOCUMENTS.find(
                      (d) => d.name === chosenTemplateName
                    );
                    if (!smartTemplate) return null;
                    const smartTargetYear =
                      smartTemplate.category === 'IDENTITY' ? 0 : activeModalYear;
                    const isYearBlocked =
                      smartTemplate.category !== 'IDENTITY' &&
                      activeModalYear !== null &&
                      activeModalYear > 0 &&
                      modalDocYear !== activeModalYear;
                    const isBlocked = modalNameMismatch || isYearBlocked || smartTargetYear === null;
                    return (
                      <button
                        type="button"
                        disabled={isBlocked}
                        onClick={() => {
                          if (smartTargetYear !== null) {
                            handleAddDocToYear(smartTargetYear, smartTemplate);
                          }
                        }}
                        className="btn btn-sm btn-primary font-bold text-xs flex-1 h-auto min-h-9 py-2 whitespace-normal text-center"
                      >
                        <Check className="w-3.5 h-3.5 shrink-0" />
                        <span>
                          Confirm &amp; Add {pdfAuditResult.detectedPlainLabel || 'Document'} (+{smartTemplate.points} pts)
                        </span>
                      </button>
                    );
                  })()}
                <button
                  onClick={() => {
                    setActiveModalYear(null);
                    setModalUploadFile(null);
                    setModalYearMismatchError(null);
                    setPdfAuditResult(null);
                    setPdfAuditError(null);
                    setShowManualCategories(false);
                    setShowAllOfficialCategories(false);
                    setDspDualChoice('TYPE_A');
                  }}
                  className="btn btn-sm btn-secondary shrink-0"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Official Form 8 Master Dossier Export Modal */}
      <MasterDossierModal
        isOpen={dossierModalOpen}
        onClose={() => setDossierModalOpen(false)}
        user={
          user ||
          (applicantName
            ? {
                id: 'guest',
                name: applicantName,
                email: '',
                currentStamp: 'Stamp 4',
                targetYear: applicationYear,
                isPro: isUserPro,
              }
            : null)
        }
        scorecards={scorecards}
        applicationYear={applicationYear}
      />
    </div>
  );
};
