import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Mail,
  Lock,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  Sparkles,
  X,
  FileCheck,
  Globe,
  Clock,
  KeyRound,
} from 'lucide-react';
import { UserProfile } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
  onLoginSuccess: (user: UserProfile) => void;
  onOpenPrivacy?: () => void;
  onOpenTerms?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'signin',
  onLoginSuccess,
  onOpenPrivacy,
  onOpenTerms,
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [forgotPasswordSent, setForgotPasswordSent] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  // Synchronize mode whenever the modal opens or initialMode changes from the navbar
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setShowForgotPassword(false);
      setErrorMessage(null);
    }
  }, [isOpen, initialMode]);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [currentStamp, setCurrentStamp] = useState('Stamp 4');
  const [targetYear, setTargetYear] = useState<number>(new Date().getFullYear());
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Calculate Password Strength (0 to 4)
  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const passStrength = getPasswordStrength(password);
  const strengthLabels = ['Too short', 'Weak', 'Fair', 'Good', 'Strong & Secure'];
  const strengthColors = [
    'bg-slate-300 dark:bg-white/20',
    'bg-red-500',
    'bg-amber-500',
    'bg-blue-500',
    'bg-emerald-500',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    if (mode === 'signup') {
      if (!fullName.trim()) {
        setErrorMessage('Please enter your full legal name as it appears on your passport.');
        return;
      }
      if (password.length < 6) {
        setErrorMessage('Password must be at least 6 characters long.');
        return;
      }
      if (!agreedTerms) {
        setErrorMessage('Please agree to the privacy policy and terms of service.');
        return;
      }
    }

    setIsLoading(true);

    // Simulate swift network verification
    setTimeout(() => {
      setIsLoading(false);
      const user: UserProfile = {
        id: `user-${Date.now()}`,
        name: mode === 'signup' ? fullName : email.split('@')[0],
        email: email,
        currentStamp: currentStamp,
        targetYear: targetYear,
        isPro: false,
      };
      onLoginSuccess(user);
      onClose();
    }, 600);
  };

  const handleDemoSignIn = (role: 'applicant' | 'pro') => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const user: UserProfile = {
        id: 'demo-user-1',
        name: role === 'pro' ? 'Dr. Sean Kelly' : 'Eoin O’Connor',
        email: role === 'pro' ? 'sean.kelly@ireland.ie' : 'eoin.oconnor@gmail.com',
        currentStamp: 'Stamp 4',
        targetYear: 2026,
        isPro: role === 'pro',
      };
      onLoginSuccess(user);
      onClose();
    }, 450);
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMessage('Please enter your email to receive a recovery link.');
      return;
    }
    setForgotPasswordSent(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative card max-w-2xl w-full p-0 shadow-2xl overflow-hidden border border-slate-300 dark:border-white/10 grid grid-cols-1 md:grid-cols-12 max-h-[92vh]">
        
        {/* Left Side: Irish Tricolour Trust Panel (Desktop Only) */}
        <div className="hidden md:flex md:col-span-5 flex-col justify-between p-6 bg-gradient-to-b from-slate-900 via-obsidian-900 to-slate-950 text-white border-r border-white/10 relative overflow-hidden">
          {/* Subtle Irish Emerald and Orange Glow Spots */}
          <div className="absolute -top-12 -left-12 w-36 h-36 bg-emerald-500/25 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -right-12 w-36 h-36 bg-[#FF883E]/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-sm shadow-emerald-700/30">
                <ShieldCheck className="h-5 w-5" strokeWidth={2.25} />
              </span>
              <span className="text-lg font-black tracking-tight">
                CitizenScore<span className="text-emerald-400">.ie</span>
              </span>
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-white leading-snug">
                Your Secure Naturalisation Vault
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed font-normal">
                Department of Justice Form 8 compliance suite for Irish citizenship.
              </p>
            </div>

            {/* Value checklist */}
            <ul className="space-y-3 pt-2 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Sync your 1,825-day reckonable clock safely</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>150-Point Scorecard for all 5 continuous years</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Client-side PDF watermarking (Never shared)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>1-Click ZIP submission dossier packaging</span>
              </li>
            </ul>
          </div>

          <div className="relative z-10 pt-4 border-t border-white/10 space-y-1.5">
            <div className="flex items-center gap-2 text-[11px] font-mono text-emerald-400 font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>EU Data Sovereign</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              Protected by bank-grade client-side encryption. Stored exclusively within the European Union.
            </p>
          </div>
        </div>

        {/* Right Side: Authentication Form */}
        <div className="md:col-span-7 p-6 sm:p-7 flex flex-col justify-between overflow-y-auto max-h-[92vh] bg-white dark:bg-obsidian-900">
          <div>
            {/* Top Close Button & Mode Switcher */}
            <div className="flex items-center justify-between pb-4">
              {/* Tab Switcher Pills */}
              <div className="flex rounded-xl p-1 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setShowForgotPassword(false);
                    setErrorMessage(null);
                  }}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    mode === 'signin' && !showForgotPassword
                      ? 'bg-white dark:bg-emerald-600 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setShowForgotPassword(false);
                    setErrorMessage(null);
                  }}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    mode === 'signup' && !showForgotPassword
                      ? 'bg-white dark:bg-emerald-600 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
                  }`}
                >
                  Create Account
                </button>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors"
                title="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 text-red-900 dark:text-red-200 text-xs">
                {errorMessage}
              </div>
            )}

            {/* Forgot Password View */}
            {showForgotPassword ? (
              <div className="space-y-4 py-2 animate-in fade-in">
                <div className="space-y-1">
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                    Reset your Vault Password
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Enter your email address and we will send you a secure link to reset your account password.
                  </p>
                </div>

                {forgotPasswordSent ? (
                  <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/60 text-emerald-900 dark:text-emerald-200 text-xs space-y-2">
                    <p className="font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Recovery link sent!
                    </p>
                    <p className="text-[11px] text-emerald-800 dark:text-emerald-300">
                      If an account exists for <strong>{email}</strong>, you will receive password reset instructions in your inbox shortly.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setShowForgotPassword(false);
                        setForgotPasswordSent(false);
                      }}
                      className="btn btn-sm btn-secondary w-full mt-2 text-xs"
                    >
                      Back to Sign In
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleForgotPassword} className="space-y-3">
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
                          placeholder="e.g. applicant@ireland.ie"
                          className="input pl-9 text-xs w-full"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="btn btn-primary w-full text-xs font-bold h-10"
                    >
                      <span>Send Recovery Link</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(false)}
                      className="w-full text-center text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium pt-1"
                    >
                      Cancel and return to Sign In
                    </button>
                  </form>
                )}
              </div>
            ) : (
              /* Normal Sign In / Sign Up View */
              <div className="space-y-4">
                {/* Header Text */}
                <div className="space-y-1">
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    {mode === 'signin'
                      ? 'Welcome Back to CitizenScore'
                      : 'Create Your Naturalisation Account'}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {mode === 'signin'
                      ? 'Access your saved reckonable days, scorecard, and watermarked records.'
                      : 'Track your 150 points and 1,825 continuous days with complete privacy.'}
                  </p>
                </div>

                {/* Social Login Buttons */}
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleDemoSignIn('applicant')}
                    className="btn btn-secondary text-xs h-9 justify-center font-semibold"
                  >
                    <svg className="w-4 h-4 mr-1.5" viewBox="0 0 24 24">
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
                    <span>Google</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDemoSignIn('pro')}
                    className="btn btn-secondary text-xs h-9 justify-center font-semibold"
                  >
                    <svg className="w-4 h-4 mr-1.5 fill-current" viewBox="0 0 24 24">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.75 1.04-1.8 1.01-2.87-.92.04-2.02.62-2.66 1.37-.56.65-1.06 1.71-.93 2.74 1.04.08 2.07-.54 2.58-1.24z" />
                    </svg>
                    <span>Apple</span>
                  </button>
                </div>

                <div className="relative flex items-center justify-center">
                  <div className="border-t border-slate-200 dark:border-white/10 w-full" />
                  <span className="bg-white dark:bg-obsidian-900 px-2 text-[11px] font-mono text-slate-400 uppercase tracking-wider shrink-0">
                    or continue with email
                  </span>
                  <div className="border-t border-slate-200 dark:border-white/10 w-full" />
                </div>

                {/* Authentication Form */}
                <form onSubmit={handleSubmit} className="space-y-3">
                  {mode === 'signup' && (
                    <>
                      {/* Full Name */}
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                          Full Legal Name <span className="text-slate-400 font-normal">(as on Irish IRP / Passport)</span>
                        </label>
                        <div className="relative">
                          <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            required
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="e.g. Eoin O’Connor"
                            className="input pl-9 text-xs w-full"
                          />
                        </div>
                      </div>

                      {/* Current Irish Residency Stamp & Planned Year */}
                      <div className="grid grid-cols-2 gap-2">
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
                            <option value={2026}>2026 (Current)</option>
                            <option value={2025}>2025</option>
                            <option value={2027}>2027</option>
                          </select>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Email Field */}
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
                        placeholder="you@domain.com"
                        className="input pl-9 text-xs w-full"
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                        Password
                      </label>
                      {mode === 'signin' && (
                        <button
                          type="button"
                          onClick={() => setShowForgotPassword(true)}
                          className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
                        >
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="input pl-9 pr-9 text-xs w-full font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Live Password Strength Meter (Sign Up Only) */}
                    {mode === 'signup' && password.length > 0 && (
                      <div className="pt-1 space-y-1 animate-in fade-in">
                        <div className="flex gap-1 h-1.5 w-full">
                          {[1, 2, 3, 4].map((step) => (
                            <div
                              key={step}
                              className={`h-full flex-1 rounded-full transition-colors ${
                                passStrength >= step
                                  ? strengthColors[passStrength]
                                  : 'bg-slate-200 dark:bg-white/10'
                              }`}
                            />
                          ))}
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono">
                          <span>Security:</span>
                          <span className="font-bold text-slate-700 dark:text-slate-300">
                            {strengthLabels[passStrength]}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Checkbox Options */}
                  {mode === 'signin' ? (
                    <div className="flex items-center justify-between pt-1 text-xs">
                      <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span>Remember me on this browser</span>
                      </label>
                    </div>
                  ) : (
                    <div className="pt-1">
                      <label className="flex items-start gap-2 cursor-pointer text-[11px] text-slate-600 dark:text-slate-400 leading-tight">
                        <input
                          type="checkbox"
                          checked={agreedTerms}
                          onChange={(e) => setAgreedTerms(e.target.checked)}
                          className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 mt-0.5"
                        />
                        <span>
                          I agree to CitizenScore’s{' '}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (onOpenPrivacy) onOpenPrivacy();
                            }}
                            className="text-emerald-600 dark:text-emerald-400 underline font-semibold hover:text-emerald-700"
                          >
                            Privacy Directives (GDPR)
                          </button>{' '}
                          and{' '}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (onOpenTerms) onOpenTerms();
                            }}
                            className="text-emerald-600 dark:text-emerald-400 underline font-semibold hover:text-emerald-700"
                          >
                            Terms of Service
                          </button>
                          .
                        </span>
                      </label>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn btn-primary w-full h-11 text-xs font-bold shadow-md shadow-emerald-700/20 mt-2"
                  >
                    {isLoading ? (
                      <span className="animate-pulse">Securing session...</span>
                    ) : (
                      <>
                        <span>{mode === 'signin' ? 'Sign In to Vault' : 'Create Naturalisation Vault'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                {/* Quick 1-Click Demo Fill for Pair Programming Review */}
                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => handleDemoSignIn('applicant')}
                    className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
                  >
                    ⚡ One-Click Instant Sign In (Test Account)
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer Civic Notice */}
          <div className="pt-4 mt-4 border-t border-slate-200 dark:border-white/10 text-center">
            <p className="text-[11px] text-slate-500">
              Not affiliated with the Irish Department of Justice. Calibrated strictly to official Form 8 requirements.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
