import React, { useState, useEffect } from 'react';
import {
  Cookie,
  ShieldCheck,
  Check,
  X,
  Info,
  ChevronDown,
  ChevronUp,
  HardDrive,
  SunMoon,
  UserCheck,
} from 'lucide-react';

interface CookieConsentBannerProps {
  onOpenPrivacy?: () => void;
}

export const CookieConsentBanner: React.FC<CookieConsentBannerProps> = ({
  onOpenPrivacy,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Check if user has already made a consent choice
    const savedConsent = localStorage.getItem('isd_cookie_consent');
    if (!savedConsent) {
      // Small timeout to allow initial page animation to settle before floating in
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 750);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleConsent = (choice: 'all' | 'essential') => {
    localStorage.setItem('isd_cookie_consent', choice);
    localStorage.setItem('isd_cookie_consent_timestamp', new Date().toISOString());
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <aside
      aria-label="Cookie and storage consent"
      className="fixed bottom-3 sm:bottom-6 inset-x-3 sm:inset-x-6 z-50 max-w-4xl mx-auto animate-in slide-in-from-bottom-6 duration-300 pointer-events-auto"
    >
      <div className="card p-4 sm:p-6 shadow-2xl border border-slate-300 dark:border-white/20 bg-white/95 dark:bg-obsidian-900/95 backdrop-blur-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Main Informational Text */}
          <div className="flex items-start gap-3.5 flex-1">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
              <Cookie className="w-5 h-5" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Privacy-First Local Storage & Directives
                </span>
                <span className="chip chip-emerald text-[10px] font-mono py-0 h-5">
                  Zero Ad Trackers
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                CitizenScore.ie does not use third-party advertising or cross-site surveillance cookies. We use browser <strong className="text-slate-800 dark:text-slate-100">local storage</strong> strictly to persist your theme preference, session state, and calculated reckonable days.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0 justify-end pt-1 md:pt-0">
            <button
              type="button"
              onClick={() => setShowDetails(!showDetails)}
              className="btn btn-sm btn-ghost text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1"
            >
              <span>{showDetails ? 'Hide Details' : 'Customise'}</span>
              {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            <button
              type="button"
              onClick={() => handleConsent('essential')}
              className="btn btn-sm btn-secondary text-xs font-semibold"
            >
              Essential Only
            </button>

            <button
              type="button"
              onClick={() => handleConsent('all')}
              className="btn btn-sm btn-primary text-xs font-bold shadow-sm shadow-emerald-700/20"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Accept All</span>
            </button>
          </div>
        </div>

        {/* Expandable Granular Details */}
        {showDetails && (
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-white/10 space-y-3 animate-in fade-in duration-200 text-xs">
            <p className="text-slate-600 dark:text-slate-400">
              Under EU ePrivacy Directive (Directive 2002/58/EC) and Irish S.I. No. 336/2011, you have full transparency over how local client storage is utilised:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02] space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white text-[11px]">
                  <HardDrive className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Reckonable State (Essential)</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">
                  <code className="text-emerald-600 font-mono">isd_calculator_periods</code> stores your residency stamps locally on your device.
                </p>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02] space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white text-[11px]">
                  <SunMoon className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Theme Preference (Functional)</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">
                  <code className="text-emerald-600 font-mono">isd_theme</code> retains your dark/light mode setting between page reloads.
                </p>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02] space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white text-[11px]">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Session Vault (Essential)</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">
                  <code className="text-emerald-600 font-mono">isd_user</code> holds your local profile name, stamp, and Pro tier indicator.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 text-[11px]">
              <span className="text-slate-500">
                You can wipe all stored data at any time via Profile Settings.
              </span>
              {onOpenPrivacy && (
                <button
                  type="button"
                  onClick={onOpenPrivacy}
                  className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                >
                  Read full EU GDPR Privacy Policy →
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </aside>
  );
};
