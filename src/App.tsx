import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HomeLanding } from './components/HomeLanding';
import { CitizenshipDashboard } from './components/CitizenshipDashboard';
import { DaysCalculator } from './components/DaysCalculator';
import { ScorecardBento } from './components/ScorecardBento';
import { WatermarkEngine } from './components/WatermarkEngine';
import { RequirementsHub } from './components/RequirementsHub';
import { PricingSection } from './components/PricingSection';
import { AuthModal } from './components/AuthModal';
import { AuthPage } from './components/AuthPage';
import { OnboardingModal } from './components/OnboardingModal';
import { ProfileSettingsModal } from './components/ProfileSettingsModal';
import { CheckoutModal } from './components/CheckoutModal';
import { PrivacyPolicyModal } from './components/PrivacyPolicyModal';
import { TermsModal } from './components/TermsModal';
import { CookieConsentBanner } from './components/CookieConsentBanner';
import { Footer } from './components/Footer';
import OnyxBadge from './components/OnyxBadge';
import { ThemeMode, UserProfile } from './types';
import {
  supabase,
  mapSupabaseUserToProfile,
  pullUserCloudRow,
  pushUserCloudRow,
  applyCloudDossierState,
  resetLocalDossierToBlank,
} from './lib/supabase';
import { ShieldCheck, Heart, ExternalLink } from 'lucide-react';

