import React, { useState, useEffect } from 'react';
import { Bug, X, Send, CheckCircle2, AlertCircle, Mail } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { UserProfile } from '../types';

interface ReportProblemModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  activeTab: string;
}

const CATEGORIES = [
  'PDF Smart Reader',
  'Calculator / Days',
  '150-Point Scorecard',
  'Sign In / Billing',
  'Mobile Layout / Other',
];

export const ReportProblemModal: React.FC<ReportProblemModalProps> = ({
  isOpen,
  onClose,
  user,
  activeTab,
}) => {
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [contactEmail, setContactEmail] = useState(user?.email || '');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setContactEmail(user?.email || '');
      setDescription('');
      setErrorMsg(null);
      setSubmitted(false);
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (description.trim().length < 5) {
      setErrorMsg('Please explain the issue briefly (at least 5 characters) so we can fix it.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('bug_reports').insert({
        user_id: user && user.id !== 'demo-user-1' ? user.id : null,
        contact_email: contactEmail.trim() || null,
        category,
        description: description.trim(),
        active_tab: activeTab,
        page_url: window.location.href,
        user_agent: navigator.userAgent,
      });

      if (error) {
        throw new Error(error.message);
      }
      setSubmitted(true);
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? `${err.message} — You can also email support@citizenscore.ie directly.`
          : 'Could not send report. Please email support@citizenscore.ie.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative card max-w-md w-full p-0 shadow-2xl overflow-hidden border border-slate-300 dark:border-white/10 bg-white dark:bg-obsidian-900">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-white/10 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
              <Bug className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                Report a Problem
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                Please explain briefly what went wrong and we will fix it as soon as we can.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors shrink-0"
            aria-label="Close report modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          {submitted ? (
            <div className="py-6 text-center space-y-3 animate-in fade-in">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Thanks — Report Received!
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
                  Our team has logged this issue and will investigate and fix it as soon as possible.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="btn btn-primary btn-sm px-5 text-xs font-bold mt-2"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 text-red-900 dark:text-red-200 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Where did the issue happen?
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="input text-xs w-full bg-white dark:bg-obsidian-800"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Briefly explain the issue
                </label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Uploaded my AIB statement for 2025 and it showed..."
                  className="input text-xs w-full py-2.5 resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Your Email <span className="font-normal text-slate-400">(optional, for follow-up)</span>
                </label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="you@domain.com"
                  className="input text-xs w-full"
                />
              </div>

              <div className="pt-1 flex flex-col gap-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary w-full h-10 text-xs font-bold flex items-center justify-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Sending Report...' : 'Send Problem Report'}</span>
                </button>
                <a
                  href={`mailto:support@citizenscore.ie?subject=${encodeURIComponent(
                    `[CitizenScore Issue] ${category}`
                  )}&body=${encodeURIComponent(description)}`}
                  className="text-[11px] text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Mail className="w-3 h-3" />
                  <span>Or email support@citizenscore.ie directly</span>
                </a>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
