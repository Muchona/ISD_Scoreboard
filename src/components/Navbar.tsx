import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  Sun,
  Moon,
  Menu,
  X,
  User,
  LogOut,
  ChevronDown,
  Sparkles,
  Calendar,
  Lock,
} from 'lucide-react';
import { ThemeMode, UserProfile } from '../types';
import { LiquidNavbar, LiquidNavItem, NimbusIcons } from './LiquidNavbar';

interface NavbarProps {
  theme: ThemeMode;
  onToggleTheme: () => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  user: UserProfile | null;
  onOpenAuth: (mode?: 'signin' | 'signup') => void;
  onOpenSettings: () => void;
  onSignOut: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  theme,
  onToggleTheme,
  activeTab,
  onSelectTab,
  user,
  onOpenAuth,
  onOpenSettings,
  onSignOut,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Soft synthesized water droplet "plip" sound on toggle (matching Nimbus Liquid waterline)
  const playWaterPlip = () => {
    try {
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      if (!AC) return;
      const ctx = (audioCtxRef.current ||= new AC());
      const t = ctx.currentTime;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(theme === 'dark' ? 520 : 380, t);
      o.frequency.exponentialRampToValueAtTime(theme === 'dark' ? 950 : 1350, t + 0.08);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.15, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
      o.connect(g).connect(ctx.destination);
      o.start(t);
      o.stop(t + 0.17);
    } catch {}
  };

  const handleToggleTheme = () => {
    playWaterPlip();
    onToggleTheme();
  };

