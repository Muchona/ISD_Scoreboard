import { createClient, type User as SupabaseUser } from '@supabase/supabase-js';
import type { UserProfile } from '../types';
import { createBlankScorecards } from '../utils/blankScorecards';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || 'https://xkgusbogyomjexhclooj.supabase.co';
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_uh8SDXhionL6e2IQBTDj0w_VN5_2_fo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export const DOSSIER_SYNC_KEYS = [
  'isd_scorecards',
  'isd_year_docs_archive',
  'isd_periods',
  'isd_final_year_absences',
  'isd_filing_year',
  'isd_cover_letter_notes',
  'isd_watermark_enabled',
  'isd_guest_applicant_name',
] as const;

export function mapSupabaseUserToProfile(sbUser: SupabaseUser): UserProfile {
  const meta = sbUser.user_metadata || {};
  return {
    id: sbUser.id,
    name:
      (typeof meta.full_name === 'string' && meta.full_name.trim()) ||
      (typeof meta.name === 'string' && meta.name.trim()) ||
      sbUser.email?.split('@')[0] ||
      'Applicant',
    email: sbUser.email || '',
    currentStamp:
      typeof meta.current_stamp === 'string' ? meta.current_stamp : 'Stamp 4',
    targetYear:
      typeof meta.target_year === 'number' ? meta.target_year : 2026,
    isPro: Boolean(meta.is_pro),
    avatarUrl: typeof meta.avatar_url === 'string' ? meta.avatar_url : undefined,
    onboardingCompleted: Boolean(meta.onboarding_completed || meta.current_stamp),
    subscription: meta.subscription,
  };
}

export function collectLocalDossierState(): Record<string, string> {
  const state: Record<string, string> = {};
  for (const key of DOSSIER_SYNC_KEYS) {
    const val = localStorage.getItem(key);
    if (val !== null) {
      state[key] = val;
    }
  }
  return state;
}

export function applyCloudDossierState(state: Record<string, string>): void {
  for (const key of DOSSIER_SYNC_KEYS) {
    if (typeof state[key] === 'string') {
      localStorage.setItem(key, state[key]);
    }
  }
}

export function resetLocalDossierToBlank(targetYear = 2026): void {
  localStorage.removeItem('isd_year_docs_archive');
  localStorage.removeItem('isd_cover_letter_notes');
  localStorage.removeItem('isd_periods');
  localStorage.removeItem('isd_final_year_absences');
  localStorage.removeItem('isd_guest_applicant_name');
  localStorage.setItem('isd_filing_year', String(targetYear));
  localStorage.setItem('isd_scorecards', JSON.stringify(createBlankScorecards(targetYear)));
}

export async function pullUserCloudRow(userId: string): Promise<{
  profile?: Partial<UserProfile>;
  dossierState?: Record<string, string>;
} | null> {
  try {
    const { data, error } = await supabase
      .from('user_scorecards')
      .select('profile, dossier_state')
      .eq('user_id', userId)
      .maybeSingle();

    if (error || !data) return null;
    return {
      profile: (data.profile as Partial<UserProfile>) || undefined,
      dossierState: (data.dossier_state as Record<string, string>) || undefined,
    };
  } catch {
    return null;
  }
}

export async function pushUserCloudRow(
  userId: string,
  profile: UserProfile,
  dossierState: Record<string, string> = collectLocalDossierState()
): Promise<boolean> {
  try {
    const { error } = await supabase.from('user_scorecards').upsert(
      {
        user_id: userId,
        profile,
        dossier_state: dossierState,
      },
      { onConflict: 'user_id' }
    );
    return !error;
  } catch {
    return false;
  }
}
