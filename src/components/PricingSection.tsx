import React from 'react';
import { Check, ArrowRight, HelpCircle, Sparkles } from 'lucide-react';
import { UserProfile } from '../types';

interface PricingSectionProps {
  onOpenCheckout?: () => void;
  onStartCalculator?: () => void;
  user?: UserProfile | null;
}

export const PricingSection: React.FC<PricingSectionProps> = ({
  onOpenCheckout,
  onStartCalculator,
  user,
}) => {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          Transparent, Fair, Predictable Pricing
        </span>
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          One Flat Price. Zero Hidden Legal Fees.
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          Immigration solicitors charge between €1,500 to €2,500+ just to manually review your paperwork. CitizenScore gives you automated precision for the price of one coffee a month.
        </p>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        
        {/* Free Plan */}
        <div className="p-6 md:p-8 card flex flex-col justify-between transition-colors">
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="font-extrabold text-lg text-slate-950 dark:text-white">Free Community Tier</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-300">
                Forever Free
              </span>
            </div>

            <div className="flex items-baseline gap-1 my-4">
              <span className="text-4xl font-extrabold font-mono text-slate-950 dark:text-white">€0</span>
              <span className="text-slate-600 dark:text-slate-400 text-xs font-semibold">/ forever</span>
            </div>

            <p className="text-xs text-slate-700 dark:text-slate-300 mb-6 font-normal">
              Essential continuous residence calculator for expats tracking their immigration stamps.
            </p>

            <ul className="space-y-3 text-xs text-slate-800 dark:text-slate-200 mb-8 font-medium">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>1,825-day reckonable countdown engine</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Stamp 1, 1G, 4, 3, 2 eligibility validator</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Final year 70-day absence policy monitor</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Official Department of Justice deep-linked citations</span>
              </li>
              <li className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <span className="w-4 text-center">✕</span>
                <span className="line-through">Annual 150-point Form 8 scorecard tracker</span>
              </li>
              <li className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <span className="w-4 text-center">✕</span>
                <span className="line-through">Automated anti-theft PDF watermarking</span>
              </li>
            </ul>
          </div>

          <button
            onClick={onStartCalculator}
            className="btn btn-secondary w-full h-11 text-xs font-bold"
          >
            Start Free Calculation
          </button>
        </div>

        {/* Pro Plan (€5/month) */}
        <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-b from-emerald-950 to-slate-950 text-white border-2 border-emerald-500 shadow-xl shadow-emerald-900/20 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-4 right-4 bg-emerald-500 text-slate-950 font-extrabold text-xs uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-xs">
            Most Popular
          </div>

          <div>
            <span className="font-bold text-lg text-white">Full Scoreboard & Vault</span>

            <div className="flex items-baseline gap-1 my-4">
              <span className="text-4xl font-extrabold font-mono text-emerald-400">€5.00</span>
              <span className="text-emerald-200 text-xs font-medium">/ month</span>
            </div>

            <p className="text-xs text-emerald-100/80 mb-6">
              Complete peace of mind. Audit-ready document scoring, cloud vault, and anti-theft protection.
            </p>

            <ul className="space-y-3 text-xs text-emerald-50 mb-8">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span><strong>All Free Tier Features</strong> included</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span><strong>Live 150-Point Progress Meters</strong> for Years 1–5 + Identity</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span><strong>Automated PDF Anti-Theft Watermarking</strong></span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span><strong>Missing Points Diagnostic</strong> (pinpoints exactly what document is needed)</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span><strong>1-Click Audit Dossier Export</strong> (compiles everything for Form 8)</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span><strong>Cancel Anytime in 1 Click</strong> directly from your account settings</span>
              </li>
            </ul>
          </div>

          {user?.isPro ? (
            <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-center text-xs font-bold text-emerald-300 flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>You are currently an active Pro Member ★</span>
            </div>
          ) : (
            <button
              onClick={onOpenCheckout}
              className="btn w-full h-11 bg-emerald-500 text-emerald-950 hover:bg-emerald-400 font-bold text-sm shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
            >
              <span>Subscribe for €5 / Month</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>

      {/* FAQ Accordion Section */}
      <div className="p-6 md:p-8 card space-y-4 transition-colors">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-emerald-600" />
          <span>Frequently Asked Questions</span>
        </h2>

        <div className="space-y-3 text-xs">
          <div className="p-3.5 card-inset">
            <h4 className="font-bold text-slate-900 dark:text-white">Why €5/month instead of a one-time fee?</h4>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Gathering 5 years of historical P21 summaries, bank statements, and leases takes applicants between 3 to 9 months. €5/month keeps your vault active and continuously validated as new tax years wrap up. You can cancel with 1 click whenever your application is submitted.
            </p>
          </div>

          <div className="p-3.5 card-inset">
            <h4 className="font-bold text-slate-900 dark:text-white">Will ISD reject watermarked documents?</h4>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              No. Our watermarking is semi-transparent (15–18% opacity) and placed diagonally so every PPSN, address, name, and transaction amount remains 100% visible and machine-readable. It prevents criminal exploitation of your identity records without violating ISD submission rules.
            </p>
          </div>

          <div className="p-3.5 card-inset">
            <h4 className="font-bold text-slate-900 dark:text-white">Is my data protected under EU GDPR?</h4>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Yes. CitizenScore is built exclusively on EU-region infrastructure (Frankfurt / Dublin) with bank-grade AES-256 encryption. We never sell data, never feed PII to AI models, and you can delete your entire account with 1 click.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
