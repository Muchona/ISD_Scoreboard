import React, { useState } from 'react';
import {
  User,
  Mail,
  ShieldCheck,
  Calendar,
  Save,
  X,
  CheckCircle2,
  Lock,
  Sparkles,
  Download,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { UserProfile } from '../types';

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUpdateUser: (updatedUser: UserProfile) => void;
  onSignOut: () => void;
  onOpenCheckout?: () => void;
}

export const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser,
  onSignOut,
  onOpenCheckout,
}) => {
  const [fullName, setFullName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [currentStamp, setCurrentStamp] = useState(user.currentStamp || 'Stamp 4');
  const [targetYear, setTargetYear] = useState<number>(user.targetYear || 2026);
  const [isSaved, setIsSaved] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCancelSubConfirm, setShowCancelSubConfirm] = useState(false);
  const [cancelSubSuccess, setCancelSubSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      ...user,
      name: fullName,
      email: email,
      currentStamp: currentStamp,
      targetYear: targetYear,
    };
    onUpdateUser(updated);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 900);
  };

  const handleCancelSubscription = () => {
    const updated: UserProfile = {
      ...user,
      isPro: false,
      subscription: {
        ...(user.subscription || { plan: 'pro', status: 'cancelled' }),
        status: 'cancelled',
        cancelAtPeriodEnd: true,
      },
    };
    onUpdateUser(updated);
    setShowCancelSubConfirm(false);
    setCancelSubSuccess(true);
    setTimeout(() => {
      setCancelSubSuccess(false);
    }, 3500);
  };

  const handleExportData = () => {
    const data = {
      user: {
        ...user,
        name: fullName,
        email: email,
        currentStamp: currentStamp,
        targetYear: targetYear,
      },
      exportedAt: new Date().toISOString(),
      format: 'CitizenScore.ie Form 8 Profile Backup',
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CitizenScore_Profile_${fullName.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative card max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5 border border-slate-300 dark:border-white/10 max-h-[90vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white flex items-center justify-center font-bold text-base shadow-sm shadow-emerald-700/25">
              {fullName.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                Applicant Profile & Vault Settings
              </h3>
              <p className="text-xs text-slate-500">
                Manage your legal name, residency status, and filing target.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Alert */}
        {isSaved && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/60 text-emerald-900 dark:text-emerald-200 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="font-bold">Profile changes saved successfully!</span>
          </div>
        )}

        {/* Edit Form */}
        <form onSubmit={handleSave} className="space-y-4">
          {/* Legal Name */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Full Legal Name <span className="text-slate-400 font-normal">(as registered with ISD / IRP)</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="input pl-9 text-xs w-full font-medium"
              />
            </div>
            <p className="text-[11px] text-slate-500">
              This name will be embedded on all PDF anti-theft watermarks and Form 8 cover summaries.
            </p>
          </div>

          {/* Email Address */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input pl-9 text-xs w-full font-medium"
              />
            </div>
          </div>

          {/* Stamp Status & Target Year Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Current Irish Stamp
              </label>
              <select
                value={currentStamp}
                onChange={(e) => setCurrentStamp(e.target.value)}
                className="input text-xs w-full bg-white dark:bg-obsidian-800 font-medium"
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
                className="input text-xs w-full bg-white dark:bg-obsidian-800 font-mono font-medium"
              >
                <option value={2026}>2026 (Current)</option>
                <option value={2025}>2025</option>
                <option value={2027}>2027</option>
              </select>
            </div>
          </div>

          {/* Membership Tier & Active Subscription Card */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
                  Subscription & Billing
                </span>
                <div className="flex items-center gap-2">
                  <span className={`chip text-xs font-bold ${user.isPro ? 'chip-emerald' : 'chip-amber'}`}>
                    {user.isPro ? '★ CitizenScore Pro' : 'Free Trial Tier'}
                  </span>
                  <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                    {user.isPro ? '€5.00 / month (Active)' : 'Cards 1 & 2 Unlocked'}
                  </span>
                </div>
              </div>

              {!user.isPro && onOpenCheckout && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenCheckout();
                  }}
                  className="btn btn-sm btn-primary text-xs font-bold shadow-sm shadow-emerald-700/20"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Upgrade (€5/mo)</span>
                </button>
              )}
            </div>

            {/* Pro Subscription Controls */}
            {user.isPro && (
              <div className="pt-2 border-t border-slate-200/80 dark:border-white/5 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                  <span>
                    Payment Method: <strong className="text-slate-900 dark:text-white font-mono">Visa •••• {user.subscription?.paymentMethodLast4 || '4242'}</strong>
                  </span>
                  <span>
                    Next Renewal: <strong className="text-slate-900 dark:text-white font-mono">{user.subscription?.renewalDate || 'In 30 days'}</strong>
                  </span>
                </div>

                {cancelSubSuccess ? (
                  <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/60 text-emerald-900 dark:text-emerald-200 text-xs flex items-center gap-2 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Your Pro subscription has been cancelled. No further charges will occur.</span>
                  </div>
                ) : showCancelSubConfirm ? (
                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 space-y-2 animate-in fade-in">
                    <div className="flex items-start gap-2 text-xs text-amber-900 dark:text-amber-200">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">Cancel your Pro subscription?</span>
                        <p className="mt-0.5 text-[11px] leading-relaxed">
                          Your account will revert to the Free Trial. You will retain access until the end of your billing cycle and will not be charged again.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowCancelSubConfirm(false)}
                        className="btn btn-sm btn-ghost text-xs h-7 px-2.5"
                      >
                        Keep Pro Subscription
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelSubscription}
                        className="btn btn-sm bg-red-600 hover:bg-red-700 text-white font-bold text-xs h-7 px-3 rounded-lg shadow-xs"
                      >
                        Yes, Cancel Subscription
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-slate-500">
                      Manage or stop recurring payments anytime:
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowCancelSubConfirm(true)}
                      className="text-xs font-semibold text-red-600 dark:text-red-400 hover:underline hover:text-red-700 transition-colors"
                    >
                      Cancel Subscription
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-sm btn-secondary text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-sm btn-primary text-xs font-bold shadow-sm shadow-emerald-700/20"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>

        {/* Data Sovereignty & Account Actions */}
        <div className="pt-4 border-t border-slate-200 dark:border-white/10 space-y-3">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
            Data Privacy & GDPR Controls
          </span>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={handleExportData}
              className="btn btn-sm btn-ghost text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Profile Data (JSON)</span>
            </button>

            {showDeleteConfirm ? (
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-red-600 font-semibold">Confirm delete?</span>
                <button
                  type="button"
                  onClick={() => {
                    onSignOut();
                    onClose();
                  }}
                  className="btn btn-sm bg-red-600 hover:bg-red-700 text-white text-xs px-2.5 py-1"
                >
                  Yes, Delete Vault
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="btn btn-sm btn-ghost text-xs px-2 py-1"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="btn btn-sm btn-ghost text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Vault Data</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
