import React, { useState, useEffect } from 'react';
import { ShieldCheck, User, ArrowRight, Sparkles } from 'lucide-react';
import { UserProfile } from '../types';

interface OnboardingModalProps {
  isOpen: boolean;
  user: UserProfile;
  onComplete: (updatedUser: UserProfile) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  user,
  onComplete,
}) => {
  const [fullName, setFullName] = useState(user.name || '');
  const [currentStamp, setCurrentStamp] = useState(user.currentStamp || 'Stamp 4');
  const [targetYear, setTargetYear] = useState<number>(user.targetYear || 2026);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFullName(user.name || '');
      setCurrentStamp(user.currentStamp || 'Stamp 4');
      setTargetYear(user.targetYear || 2026);
      setErrorMessage(null);
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrorMessage('Please enter your full legal name as it appears on your passport.');
      return;
    }
    onComplete({
      ...user,
      name: fullName.trim(),
      currentStamp,
      targetYear,
      onboardingCompleted: true,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative card max-w-md w-full p-6 shadow-2xl border border-slate-300 dark:border-white/10 space-y-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-500 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold mb-1">
              <Sparkles className="w-3 h-3" />
              <span>One-Time Applicant Setup</span>
            </div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
              Confirm Your Stamp &amp; Target Year
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Tailor your ISD Form 8 scorecard and 1,825-day reckonable residency tracker before entering your vault.
            </p>
          </div>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 text-red-900 dark:text-red-200 text-xs">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Full Legal Name (As on Passport)
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Aoife Murphy"
                className="input pl-9 text-xs w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Current Irish Stamp
              </label>
              <select
                value={currentStamp}
                onChange={(e) => setCurrentStamp(e.target.value)}
                className="input text-xs w-full bg-white dark:bg-obsidian-800"
              >
                <option value="Stamp 4">Stamp 4 (Work / PR)</option>
                <option value="Stamp 1">Stamp 1 (Employment)</option>
                <option value="Stamp 1G">Stamp 1G (Graduate/Spouse)</option>
                <option value="Stamp 2">Stamp 2 (Student)</option>
                <option value="Stamp 3">Stamp 3 (Dependent)</option>
                <option value="EU / Other">EU Citizen / Other</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Filing Target Year
              </label>
              <select
                value={targetYear}
                onChange={(e) => setTargetYear(parseInt(e.target.value, 10))}
                className="input text-xs w-full bg-white dark:bg-obsidian-800 font-mono"
              >
                <option value={2025}>2025</option>
                <option value={2026}>2026 (Current)</option>
                <option value={2027}>2027</option>
                <option value={2028}>2028</option>
                <option value={2029}>2029</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full h-11 text-xs font-bold shadow-md shadow-emerald-700/20"
          >
            <span>Save &amp; Open My Vault</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
