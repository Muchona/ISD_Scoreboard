import { ScorecardDocument } from '../types';

export const ISD_OFFICIAL_URLS = {
  proofsOfIdentityAndResidence:
    'https://www.irishimmigration.ie/how-to-become-a-citizen/become-an-irish-citizen-by-naturalisation/proofs-of-identity-and-residence/',
  citizenshipGuide:
    'https://www.irishimmigration.ie/how-to-become-an-irish-citizen-guide/',
  residencyCalculator:
    'https://www.irishimmigration.ie/naturalisation-residency-calculator/',
  citizenshipLawAndPolicy:
    'https://www.irishimmigration.ie/how-to-become-a-citizen/citizenship-law-policy-and-guidance/',
  spousesAndCivilPartners:
    'https://www.irishimmigration.ie/how-to-become-a-citizen/naturalisation-spouses-civil-partners/',
};

export const OFFICIAL_ISD_DOCUMENTS: Omit<ScorecardDocument, 'id' | 'year' | 'uploadedAt'>[] = [
  // ==========================================
  // IDENTITY DOCUMENTS (150 points required once)
  // A single valid passport satisfies the entire requirement!
  // ==========================================
  {
    name: 'Current Valid In-Date Passport (Certified Colour Biometric Copy)',
    category: 'IDENTITY',
    type: 'IDENTITY_PRIMARY',
    points: 150,
    issuer: 'National Passport Authority of Home Country',
    isdGuidelineRef: ISD_OFFICIAL_URLS.proofsOfIdentityAndResidence,
    notes: 'Worth 150 points on its own. Immediately satisfies the identity threshold.',
  },
  {
    name: 'Expired Passport (Expired less than 365 days)',
    category: 'IDENTITY',
    type: 'IDENTITY_SECONDARY',
    points: 75,
    issuer: 'National Passport Authority of Home Country',
    isdGuidelineRef: ISD_OFFICIAL_URLS.proofsOfIdentityAndResidence,
    notes: 'Alternative proof if current passport is unavailable.',
  },
  {
    name: 'National Identity Card (EU / EEA / Swiss compliant)',
    category: 'IDENTITY',
    type: 'IDENTITY_SECONDARY',
    points: 75,
    issuer: 'EU / EEA Competent Authority',
    isdGuidelineRef: ISD_OFFICIAL_URLS.proofsOfIdentityAndResidence,
    notes: 'Acceptable alternative for European nationals.',
  },
  {
    name: 'Irish Residence Permit (IRP) Card (In-Date)',
    category: 'IDENTITY',
    type: 'IDENTITY_SECONDARY',
    points: 25,
    issuer: 'Immigration Service Delivery / Garda National Immigration Bureau',
    isdGuidelineRef: ISD_OFFICIAL_URLS.proofsOfIdentityAndResidence,
    notes: 'In-date IRP registration card.',
  },
  {
    name: 'Public Services Card (PSC) / PPSN Confirmation',
    category: 'IDENTITY',
    type: 'IDENTITY_SECONDARY',
    points: 25,
    issuer: 'Department of Social Protection',
    isdGuidelineRef: ISD_OFFICIAL_URLS.proofsOfIdentityAndResidence,
    notes: 'Irish social protection identity card with PPSN.',
  },
  {
    name: 'Irish / International Driving Licence (Photo ID)',
    category: 'IDENTITY',
    type: 'IDENTITY_SECONDARY',
    points: 10,
    issuer: 'National Driver Licence Service (NDLS)',
    isdGuidelineRef: ISD_OFFICIAL_URLS.proofsOfIdentityAndResidence,
    notes: 'Driving licence with photographic identification.',
  },

  // ==========================================
  // RESIDENCY TYPE A DOCUMENTS (100 points each)
  // Exactly 1 Type A document required per reckonable year
  // ==========================================
  {
    name: 'Employment Detail Summary (EDS) in Applicant’s Name',
    category: 'RESIDENCY',
    type: 'TYPE_A',
    points: 100,
    issuer: 'Revenue Commissioners (MyAccount / ROS)',
    isdGuidelineRef: ISD_OFFICIAL_URLS.proofsOfIdentityAndResidence,
    notes: 'Must be in applicant’s name only (spouse/partner EDS earns 0 points).',
  },
  {
    name: 'Bank Statements (3+ Consecutive Monthly POS Transactions in Ireland)',
    category: 'RESIDENCY',
    type: 'TYPE_A',
    points: 100,
    issuer: 'Central Bank of Ireland / ECB Regulated Retail Bank or Credit Union',
    isdGuidelineRef: ISD_OFFICIAL_URLS.proofsOfIdentityAndResidence,
    notes: 'Must show point-of-sale shop transactions on the island of Ireland with merchant addresses.',
  },
  {
    name: 'Department of Social Protection Annual Statement (Contribution or Payment)',
    category: 'RESIDENCY',
    type: 'TYPE_A',
    points: 100,
    issuer: 'Department of Social Protection',
    isdGuidelineRef: ISD_OFFICIAL_URLS.proofsOfIdentityAndResidence,
    notes: 'Annual contribution or payment statement showing contributions/claims.',
  },
  {
    name: 'Medical Practitioner Employment History Summary',
    category: 'RESIDENCY',
    type: 'TYPE_A',
    points: 100,
    issuer: 'HSE / Voluntary Hospital Employer',
    isdGuidelineRef: ISD_OFFICIAL_URLS.proofsOfIdentityAndResidence,
    notes: 'Special provision for doctors employed in the HSE or voluntary hospitals.',
  },
  {
    name: 'Historical P60 / P21 Balancing Statement (Pre-2019 Years)',
    category: 'RESIDENCY',
    type: 'TYPE_A',
    points: 100,
    issuer: 'Revenue Commissioners',
    isdGuidelineRef: ISD_OFFICIAL_URLS.proofsOfIdentityAndResidence,
    notes: 'Official tax documentation for historical tax years.',
  },

  // ==========================================
  // RESIDENCY TYPE B DOCUMENTS (50 points each)
  // Exactly 1 Type B document required per reckonable year
  // ==========================================
  {
    name: 'Household Electricity / Gas / Water Utility Bill',
    category: 'RESIDENCY',
    type: 'TYPE_B',
    points: 50,
    issuer: 'Electric Ireland / Bord Gáis / SSE Airtricity / Uisce Éireann',
    isdGuidelineRef: ISD_OFFICIAL_URLS.proofsOfIdentityAndResidence,
    notes: 'Shows applicant name, residential address, and issue date within the claimed year.',
  },
  {
    name: 'Household Broadband / Landline Telephone / Cable TV Bill',
    category: 'RESIDENCY',
    type: 'TYPE_B',
    points: 50,
    issuer: 'Virgin Media / Eir / Vodafone / Sky Ireland',
    isdGuidelineRef: ISD_OFFICIAL_URLS.proofsOfIdentityAndResidence,
    notes: 'Home telecommunications or media subscription bill.',
  },
  {
    name: 'Television Licence (An Post / Ceadúnas Teilifíse)',
    category: 'RESIDENCY',
    type: 'TYPE_B',
    points: 50,
    issuer: 'An Post (TV Licence Records Office)',
    isdGuidelineRef: ISD_OFFICIAL_URLS.proofsOfIdentityAndResidence,
    notes: 'Official television licence showing applicant legal name and Irish residential premises.',
  },
  {
    name: 'Residential Tenancy Agreement / RTB Registration Letter',
    category: 'RESIDENCY',
    type: 'TYPE_B',
    points: 50,
    issuer: 'Residential Tenancies Board (RTB) / Registered Landlord',
    isdGuidelineRef: ISD_OFFICIAL_URLS.proofsOfIdentityAndResidence,
    notes: 'Official lease or tenancy board registration for the claimed year.',
  },
  {
    name: 'Annual Mortgage Statement',
    category: 'RESIDENCY',
    type: 'TYPE_B',
    points: 50,
    issuer: 'Regulated Mortgage Lender / Retail Bank',
    isdGuidelineRef: ISD_OFFICIAL_URLS.proofsOfIdentityAndResidence,
    notes: 'Shows property address and regular mortgage payments.',
  },
  {
    name: 'Credit Card Statement (Showing Irish Living Activity)',
    category: 'RESIDENCY',
    type: 'TYPE_B',
    points: 50,
    issuer: 'Regulated Credit Card Provider / Bank',
    isdGuidelineRef: ISD_OFFICIAL_URLS.proofsOfIdentityAndResidence,
    notes: 'Shows periodic transactions and home address.',
  },
  {
    name: 'Doctor / GP Medical Attendance Letter or Clinic Registration',
    category: 'RESIDENCY',
    type: 'TYPE_B',
    points: 50,
    issuer: 'Registered Irish GP Practice / Family Surgery / HSE Clinic',
    isdGuidelineRef: ISD_OFFICIAL_URLS.proofsOfIdentityAndResidence,
    notes: 'Official signed letter on practice letterhead confirming patient registration and in-person medical attendance.',
  },
  {
    name: 'Hospital / Clinic Attendance Letter or Health Screening Check',
    category: 'RESIDENCY',
    type: 'TYPE_B',
    points: 50,
    issuer: 'HSE Hospital / Registered Specialist Clinic',
    isdGuidelineRef: ISD_OFFICIAL_URLS.proofsOfIdentityAndResidence,
    notes: 'Letter confirming medical appointment, clinic attendance, or screening.',
  },
  {
    name: 'Local Authority Bin Collection / Waste Management Bill',
    category: 'RESIDENCY',
    type: 'TYPE_B',
    points: 50,
    issuer: 'Panda / Greyhound / City Bin Co / Local Authority',
    isdGuidelineRef: ISD_OFFICIAL_URLS.proofsOfIdentityAndResidence,
    notes: 'Household waste collection invoice showing address.',
  },
  {
    name: 'Official Correspondence on Local Property Tax (LPT) / Social Welfare',
    category: 'RESIDENCY',
    type: 'TYPE_B',
    points: 50,
    issuer: 'Revenue Commissioners / Local Authority / DSP',
    isdGuidelineRef: ISD_OFFICIAL_URLS.proofsOfIdentityAndResidence,
    notes: 'Official local or national government correspondence.',
  },
  {
    name: 'Residential Proof Affidavit (ISD Form Citz-009/2026)',
    category: 'RESIDENCY',
    type: 'TYPE_B',
    points: 50,
    issuer: 'Immigration Service Delivery (ISD) • Sworn Affidavit',
    isdGuidelineRef: ISD_OFFICIAL_URLS.proofsOfIdentityAndResidence,
    notes: 'Exceptional fallback ONLY when standard 150-point proofs cannot be obtained. Must be signed before a Solicitor, Commissioner for Oaths, or Peace Commissioner.',
  },
];

