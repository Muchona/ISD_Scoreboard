import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  CreditCard,
  CheckCircle2,
  X,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Loader2,
  Check,
  AlertCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile, SubscriptionDetails } from '../types';
import { supabase } from '../lib/supabase';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  onUpgradeSuccess: (updatedUser: UserProfile) => void;
  onOpenAuth?: (mode?: 'signin' | 'signup') => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpgradeSuccess,
  onOpenAuth,
}) => {
  // Form fields - default to user name or fallback pre-filled applicant name so it never blocks with an empty required alert
  const [cardName, setCardName] = useState(user?.name || 'Maria Silva');
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('888');
  const [country, setCountry] = useState('IE');
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'checkout' | 'authorizing' | 'success'>('checkout');
  const [authStepText, setAuthStepText] = useState('Connecting to Stripe network...');
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // Keep cardholder name updated when user logs in
  React.useEffect(() => {
    if (user?.name) {
      setCardName(user.name);
    }
  }, [user]);

  if (!isOpen) return null;

  // Format Card Number input with spaces
  const handleCardNumberChange = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(\d{4})/g, '$1 ').trim();
    setCardNumber(formatted);
  };

  // Format Expiry MM/YY
  const handleExpiryChange = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 3) {
      setCardExpiry(`${raw.slice(0, 2)}/${raw.slice(2, 4)}`);
    } else {
      setCardExpiry(raw);
    }
  };

  // Detect card brand
  const getCardBrand = () => {
    const clean = cardNumber.replace(/\s/g, '');
    if (clean.startsWith('4')) return 'Visa';
    if (clean.startsWith('5')) return 'Mastercard';
    if (clean.startsWith('3')) return 'Amex';
    return 'Card';
  };

  const executePayment = async (payerName: string) => {
    setCheckoutError(null);

    if (!user) {
      if (onOpenAuth) {
        onClose();
        onOpenAuth('signup');
      } else {
        setCheckoutError('Please sign in first to link your Pro subscription to your account.');
      }
      return;
    }

    // Real Supabase user: redirect to Stripe Hosted Checkout via Edge Function
    if (user.id !== 'demo-user-1') {
      setIsProcessing(true);
      setStep('authorizing');
      setAuthStepText('Creating secure Stripe Checkout session...');

      try {
        const returnUrl = `${window.location.origin}${window.location.pathname}`;
        const { data, error } = await supabase.functions.invoke('create-checkout-session', {
          body: { returnUrl },
        });

        if (error || !data?.url) {
          throw new Error(
            data?.error ||
              error?.message ||
              'Stripe checkout is not configured yet. Please add Stripe keys in Supabase Edge Function secrets.'
          );
        }

        window.location.href = data.url;
        return;
      } catch (err) {
        setIsProcessing(false);
        setStep('checkout');
        setCheckoutError(
          err instanceof Error ? err.message : 'Unable to start Stripe Checkout.'
        );
        return;
      }
    }

    // Demo user preview flow
    setIsProcessing(true);
    setStep('authorizing');
    setAuthStepText('Encrypting payment token via Stripe Elements...');

    setTimeout(() => {
      setAuthStepText('Verifying Strong Customer Authentication (3D Secure)...');
    }, 700);

    setTimeout(() => {
      setAuthStepText('Authorizing recurring €5.00/mo subscription...');
    }, 1400);

    setTimeout(() => {
      setIsProcessing(false);
      setStep('success');

      // Calculate next renewal date (1 month from today)
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      const renewalDateStr = nextMonth.toISOString().split('T')[0];

      const cleanNum = cardNumber.replace(/\s/g, '');
      const last4 = cleanNum.slice(-4) || '4242';

      const subscription: SubscriptionDetails = {
        plan: 'pro',
        status: 'active',
        renewalDate: renewalDateStr,
        cancelAtPeriodEnd: false,
        paymentMethodLast4: last4,
        paymentMethodBrand: getCardBrand().toLowerCase(),
        monthlyAmount: 5.0,
      };

      if (!user) {
        const provisionalUser: UserProfile = {
          id: `user-${Date.now()}`,
          name: payerName.trim() || 'Maria Silva',
          email: `${(payerName.trim() || 'applicant').toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
          currentStamp: 'Stamp 4',
          targetYear: new Date().getFullYear(),
          isPro: true,
          subscription,
        };
        onUpgradeSuccess(provisionalUser);
      } else {
        const updatedUser: UserProfile = {
          ...user,
          isPro: true,
          subscription,
        };
        onUpgradeSuccess(updatedUser);
      }

      // Trigger festive celebratory confetti
      confetti({
        particleCount: 140,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#00875A', '#10B981', '#FF883E', '#F59E0B'],
      });

      // Close modal after brief celebratory feedback
      setTimeout(() => {
        onClose();
        setStep('checkout');
      }, 1800);
    }, 2100);
  };

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    executePayment(cardName);
  };

  const handleExpressPay = (provider: 'apple' | 'google') => {
    const name = cardName || user?.name || (provider === 'apple' ? 'Apple Pay User' : 'Google Pay User');
    executePayment(name);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative card max-w-lg w-full p-0 shadow-2xl overflow-hidden border border-slate-300 dark:border-white/10 max-h-[94vh] flex flex-col bg-white dark:bg-obsidian-900">
        
        {/* Top Gradient Banner (with shrink-0 so flexbox never cuts it off) */}
        <div className="shrink-0 p-5 sm:p-6 bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white relative">
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors z-10"
            aria-label="Close checkout"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2 flex-wrap pr-8">
            <span className="chip bg-white/20 text-white text-[11px] font-bold border border-white/25">
              <Sparkles className="w-3 h-3 text-emerald-200" />
              Pro Vault Access
            </span>
            <span className="text-xs font-mono text-emerald-100 font-semibold">
              Cancel Anytime
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                Unlock Complete 5-Year Vault
              </h2>
              <p className="text-xs text-emerald-100 mt-1 max-w-sm">
                Full Form 8 citizenship scoring, certified watermarking & master dossier
              </p>
            </div>
            <div className="flex sm:flex-col items-baseline sm:items-end justify-between gap-1 pt-1 sm:pt-0 border-t sm:border-t-0 border-white/15">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold font-mono text-white">€5.00</span>
                <span className="text-xs text-emerald-100 font-semibold">/ mo</span>
              </div>
              <span className="text-[10px] text-emerald-200/90 font-mono">VAT included • Monthly</span>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {checkoutError && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 text-red-900 dark:text-red-200 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{checkoutError}</span>
            </div>
          )}
          {step === 'authorizing' ? (
            <div className="py-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-200 dark:border-emerald-800">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Securing Your Subscription
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-1">
                  {authStepText}
                </p>
              </div>
            </div>
          ) : step === 'success' ? (
            <div className="py-10 text-center space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
                <Check className="w-9 h-9 stroke-[3]" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Welcome to CitizenScore Pro!
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                  All 5 historical years and your Master Dossier PDF exporter are now permanently unlocked in your account.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Unlocked Features Highlights */}
              <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02] p-3.5 space-y-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold block">
                  What Unlocks Instantly:
                </span>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 dark:text-slate-300 font-medium">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>All 5 Years (Years 1 to 5)</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Unlimited PDF Watermarking</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Master Dossier PDF Pack</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Anti-Loophole Year Audit</span>
                  </li>
                </ul>
              </div>

              {/* Express Checkout Simulation */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  Express 1-Click Checkout
                </span>
                <div className="grid grid-cols-2 gap-2.5">
                  {/* Apple Pay Button */}
                  <button
                    type="button"
                    onClick={() => handleExpressPay('apple')}
                    className="btn bg-black hover:bg-neutral-900 text-white text-xs h-10 font-bold justify-center rounded-xl border border-black/30 shadow-xs flex items-center gap-1.5 transition-transform active:scale-[0.98]"
                    aria-label="Pay with Apple Pay"
                  >
                    <svg className="w-4 h-4 fill-current shrink-0 -mt-0.5" viewBox="0 0 170 170">
                      <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.6-7.77-11.7-14.2-5.88-9.13-10.33-19.5-13.35-31.1-3.03-11.6-4.54-22.37-4.54-32.32 0-14.57 3.75-26.66 11.25-36.26 7.5-9.6 16.9-14.52 28.2-14.76 5.43 0 11.3 1.41 17.6 4.23 6.3 2.82 10.23 4.3 11.8 4.43 1.83-.26 5.92-1.74 12.27-4.43 6.35-2.7 11.8-3.99 16.35-3.87 12.4.65 22.3 5.44 29.7 14.38-10.88 6.57-16.2 15.65-15.96 27.24.24 9.13 3.63 16.94 10.16 23.43 6.53 6.49 14.53 10.25 24 11.29-1.97 6.1-4.27 12.18-6.9 18.23zM119.22 31.95c0-7.2 2.6-14.1 7.8-20.7 5.2-6.6 11.8-10.75 19.8-12.45.65 6.64-1.28 13.52-5.8 20.65-4.52 7.13-10.87 11.6-19.05 13.4-.4-.3-.6-.6-.75-.9z" />
                    </svg>
                    <span className="text-[13px] font-semibold tracking-tight text-white">Pay</span>
                  </button>

                  {/* Google Pay Button */}
                  <button
                    type="button"
                    onClick={() => handleExpressPay('google')}
                    className="btn bg-white hover:bg-slate-50 text-slate-800 text-xs h-10 font-bold justify-center rounded-xl border border-slate-300 dark:border-white/20 shadow-xs flex items-center gap-1.5 transition-transform active:scale-[0.98]"
                    aria-label="Pay with Google Pay"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span className="text-[13px] font-semibold text-slate-800 tracking-tight">Pay</span>
                  </button>
                </div>
              </div>

              {/* Divider */}
              <div className="relative flex items-center justify-center">
                <div className="border-t border-slate-200 dark:border-white/10 w-full" />
                <span className="bg-white dark:bg-obsidian-900 px-2.5 text-[11px] font-mono text-slate-400 uppercase tracking-wider shrink-0">
                  Or pay with card
                </span>
                <div className="border-t border-slate-200 dark:border-white/10 w-full" />
              </div>

              {/* Credit Card Form (Stripe Elements Style) */}
              <form onSubmit={handlePay} className="space-y-3.5">
                {/* Cardholder Name */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Maria Silva"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className="input text-xs w-full font-medium"
                  />
                </div>

                {/* Card Number */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Card Number
                    </label>
                    <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                      {getCardBrand()}
                    </span>
                  </div>
                  <div className="relative">
                    <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="4242 4242 4242 4242"
                      value={cardNumber}
                      onChange={(e) => handleCardNumberChange(e.target.value)}
                      className="input pl-9 text-xs w-full font-mono font-medium tracking-wide"
                    />
                  </div>
                </div>

                {/* Expiry & CVC Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="MM / YY"
                      value={cardExpiry}
                      onChange={(e) => handleExpiryChange(e.target.value)}
                      className="input text-xs w-full font-mono font-medium text-center"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                        CVC / CVV
                      </label>
                      <span className="text-[10px] text-slate-400 font-mono">3 digits</span>
                    </div>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        maxLength={4}
                        placeholder="•••"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, ''))}
                        className="input pl-8 text-xs w-full font-mono font-medium text-center"
                      />
                    </div>
                  </div>
                </div>

                {/* Country / Billing Address */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Country or Region
                  </label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="input text-xs w-full bg-white dark:bg-obsidian-800 font-medium"
                  >
                    <option value="IE">Ireland 🇮🇪</option>
                    <option value="GB">United Kingdom 🇬🇧</option>
                    <option value="US">United States 🇺🇸</option>
                    <option value="IN">India 🇮🇳</option>
                    <option value="BR">Brazil 🇧🇷</option>
                    <option value="NG">Nigeria 🇳🇬</option>
                    <option value="OTHER">Other International</option>
                  </select>
                </div>

                {/* Pay Button */}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="btn btn-primary w-full h-11 text-sm font-bold shadow-lg shadow-emerald-700/25 mt-2 flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>Start CitizenScore Pro (€5.00 / mo)</span>
                </button>

                {/* Cancel Anytime Notice */}
                <p className="text-[11px] text-slate-500 text-center leading-relaxed">
                  Monthly recurring charge of €5.00. Cancel anytime with <strong>1 click in Account Settings</strong> without questions or fees.
                </p>

                {/* Stripe Trust Footer */}
                <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Guaranteed safe & secure 256-bit SSL encrypted checkout via Stripe</span>
                </div>
              </form>
            </>
          )}
        </div>

      </div>
    </div>
  );
};