export const App: React.FC = () => {
  // Theme state: defaults straight to 'dark' for all new customers/visitors.
  // Respects 'light' only if previously toggled explicitly by the user.
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('isd_theme');
    if (saved === 'light') return 'light';
    return 'dark';
  });

  const [activeTab, setActiveTab] = useState<string>(() => {
    const savedUser = localStorage.getItem('isd_user');
    return savedUser ? 'dashboard' : 'home';
  });

  // User Profile State (Simulated persistence)
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('isd_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Guard: If user logs out, dashboard is disabled and redirects immediately to home
  useEffect(() => {
    if (!user && activeTab === 'dashboard') {
      setActiveTab('home');
    }
  }, [user, activeTab]);

  // Always jump to top on page load / refresh and disable browser retaining old scroll position
  useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  // Always jump to top whenever user changes page / tab
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [activeTab]);

  // Auth, Checkout, Legal & Compliance Modal State
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [dossierRevision, setDossierRevision] = useState(0);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
  const [termsModalOpen, setTermsModalOpen] = useState(false);

  // Synchronize 'dark' class on HTML root element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('isd_theme', theme);
  }, [theme]);

  // Restore active Supabase session & sync cloud dossier on mount/auth changes
  useEffect(() => {
    let mounted = true;

    const hydrateFromSession = async (
      sbUser: Parameters<typeof mapSupabaseUserToProfile>[0],
      redirectToDashboard = false
    ) => {
      const baseProfile = mapSupabaseUserToProfile(sbUser);
      const cloud = await pullUserCloudRow(sbUser.id);
      if (!mounted) return;
      const mergedProfile: UserProfile = cloud?.profile
        ? { ...baseProfile, ...cloud.profile, id: sbUser.id }
        : baseProfile;
      if (cloud?.dossierState?.isd_scorecards) {
        applyCloudDossierState(cloud.dossierState);
      } else {
        resetLocalDossierToBlank(mergedProfile.targetYear || 2026);
      }
      setDossierRevision((r) => r + 1);
      setUser(mergedProfile);
      localStorage.setItem('isd_user', JSON.stringify(mergedProfile));
      if (redirectToDashboard) {
        setActiveTab((prev) => (prev === 'auth' || prev === 'home' ? 'dashboard' : prev));
      }
      if (!mergedProfile.onboardingCompleted) {
        setShowOnboarding(true);
      }
    };

    supabase.auth.getSession().then(({ data }) => {
      if (mounted && data.session?.user) {
        hydrateFromSession(data.session.user, false);
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      if (event === 'SIGNED_IN' && session?.user) {
        hydrateFromSession(session.user, true);
      } else if (event === 'SIGNED_OUT') {
        setUser((prev) => (prev?.id === 'demo-user-1' ? prev : null));
        if (localStorage.getItem('isd_user')) {
          try {
            const parsed = JSON.parse(localStorage.getItem('isd_user') || '{}');
            if (parsed.id !== 'demo-user-1') {
              localStorage.removeItem('isd_user');
            }
          } catch {
            localStorage.removeItem('isd_user');
          }
        }
      }
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const toggleTheme = () => {
    const root = document.documentElement;
    root.classList.add('theme-transition');
    window.setTimeout(() => root.classList.remove('theme-transition'), 250);
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleOpenAuth = (mode: 'signin' | 'signup' = 'signin') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const handleLoginSuccess = async (loggedInUser: UserProfile) => {
    setUser(loggedInUser);
    localStorage.setItem('isd_user', JSON.stringify(loggedInUser));
    setActiveTab('dashboard'); // Direct to Citizenship Dashboard upon logging in

    if (loggedInUser.id !== 'demo-user-1') {
      const cloud = await pullUserCloudRow(loggedInUser.id);
      if (cloud?.dossierState?.isd_scorecards) {
        applyCloudDossierState(cloud.dossierState);
      } else {
        resetLocalDossierToBlank(loggedInUser.targetYear || 2026);
        await pushUserCloudRow(loggedInUser.id, loggedInUser);
      }
      setDossierRevision((r) => r + 1);
    }
  };

  const handleUpdateUser = (updatedUser: UserProfile) => {
    setUser(updatedUser);
    localStorage.setItem('isd_user', JSON.stringify(updatedUser));
    if (updatedUser.id !== 'demo-user-1') {
      void pushUserCloudRow(updatedUser.id, updatedUser);
    }
  };

  const handleUpgradeSuccess = (updatedUser: UserProfile) => {
    setUser(updatedUser);
    localStorage.setItem('isd_user', JSON.stringify(updatedUser));
    if (updatedUser.id !== 'demo-user-1') {
      void pushUserCloudRow(updatedUser.id, updatedUser);
    }
  };

  const handleSignOut = () => {
    setUser(null);
    setShowOnboarding(false);
    localStorage.removeItem('isd_user');
    localStorage.removeItem('isd_scorecards');
    localStorage.removeItem('isd_year_docs_archive');
    localStorage.removeItem('isd_cover_letter_notes');
    localStorage.removeItem('isd_periods');
    localStorage.removeItem('isd_final_year_absences');
    localStorage.removeItem('isd_guest_applicant_name');
    setDossierRevision((r) => r + 1);
    setActiveTab('home');
    void supabase.auth.signOut();
  };

  const handleOnboardingComplete = (updatedUser: UserProfile) => {
    setUser(updatedUser);
    setShowOnboarding(false);
    localStorage.setItem('isd_user', JSON.stringify(updatedUser));
    if (updatedUser.targetYear) {
      resetLocalDossierToBlank(updatedUser.targetYear);
      setDossierRevision((r) => r + 1);
    }
    setActiveTab('dashboard');

    if (updatedUser.id !== 'demo-user-1') {
      void supabase.auth.updateUser({
        data: {
          full_name: updatedUser.name,
          current_stamp: updatedUser.currentStamp,
          target_year: updatedUser.targetYear,
          onboarding_completed: true,
        },
      });
      void pushUserCloudRow(updatedUser.id, updatedUser);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col w-full max-w-full overflow-x-hidden">
      {/* Soft ambient glow behind the header */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px] bg-[radial-gradient(60%_60%_at_50%_0%,rgba(16,185,129,0.10),transparent)] dark:bg-[radial-gradient(60%_60%_at_50%_0%,rgba(16,185,129,0.14),transparent)]"
      />
      
      {/* Top Navbar with Hybrid Theme Switcher & User Account Header */}
      <Navbar
        theme={theme}
        onToggleTheme={toggleTheme}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        user={user}
        onOpenAuth={handleOpenAuth}
        onOpenSettings={() => setSettingsModalOpen(true)}
        onSignOut={handleSignOut}
      />

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-8 md:pb-16">
        {activeTab === 'home' && (
          <HomeLanding
            onNavigate={setActiveTab}
          />
        )}
        {activeTab === 'dashboard' && (
          <CitizenshipDashboard
            key={`dash-${user?.id || 'guest'}-${dossierRevision}`}
            user={user}
            onNavigate={setActiveTab}
            onOpenAuth={handleOpenAuth}
          />
        )}
        {activeTab === 'calculator' && (
          <DaysCalculator onGoToVault={() => setActiveTab('vault')} />
        )}
        {activeTab === 'vault' && (
          <ScorecardBento
            key={`vault-${user?.id || 'guest'}-${dossierRevision}`}
            onGoToPricing={() => setActiveTab('pricing')}
            user={user}
            onOpenCheckout={() => setCheckoutModalOpen(true)}
          />
        )}
        {activeTab === 'watermark' && <WatermarkEngine />}
        {activeTab === 'requirements' && <RequirementsHub />}
        {activeTab === 'pricing' && (
          <PricingSection
            onOpenCheckout={() => setCheckoutModalOpen(true)}
            onStartCalculator={() => setActiveTab('calculator')}
            user={user}
          />
        )}
        {activeTab === 'auth' && (
          <AuthPage
            initialMode={authModalMode}
            onLoginSuccess={handleLoginSuccess}
            onNavigateHome={() => setActiveTab('home')}
            onOpenPrivacy={() => setPrivacyModalOpen(true)}
            onOpenTerms={() => setTermsModalOpen(true)}
          />
        )}
      </main>

      {/* Standalone Authentication Modal (Usable from anywhere in the app) */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
        onLoginSuccess={handleLoginSuccess}
        onOpenPrivacy={() => setPrivacyModalOpen(true)}
        onOpenTerms={() => setTermsModalOpen(true)}
      />

      {/* Stripe-Powered Pro Checkout Modal */}
      <CheckoutModal
        isOpen={checkoutModalOpen}
        onClose={() => setCheckoutModalOpen(false)}
        user={user}
        onUpgradeSuccess={handleUpgradeSuccess}
        onOpenAuth={handleOpenAuth}
      />

      {/* Profile & Vault Settings Modal */}
      {user && (
        <ProfileSettingsModal
          isOpen={settingsModalOpen}
          onClose={() => setSettingsModalOpen(false)}
          user={user}
          onUpdateUser={handleUpdateUser}
          onSignOut={handleSignOut}
          onOpenCheckout={() => setCheckoutModalOpen(true)}
        />
      )}

      {/* First-Time OAuth / Magic Link Onboarding Modal */}
      {user && (
        <OnboardingModal
          isOpen={showOnboarding}
          user={user}
          onComplete={handleOnboardingComplete}
        />
      )}

      {/* GDPR Data Protection & Privacy Policy Modal */}
      <PrivacyPolicyModal
        isOpen={privacyModalOpen}
        onClose={() => setPrivacyModalOpen(false)}
        onOpenTerms={() => {
          setPrivacyModalOpen(false);
          setTermsModalOpen(true);
        }}
      />

      {/* Official Irish Terms of Service Modal */}
      <TermsModal
        isOpen={termsModalOpen}
        onClose={() => setTermsModalOpen(false)}
        onOpenPrivacy={() => {
          setTermsModalOpen(false);
          setPrivacyModalOpen(true);
        }}
      />

      {/* Floating GDPR Cookie & Local Storage Consent Banner */}
      <CookieConsentBanner
        onOpenPrivacy={() => setPrivacyModalOpen(true)}
      />

      {/* Official Executive Civic & Compliance Footer */}
      <Footer
        onNavigate={setActiveTab}
        onOpenPrivacy={() => setPrivacyModalOpen(true)}
        onOpenTerms={() => setTermsModalOpen(true)}
        onOpenCookieSettings={() => {
          localStorage.removeItem('isd_cookie_consent');
          localStorage.removeItem('isd_cookie_consent_timestamp');
          window.location.reload();
        }}
        onOpenAuth={handleOpenAuth}
      />
    </div>
  );
};

export default App;