export const OFFICIAL_ISD_RULES = [
  {
    title: 'The 150-Point Rule for Identity (Proven Once)',
    description:
      'You must prove your identity to reach a total score of 150 points. A certified colour copy of the biometric page of your valid in-date passport is worth 150 points on its own and satisfies the entire identity requirement. You only prove identity once for your application.',
    officialLink: ISD_OFFICIAL_URLS.proofsOfIdentityAndResidence,
    tag: 'Identity Scorecard',
  },
  {
    title: 'The 150-Point Rule for Residency (Type A + Type B)',
    description:
      'For every year of reckonable residence claimed on Form 8, you must achieve exactly 150 points. Residency documents are strictly divided into Type A (100 points, e.g. Revenue EDS, 3-month POS bank statements) and Type B (50 points, e.g. utility bills, tenancy agreements, mortgage statements). You must submit 1 Type A and 1 Type B document for each year.',
    officialLink: ISD_OFFICIAL_URLS.proofsOfIdentityAndResidence,
    tag: 'Residency Scorecard',
  },
  {
    title: 'Section 15C Absences Rule (Courts and Civil Law Act 2023)',
    description:
      'In the continuous 12 months immediately preceding the application, you are permitted up to 70 days absence from Ireland without needing justification. An additional period of up to 30 days (max 100 days total) may be allowed by the Minister for exceptional circumstances (health, work abroad, study, family emergency). Exceeding 100 days renders the application ineligible.',
    officialLink: ISD_OFFICIAL_URLS.proofsOfIdentityAndResidence,
    tag: 'Section 15C Rule',
  },
  {
    title: 'Stamp Reckonability (Stamps 1, 1G, 3, 4 vs Stamp 2)',
    description:
      'Stamps 1, 1G, 3, and 4 are reckonable towards the 1,825-day (5-year) naturalisation threshold. Stamp 2 and Stamp 2A (Student permissions) and visitor permissions are strictly non-reckonable and cannot be counted.',
    officialLink: ISD_OFFICIAL_URLS.residencyCalculator,
    tag: 'Immigration Act 2004',
  },
  {
    title: 'Spousal Pathway (3-Year / 1,095-Day Track)',
    description:
      'If you are married to or in a recognized civil partnership with an Irish citizen for at least 3 years, you require only 3 years (1,095 reckonable days) of continuous residence on the island of Ireland instead of 5 years.',
    officialLink: ISD_OFFICIAL_URLS.spousesAndCivilPartners,
    tag: 'Spousal Exemption',
  },
];
