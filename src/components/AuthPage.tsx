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
  FileCheck,
  Globe,
  Clock,
  KeyRound,
  Check,
} from 'lucide-react';
import { UserProfile } from '../types';
import { supabase, mapSupabaseUserToProfile } from '../lib/supabase';

interface AuthPageProps {
  initialMode?: 'signin' | 'signup';
  onLoginSuccess: (user: UserProfile) => void;
  onNavigateHome: () => void;
  onOpenPrivacy?: () => void;
  onOpenTerms?: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  initialMode = 'signup',
  onLoginSuccess,
  onNavigateHome,
  onOpenPrivacy,
  onOpenTerms,
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [forgotPasswordSent, setForgotPasswordSent] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  useEffect(() => {
    setMode(initialMode);
    setShowForgotPassword(false);
    setErrorMessage(null);
  }, [initialMode]);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [currentStamp, setCurrentStamp] = useState('Stamp 4');
  const [targetYear, setTargetYear] = useState<number>(new Date().getFullYear());
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
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
    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: window.location.href.split('#')[0],
            data: {
              full_name: fullName.trim(),
              current_stamp: currentStamp,
              target_year: targetYear,
              is_pro: false,
            },
          },
        });
        if (error) {
          setErrorMessage(error.message);
          return;
        }
        if (data.user && data.session) {
          onLoginSuccess(mapSupabaseUserToProfile(data.user));
        } else {
          setErrorMessage('Account created! Please check your email to confirm your address, then sign in.');
          setMode('signin');
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) {
          setErrorMessage(error.message);
          return;
        }
        if (data.user) {
          onLoginSuccess(mapSupabaseUserToProfile(data.user));
        }
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: 'google' | 'apple') => {
    setErrorMessage(null);
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.href.split('#')[0],
        },
      });
      if (error) {
        setErrorMessage(error.message);
        setIsLoading(false);
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'OAuth sign-in failed.');
      setIsLoading(false);
    }
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
    }, 450);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!email) {
      setErrorMessage('Please enter your email to receive a recovery link.');
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: window.location.href.split('#')[0],
      });
      if (error) {
        setErrorMessage(error.message);
        return;
      }
      setForgotPasswordSent(true);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Could not send recovery email.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="py-6 sm:py-10 max-w-5xl mx-auto">
      {/* Top Breadcrumb / Return */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={onNavigateHome}
          className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1.5 transition-colors"
        >
          <span>← Return to Home</span>
        </button>

        <span className="chip chip-emerald text-[11px] font-bold">
          Official Form 8 Naturalisation Companion
        </span>
      </div>

      <div className="card p-0 shadow-2xl overflow-hidden border border-slate-300 dark:border-white/10 grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
        {/* Left Side: Rich Civic Benefits Panel */}
        <div className="lg:col-span-5 p-8 bg-gradient-to-br from-slate-900 via-obsidian-900 to-slate-950 text-white border-b lg:border-b-0 lg:border-r border-white/10 relative overflow-hidden flex flex-col justify-between space-y-8">
          {/* Subtle Irish Emerald and Orange Glow Spots */}
          <div className="absolute -top-16 -left-16 w-48 h-48 bg-emerald-500/25 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-[#FF883E]/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-md shadow-emerald-700/30">
                <ShieldCheck className="h-6 w-6" strokeWidth={2.25} />
              </span>
              <div>
                <span className="text-xl font-black tracking-tight text-white">
                  CitizenScore<span className="text-emerald-400">.ie</span>
                </span>
                <span className="block text-[11px] font-mono text-emerald-400">
                  Secure Naturalisation Vault
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-white tracking-tight leading-snug">
                Your pathway to an approved Irish citizenship application.
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed font-normal">
                Avoid the stress of missing points and miscalculated absences. Store your proof documents securely in client-side watermarked vaults.
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">1,825-Day Continuous Residence</h4>
                  <p className="text-[11px] text-slate-400">Automated Section 15C 70-day absence auditing across Stamp 1 & Stamp 4.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <FileCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">150-Point Scorecard Verification</h4>
                  <p className="text-[11px] text-slate-400">Exact Type A (100 pts) and Type B (50 pts) tracking for all 5 continuous years.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#FF883E]/20 text-[#FF883E] flex items-center justify-center shrink-0 mt-0.5">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Anti-Theft PDF Watermarking</h4>
                  <p className="text-[11px] text-slate-400">Stamped with your legal name and submission year directly in your browser.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Security Callout */}
          <div className="relative z-10 pt-4 border-t border-white/10 space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>EU Sovereign • Bank Grade 256-Bit</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              CitizenScore adheres strictly to GDPR Article 9 privacy protections. Your immigration papers remain exclusively encrypted in your private vault.
            </p>
          </div>
        </div>

        {/* Right Side: Interactive Login / Sign Up Form */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between bg-white dark:bg-obsidian-900">
          <div>
            {/* Tab Switcher */}
            <div className="flex items-center justify-between pb-6 border-b border-slate-200 dark:border-white/10">
              <div className="flex rounded-xl p-1 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setShowForgotPassword(false);
                    setErrorMessage(null);
                  }}
                  className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${
                    mode === 'signup' && !showForgotPassword
                      ? 'bg-white dark:bg-emerald-600 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
                  }`}
                >
                  Create Account
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setShowForgotPassword(false);
                    setErrorMessage(null);
                  }}
                  className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${
                    mode === 'signin' && !showForgotPassword
                      ? 'bg-white dark:bg-emerald-600 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
                  }`}
                >
                  Sign In
                </button>
              </div>

              <span className="text-xs font-mono text-slate-500">
                {mode === 'signup' ? 'Step 1 of 2' : 'Returning User'}
              </span>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="my-4 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 text-red-900 dark:text-red-200 text-xs">
                {errorMessage}
              </div>
            )}

            {/* Forgot Password Sub-View */}
            {showForgotPassword ? (
              <div className="space-y-4 py-4 animate-in fade-in">
                <div className="space-y-1">
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                    Reset your Vault Password
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Enter your email address and we will dispatch a one-time cryptographic recovery link to your inbox.
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
                  <form onSubmit={handleForgotPassword} className="space-y-3 pt-2">
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
              /* Main Form */
              <div className="space-y-5 pt-4">
                <div className="space-y-1">
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    {mode === 'signup'
                      ? 'Create Your Naturalisation Account'
                      : 'Sign In to Your Naturalisation Vault'}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {mode === 'signup'
                      ? 'Join thousands of applicants securing their Irish citizenship submissions with precision.'
                      : 'Access your continuous reckonable days, scorecard, and watermarked document repository.'}
                  </p>
                </div>

                {/* Social Login Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleOAuthSignIn('google')}
                    disabled={isLoading}
                    className="btn btn-secondary text-xs h-10 justify-center font-semibold"
                  >
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
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
                    onClick={() => handleOAuthSignIn('apple')}
                    disabled={isLoading}
                    className="btn btn-secondary text-xs h-10 justify-center font-semibold"
                  >
                    <svg className="w-4 h-4 mr-2 fill-current" viewBox="0 0 24 24">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.75 1.04-1.8 1.01-2.87-.92.04-2.02.62-2.66 1.37-.56.65-1.06 1.71-.93 2.74 1.04.08 2.07-.54 2.58-1.24z" />
                    </svg>
                    <span>Apple</span>
                  </button>
                </div>

                <div className="relative flex items-center justify-center my-3">
                  <div className="border-t border-slate-200 dark:border-white/10 w-full" />
                  <span className="bg-white dark:bg-obsidian-900 px-3 text-[11px] font-mono text-slate-400 uppercase tracking-wider shrink-0">
                    or continue with email
                  </span>
                  <div className="border-t border-slate-200 dark:border-white/10 w-full" />
                </div>

                {/* Form Fields */}
                <form onSubmit={handleSubmit} className="space-y-3.5">
                  {mode === 'signup' && (
                    <>
                      {/* Legal Name */}
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                          Full Legal Name <span className="text-slate-400 font-normal">(as on Irish IRP card / Passport)</span>
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

                      {/* Current Stamp Status & Planned Target Year */}
                      <div className="grid grid-cols-2 gap-3">
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

                  {/* Email */}
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

                  {/* Password */}
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

                    {/* Password Strength Meter */}
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

                {/* 1-Click Test Demo Fill */}
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
          <div className="pt-6 mt-6 border-t border-slate-200 dark:border-white/10 text-center">
            <p className="text-[11px] text-slate-500">
              Not affiliated with the Irish Department of Justice. Calibrated strictly to official Form 8 requirements.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