  // Dynamic navigation items based on auth status:
  // When logged in: Dashboard is available as the primary overview tab
  // When logged out: Home is the primary tab, and Dashboard is completely removed
  const navItems = useMemo<LiquidNavItem[]>(() => {
    const primaryItem: LiquidNavItem = user
      ? { id: 'dashboard', label: 'Dashboard', icon: NimbusIcons.home, fx: 'glow' }
      : { id: 'home', label: 'Home', icon: NimbusIcons.home, fx: 'glow' };

    return [
      primaryItem,
      { id: 'calculator', label: 'Days Clock', icon: NimbusIcons.calendar, fx: 'drop' },
      { id: 'vault', label: '150-pt Vault', icon: NimbusIcons.shield, fx: 'pop' },
      { id: 'watermark', label: 'Watermark', icon: NimbusIcons.lock, fx: 'wave' },
      { id: 'requirements', label: 'Rules', icon: NimbusIcons.globe, fx: 'spin' },
      { id: 'pricing', label: 'Pricing', icon: NimbusIcons.plane, fx: 'plane' },
    ];
  }, [user]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (userDropdownRef.current && !userDropdownRef.current.contains(target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const select = (id: string) => {
    onSelectTab(id);
    setMobileOpen(false);
    setUserDropdownOpen(false);
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  };

  // Compute active index for Nimbus WebGL Liquid Navbar
  const activeIndex = useMemo(() => {
    const idx = navItems.findIndex((it) => it.id === activeTab);
    return idx >= 0 ? idx : 0;
  }, [navItems, activeTab]);

  return (
    <div className="fixed top-0 inset-x-0 z-40 pointer-events-none transition-all">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 pt-2 sm:pt-3 w-full">
        <header className="pointer-events-auto relative flex h-14 sm:h-16 items-center justify-between gap-1.5 sm:gap-4 pl-3 sm:pl-6 pr-3 sm:pr-7 rounded-2xl border border-slate-200/80 bg-white/80 dark:border-white/[0.08] dark:bg-obsidian-900/80 backdrop-blur-2xl shadow-xl shadow-black/5 dark:shadow-2xl dark:shadow-black/40 ring-1 ring-slate-900/5 dark:ring-white/[0.05]">
        
        {/* Brand Logo */}
        <button
          onClick={() => select(user ? 'dashboard' : 'home')}
          className="flex items-center gap-2 sm:gap-2.5 rounded-lg text-left shrink-0 group focus:outline-hidden"
        >
          <span className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-sm shadow-emerald-700/30 group-hover:scale-105 transition-transform">
            <ShieldCheck className="h-4.5 w-4.5 sm:h-5 sm:w-5" strokeWidth={2.25} />
          </span>
          <span className="text-base sm:text-[17px] font-bold tracking-tight whitespace-nowrap">
            <span className="text-slate-900 dark:text-emerald-400 transition-colors">Citizen</span>
            <span className="text-slate-900 dark:text-white transition-colors">Score</span>
            <span className="text-emerald-600 dark:text-[#FF883E] transition-colors">.ie</span>
          </span>
        </button>

        {/* Center: True Nimbus WebGL Liquid Waterline Navbar */}
        <div className="hidden lg:flex items-center justify-center flex-1 px-2">
          <LiquidNavbar
            items={navItems}
            active={activeIndex}
            onChange={(_i, item) => {
              if (item.id) select(item.id);
            }}
            tone={theme === 'dark' ? 'dark' : 'light'}
            sound={true}
          />
        </div>

        {/* Right Action Suite (Theme Toggle + User Account Profile) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Liquid Water Bubble Theme Toggle */}
          <button
            onClick={handleToggleTheme}
            role="switch"
            aria-checked={theme === 'dark'}
            aria-label="Toggle theme mode"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="group relative inline-flex h-8 w-[62px] sm:w-[66px] shrink-0 items-center rounded-full p-1 transition-all duration-300 focus:outline-hidden border border-slate-300/80 dark:border-white/15 bg-slate-200/70 dark:bg-black/50 backdrop-blur-xl shadow-inner shadow-black/10 dark:shadow-black/60 hover:border-emerald-500/50 cursor-pointer"
          >
            {/* Ambient Water Meniscus Caustics */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-500/10 via-transparent to-emerald-500/10 pointer-events-none opacity-80" />

            {/* Static Subtle Track Markers */}
            <div className="absolute inset-0 flex items-center justify-between px-2.5 pointer-events-none opacity-35 group-hover:opacity-60 transition-opacity">
              <Sun className="h-3 w-3 text-amber-500" strokeWidth={2.5} />
              <Moon className="h-3 w-3 text-emerald-400" strokeWidth={2.5} />
            </div>

            {/* The Floating Liquid Water Droplet */}
            <span
              className={`relative z-10 flex h-6 w-6 items-center justify-center rounded-full transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] active:scale-90 ${
                theme === 'dark'
                  ? 'translate-x-[30px] sm:translate-x-[34px] bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600 shadow-[0_0_12px_rgba(16,185,129,0.65),inset_0_1px_2px_rgba(255,255,255,0.85),inset_0_-2px_4px_rgba(0,100,60,0.5)]'
                  : 'translate-x-0 bg-gradient-to-br from-white via-amber-50 to-amber-100 shadow-[0_4px_10px_rgba(0,0,0,0.18),inset_0_1px_2px_rgba(255,255,255,0.95),inset_0_-2px_3px_rgba(245,158,11,0.25)]'
              }`}
            >
              {/* Liquid Specular Glint Highlight */}
              <span className="absolute top-0.5 left-1 w-2 h-1 rounded-full bg-white/70 blur-[0.2px] pointer-events-none" />

              {/* Dynamic Droplet Icon */}
              {theme === 'dark' ? (
                <Moon className="h-3.5 w-3.5 text-emerald-950 fill-emerald-950/20 stroke-[2.5] transform transition-transform duration-300" />
              ) : (
                <Sun className="h-3.5 w-3.5 text-amber-600 fill-amber-500/25 stroke-[2.5] transform transition-transform duration-300" />
              )}
            </span>
          </button>

          {/* User Account Pill or Sign In Buttons */}
          {user ? (
            <div className="relative" ref={userDropdownRef}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-1.5 sm:gap-2 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-xl border border-slate-300/80 dark:border-white/10 bg-slate-100/80 dark:bg-white/5 hover:border-emerald-500 transition-all text-xs font-semibold shrink-0"
              >
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:inline text-slate-900 dark:text-white max-w-[80px] lg:max-w-[100px] truncate">
                  {user.name.split(' ')[0]}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </button>

              {/* User Dropdown Menu */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-60 rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white/95 dark:bg-obsidian-900/95 backdrop-blur-2xl p-2.5 shadow-2xl z-50 animate-in fade-in duration-150">
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-white/10">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {user.name}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-800/80">
                        {user.currentStamp || 'Stamp 4'}
                      </span>
                      <span className="chip chip-emerald text-[10px] font-bold">
                        {user.isPro ? 'Pro Member' : 'Free Trial'}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        Target: {user.targetYear || 2026}
                      </span>
                    </div>
                  </div>

                  <div className="py-1 space-y-0.5">
                    <button
                      onClick={() => select('dashboard')}
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-xl flex items-center gap-2"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Citizenship Dashboard</span>
                    </button>
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onOpenSettings();
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl flex items-center gap-2"
                    >
                      <User className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Edit Profile & Status</span>
                    </button>
                    <button
                      onClick={() => select('vault')}
                      className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl flex items-center gap-2"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>150-Point Scorecard</span>
                    </button>
                    <button
                      onClick={() => select('calculator')}
                      className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl flex items-center gap-2"
                    >
                      <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Reckonable Days Clock</span>
                    </button>
                  </div>

                  <div className="pt-1 border-t border-slate-100 dark:border-white/10">
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onSignOut();
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={() => onOpenAuth('signin')}
                className="btn btn-sm btn-ghost text-xs font-semibold whitespace-nowrap px-2.5 sm:px-3"
              >
                Sign in
              </button>
              <button
                onClick={() => onOpenAuth('signup')}
                className="btn btn-sm btn-primary text-xs font-bold shadow-sm shadow-emerald-700/20 whitespace-nowrap px-2.5 sm:px-3"
              >
                Create Account
              </button>
            </div>
          )}

          {/* Mobile Menu Hamburger Button */}
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="flex items-center justify-center p-2 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-white/20 transition-colors lg:hidden shrink-0 border border-slate-200/80 dark:border-white/10"
            aria-label="Open mobile navigation menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5 text-emerald-500" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <nav
          className="pointer-events-auto mt-2 rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white/95 dark:bg-obsidian-900/95 backdrop-blur-2xl p-4 lg:hidden shadow-2xl animate-in slide-in-from-top-2 duration-150 max-h-[80vh] overflow-y-auto"
          aria-label="Mobile Navigation"
        >
          <div className="flex flex-col gap-1.5">
            {user ? (
              <button
                onClick={() => select('dashboard')}
                className={`rounded-xl px-3 py-2.5 text-left text-sm font-semibold flex items-center justify-between ${
                  activeTab === 'dashboard'
                    ? 'bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
                    : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5'
                }`}
              >
                <span>Citizenship Dashboard</span>
                <Sparkles className="w-4 h-4 text-emerald-500" />
              </button>
            ) : (
              <button
                onClick={() => select('home')}
                className={`rounded-xl px-3 py-2.5 text-left text-sm font-semibold flex items-center justify-between ${
                  activeTab === 'home'
                    ? 'bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
                    : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5'
                }`}
              >
                <span>Home Overview</span>
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
              </button>
            )}

            <button
              onClick={() => select('calculator')}
              className={`rounded-xl px-3 py-2 text-left text-xs font-medium flex items-center justify-between ${
                activeTab === 'calculator'
                  ? 'bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
                  : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5'
              }`}
            >
              <span>🗓️ Days Calculator (1,825 Days)</span>
              <span className="font-mono text-[10px] text-emerald-600">ISD Ready</span>
            </button>

            <button
              onClick={() => select('vault')}
              className={`rounded-xl px-3 py-2 text-left text-xs font-medium flex items-center justify-between ${
                activeTab === 'vault'
                  ? 'bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
                  : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5'
              }`}
            >
              <span>🛡️ 150-Point Bento Vault</span>
              <span className="font-mono text-[10px] text-sky-600">Type A/B</span>
            </button>

            <button
              onClick={() => select('watermark')}
              className={`rounded-xl px-3 py-2 text-left text-xs font-medium flex items-center justify-between ${
                activeTab === 'watermark'
                  ? 'bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
                  : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5'
              }`}
            >
              <span>🔒 PDF Anti-Theft Watermarker</span>
              <span className="font-mono text-[10px] text-amber-600">Client-Side</span>
            </button>

            <button
              onClick={() => select('requirements')}
              className={`rounded-xl px-3 py-2 text-left text-xs font-medium ${
                activeTab === 'requirements'
                  ? 'bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
                  : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5'
              }`}
            >
              Official Rules & Guidance
            </button>

            <button
              onClick={() => select('pricing')}
              className={`rounded-xl px-3 py-2 text-left text-xs font-medium ${
                activeTab === 'pricing'
                  ? 'bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
                  : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5'
              }`}
            >
              Pricing & Pro Upgrade
            </button>

            {!user && (
              <div className="pt-3 mt-2 border-t border-slate-200 dark:border-white/10 flex flex-col gap-2">
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    onOpenAuth('signin');
                  }}
                  className="btn btn-sm btn-secondary w-full text-xs font-semibold"
                >
                  Sign in
                </button>
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    onOpenAuth('signup');
                  }}
                  className="btn btn-sm btn-primary w-full text-xs font-bold"
                >
                  Create Account
                </button>
              </div>
            )}
          </div>
        </nav>
      )}
      </div>
    </div>
  );
};
