export type StampType =
  | '1'
  | '1A'
  | '1G'
  | '2'
  | '2A'
  | '3'
  | '4'
  | '5'
  | '6';

export interface StampPeriod {
  id: string;
  stamp: StampType;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  calculatedDays: number;
  isReckonable: boolean;
  isOverlapAdjusted?: boolean;
  overlapDays?: number;
  effectiveStartDate?: string;
}

export type DocumentCategory = 'IDENTITY' | 'RESIDENCY';

/**
 * ISD Form 8 Scorecard classifications:
 * - For Identity: documents carry specific point scores (Passport = 150 pts by itself).
 * - For Residence: documents are strictly Type A (100 pts) or Type B (50 pts).
 *   Target is 1 Type A + 1 Type B = 150 points per reckonable year.
 */
export type DocumentType = 'IDENTITY_PRIMARY' | 'IDENTITY_SECONDARY' | 'TYPE_A' | 'TYPE_B';

export interface ScorecardDocument {
  id: string;
  name: string;
  category: DocumentCategory;
  type: DocumentType;
  points: number;
  year?: number; // undefined for identity
  issuer: string;
  isdGuidelineRef: string;
  uploadedAt?: string;
  isWatermarked?: boolean;
  notes?: string;
  fileName?: string;
}

export interface YearScorecard {
  year: number;
  label: string;
  targetPoints: number;
  currentPoints: number;
  documents: ScorecardDocument[];
  isComplete: boolean;
  hasTypeA?: boolean;
  hasTypeB?: boolean;
}

export type ThemeMode = 'light' | 'dark';

export interface SubscriptionDetails {
  plan: 'free' | 'pro';
  status: 'active' | 'cancelled' | 'trial';
  renewalDate?: string;
  cancelAtPeriodEnd?: boolean;
  paymentMethodLast4?: string;
  paymentMethodBrand?: string;
  monthlyAmount?: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  currentStamp?: string;
  targetYear?: number;
  isPro?: boolean;
  avatarUrl?: string;
  onboardingCompleted?: boolean;
  subscription?: SubscriptionDetails;
}
