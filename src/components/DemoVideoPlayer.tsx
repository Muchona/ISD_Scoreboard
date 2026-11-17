import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  CheckCircle2,
  ShieldCheck,
  FileCheck,
  Calendar,
  Lock,
  ArrowRight,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Mic,
} from 'lucide-react';

interface DemoVideoPlayerProps {
  onNavigate: (tab: string) => void;
  onClose: () => void;
}

export const DemoVideoPlayer: React.FC<DemoVideoPlayerProps> = ({ onNavigate, onClose }) => {
  // Video Simulation State
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentSeconds, setCurrentSeconds] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [videoMode, setVideoMode] = useState<'simulator' | 'official'>('simulator');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const TOTAL_DURATION = 60; // 60 seconds total

  // Handle Play / Pause audio sync
  useEffect(() => {
    if (!audioRef.current) return;

    if (isPlaying && videoMode === 'simulator') {
      audioRef.current.play().catch(() => {
        // Autoplay may be restricted without user interaction
        setIsPlaying(false);
      });
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, videoMode]);

  // Handle Mute state sync
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Fallback timer if audio fails to load or in silent mode
  useEffect(() => {
    let interval: number | null = null;
    if (isPlaying && videoMode === 'simulator') {
      interval = window.setInterval(() => {
        if (!audioRef.current || audioRef.current.paused) {
          setCurrentSeconds((prev) => {
            if (prev >= TOTAL_DURATION) {
              setIsPlaying(false);
              return TOTAL_DURATION;
            }
            return prev + 1;
          });
        }
      }, 1000);
    }
    return () => {
      if (interval !== null) clearInterval(interval);
    };
  }, [isPlaying, videoMode]);

  const handleAudioTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentSeconds(Math.floor(audioRef.current.currentTime));
    }
  };

  // Determine current scene (0-20s: Days, 20-40s: Scorecard, 40-60s: Watermark)
  const currentScene =
    currentSeconds < 20 ? 1 : currentSeconds < 40 ? 2 : 3;

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    const targetSecond = Math.round(percentage * TOTAL_DURATION);
    setCurrentSeconds(targetSecond);
    if (audioRef.current) {
      audioRef.current.currentTime = targetSecond;
    }
  };

  const handleRestart = () => {
    setCurrentSeconds(0);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
    setIsPlaying(true);
  };

  const handleSkipChapter = (targetSec: number) => {
    const clamped = Math.max(0, Math.min(TOTAL_DURATION, targetSec));
    setCurrentSeconds(clamped);
    if (audioRef.current) {
      audioRef.current.currentTime = clamped;
    }
  };

  const handleToggleFullscreen = () => {
    if (!playerContainerRef.current) return;
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen().catch((err) => {
        console.error('Fullscreen request failed:', err);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div
      ref={playerContainerRef}
      className="relative flex flex-col w-full bg-white dark:bg-slate-950 rounded-2xl overflow-hidden shadow-2xl border border-slate-200/90 dark:border-slate-800 text-slate-900 dark:text-white select-none transition-colors"
    >
      {/* Hidden Native Audio Element */}
      <audio
        ref={audioRef}
        src="/audio/citizenscore_voiceover.mp3"
        preload="auto"
        onTimeUpdate={handleAudioTimeUpdate}
        onEnded={() => {
          setIsPlaying(false);
          setCurrentSeconds(TOTAL_DURATION);
        }}
      />

      {/* Top Media Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-3 sm:px-4 py-2.5 bg-slate-100/90 dark:bg-slate-900/95 border-b border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 transition-colors">
        <div className="flex items-center justify-between sm:justify-start gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <span className="font-mono text-[11px] sm:text-xs font-semibold tracking-wider text-slate-700 dark:text-slate-300 whitespace-nowrap">
              CITIZEN-SCORE DEMO • 1080P 60FPS
            </span>
          </div>

          {/* Voiceover Active Badge & Soundwave */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100/80 dark:bg-emerald-950/80 border border-emerald-500/30 text-[11px] text-emerald-800 dark:text-emerald-300 font-medium">
            <Mic className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            <span>Seán (Irish Commercial Narrator)</span>
            {isPlaying && !isMuted && (
              <div className="flex items-end gap-0.5 h-3 ml-1">
                <span className="w-0.5 bg-emerald-600 dark:bg-emerald-400 h-2 animate-pulse" />
                <span className="w-0.5 bg-emerald-600 dark:bg-emerald-400 h-3 animate-ping" />
                <span className="w-0.5 bg-emerald-600 dark:bg-emerald-400 h-1.5 animate-pulse" />
              </div>
            )}
          </div>
        </div>

        {/* Mode Switcher */}
        <div className="grid grid-cols-2 sm:flex items-center gap-1 rounded-lg bg-slate-200/80 dark:bg-slate-800/80 p-0.5 border border-slate-300/70 dark:border-slate-700/60">
          <button
            onClick={() => {
              setVideoMode('simulator');
              setIsPlaying(true);
            }}
            className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors text-center ${
              videoMode === 'simulator'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            Product Walkthrough
          </button>
          <button
            onClick={() => {
              setVideoMode('official');
              setIsPlaying(false);
            }}
            className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors text-center ${
              videoMode === 'official'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            Official ISD Stream
          </button>
        </div>
      </div>

      {/* Main Video Viewport */}
      <div className="relative min-h-[270px] sm:aspect-video w-full bg-gradient-to-b from-slate-50 via-slate-100/70 to-slate-200/50 dark:from-slate-900 dark:via-slate-950 dark:to-black overflow-hidden flex items-center justify-center transition-colors">
        {videoMode === 'official' ? (
          // Official Irish Citizenship Video Stream / Tutorial
          <div className="w-full h-full relative flex flex-col items-center justify-center bg-slate-950">
            <iframe
              className="w-full h-full border-0"
              src="https://www.youtube-nocookie.com/embed/fD3X-H46G8M?autoplay=1&mute=0&rel=0&modestbranding=1"
              title="Official Irish Citizenship Naturalisation Overview"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          // Interactive 60-Second Software Simulator
          <div className="w-full h-full relative p-4 sm:p-8 flex flex-col justify-between">
            {/* Background dynamic ambient glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(16,185,129,0.15),transparent_70%)] pointer-events-none" />

            {/* Scene Header Watermark */}
            <div className="relative z-10 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="font-mono text-emerald-800 dark:text-emerald-400 font-bold bg-emerald-100/90 dark:bg-emerald-950/80 border border-emerald-500/30 px-2 py-0.5 rounded">
                  CHAPTER {currentScene}/3
                </span>
                <span className="text-slate-700 dark:text-slate-300 font-medium">
                  {currentScene === 1 && 'Reckonable Days & Statutory Lookback Windows'}
                  {currentScene === 2 && '150-Point Form 8 Scorecard & Gap Diagnostics'}
                  {currentScene === 3 && 'Automated PDF Anti-Theft Watermarking'}
                </span>
              </div>
              <span className="font-mono text-slate-500 dark:text-slate-400 text-[11px]">
                {formatTime(currentSeconds)} / 1:00
              </span>
            </div>

            {/* SCENE 1: DAYS CALCULATOR (0s - 20s) */}
            {currentScene === 1 && (
              <div className="relative z-10 my-auto max-w-xl mx-auto w-full space-y-4 animate-in fade-in duration-300">
                <div className="rounded-xl border border-slate-200/90 dark:border-slate-700/80 bg-white/95 dark:bg-slate-900/90 backdrop-blur-md p-5 shadow-xl space-y-3 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-300 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      Statutory Period Analysis (2021 → 2026)
                    </span>
                    <span className="font-mono text-[11px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30">
                      Stamp 1 + Stamp 4
                    </span>
                  </div>

                  {/* Day Ticker Animation */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs text-slate-500 dark:text-slate-400">Total Reckonable Residence</span>
                      <span className="font-mono font-extrabold text-2xl text-emerald-600 dark:text-emerald-400">
                        {Math.min(1825, Math.floor((currentSeconds / 18) * 1825))} / 1,825 Days
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-600 dark:bg-emerald-500 h-full rounded-full transition-all duration-300 shadow-[0_0_12px_rgba(16,185,129,0.5)]"
                        style={{ width: `${Math.min(100, (currentSeconds / 18) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Section 15C Continuous Year Box */}
                  <div className="rounded-lg bg-slate-50 dark:bg-slate-950/80 p-3 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs transition-colors">
                    <div>
                      <div className="font-semibold text-slate-800 dark:text-slate-200">Section 15C Final Continuous Year</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">14 Days Absent out of 70 Allowed</div>
                    </div>
                    <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-500/30 px-2 py-1 rounded">
                      ✓ COMPLIANT
                    </span>
                  </div>
                </div>

                <div className="text-center text-xs text-slate-500 dark:text-slate-400">
                  Automatically calculates 9-year lookback windows & excludes non-reckonable Stamp 2 time
                </div>
              </div>
            )}

            {/* SCENE 2: 150-PT SCORECARD (20s - 40s) */}
            {currentScene === 2 && (
              <div className="relative z-10 my-auto max-w-xl mx-auto w-full space-y-4 animate-in fade-in duration-300">
                <div className="rounded-xl border border-slate-200/90 dark:border-slate-700/80 bg-white/95 dark:bg-slate-900/90 backdrop-blur-md p-5 shadow-xl space-y-4 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-300 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      Form 8 Rule: 150 Points per Year + Identity
                    </span>
                    <span className="font-mono text-[11px] text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded border border-blue-500/30">
                      Official ISD Schedule
                    </span>
                  </div>

                  {/* Scorecard Items Grid */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950/80 border border-emerald-500/30 dark:border-emerald-500/40">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-900 dark:text-slate-200">Valid Passport</span>
                        <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">150 pts</span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">Satisfies Identity Requirement</div>
                      <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 font-semibold">✓ Proven Once</div>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950/80 border border-emerald-500/30 dark:border-emerald-500/40">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-900 dark:text-slate-200">Revenue EDS</span>
                        <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">100 pts</span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">Type A Residency Proof</div>
                      <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 font-semibold">✓ Revenue Ireland</div>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950/80 border border-emerald-500/30 dark:border-emerald-500/40">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-900 dark:text-slate-200">Electricity Bill</span>
                        <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">50 pts</span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">Type B Residency Proof</div>
                      <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 font-semibold">✓ Electric Ireland</div>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950/80 border border-emerald-500/30 dark:border-emerald-500/40 flex flex-col justify-between">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-900 dark:text-slate-200">Year Total</span>
                        <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold text-sm">150 / 150</span>
                      </div>
                      <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                        ✓ Type A + Type B Met
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-center text-xs text-slate-500 dark:text-slate-400">
                  Prevents caseworker rejection: Form 8 strictly mandates 1 Type A + 1 Type B each year
                </div>
              </div>
            )}

            {/* SCENE 3: PDF WATERMARKER (40s - 60s) */}
            {currentScene === 3 && (
              <div className="relative z-10 my-auto max-w-xl mx-auto w-full space-y-4 animate-in fade-in duration-300">
                <div className="rounded-xl border border-slate-200/90 dark:border-slate-700/80 bg-white/95 dark:bg-slate-900/90 backdrop-blur-md p-5 shadow-xl space-y-3 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-300 flex items-center gap-1.5">
                      <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      Client-Side Anti-Theft Watermarking
                    </span>
                    <span className="font-mono text-[11px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30">
                      100% In-Browser Memory
                    </span>
                  </div>

                  {/* Watermarked Document Preview */}
                  <div className="relative rounded-lg bg-slate-50 dark:bg-slate-950 p-4 border border-slate-200 dark:border-slate-800 text-xs overflow-hidden shadow-xs">
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 opacity-35">
                      <span className="transform -rotate-25 font-mono font-bold text-emerald-700 dark:text-emerald-300 text-xs tracking-widest border-y border-dashed border-emerald-500 py-1 px-4 whitespace-nowrap">
                        FOR ISD CITIZENSHIP ONLY • CITIZEN-7892
                      </span>
                    </div>

                    <div className="space-y-1.5 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                      <div className="font-bold text-slate-900 dark:text-white">Revenue Commissioners — Employment Detail Summary</div>
                      <div>Applicant: Maria Silva • PPSN: 7892***A • Tax Year: 2024</div>
                      <div className="text-emerald-600 dark:text-emerald-400 font-semibold">✓ Official ISD Caseworker Approved Stamp</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-slate-500 dark:text-slate-400">Documents never leave your local device</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-mono font-semibold">Multi-Page PDF Ready</span>
                  </div>
                </div>

                <div className="text-center text-xs text-slate-500 dark:text-slate-400">
                  Protects bank statements and Revenue summaries against fraud and identity theft
                </div>
              </div>
            )}

            {/* End of Demo Overlay (when video reaches 60s) */}
            {currentSeconds >= TOTAL_DURATION && (
              <div className="absolute inset-0 z-20 bg-white/95 dark:bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-4 animate-in fade-in transition-colors">
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white">
                  Ready to Start Your Citizenship Journey?
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 max-w-sm">
                  Use the 100% free reckonable days clock, or build your complete 150-point application dossier.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      onClose();
                      onNavigate('calculator');
                    }}
                    className="btn btn-primary btn-sm"
                  >
                    <span>Launch Days Calculator</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handleRestart}
                    className="btn btn-secondary btn-sm"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Replay Demo</span>
                  </button>
                </div>
              </div>
            )}

            {/* Bottom Overlay Info */}
            <div className="relative z-10 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Calibrated to 2025/2026 Department of Justice Naturalisation Rules
              </span>
              <span>Irish Naturalisation (Form 8)</span>
            </div>
          </div>
        )}
      </div>

      {/* Video Scrubber & Playback Controls */}
      <div className="p-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 space-y-2 transition-colors">
        {/* Progress Bar (Clickable Scrubber) */}
        <div
          onClick={handleSeek}
          className="relative w-full h-2 bg-slate-200 dark:bg-slate-800 hover:h-2.5 rounded-full cursor-pointer transition-all group overflow-hidden"
          title="Click to jump to point in video"
        >
          {/* Chapter Markers */}
          <div className="absolute left-[33.3%] top-0 bottom-0 w-0.5 bg-slate-400 dark:bg-slate-600 z-10 pointer-events-none" />
          <div className="absolute left-[66.6%] top-0 bottom-0 w-0.5 bg-slate-400 dark:bg-slate-600 z-10 pointer-events-none" />

          {/* Filled Progress */}
          <div
            className="h-full bg-emerald-600 dark:bg-emerald-500 rounded-full transition-all duration-150"
            style={{ width: `${(currentSeconds / TOTAL_DURATION) * 100}%` }}
          />
        </div>

        {/* Buttons Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          {/* Left Controls: Play/Pause, Chapter Prev/Next, Timestamps */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => {
                if (currentSeconds >= TOTAL_DURATION) {
                  handleRestart();
                } else {
                  setIsPlaying(!isPlaying);
                }
              }}
              className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition-colors shrink-0"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
            </button>

            <button
              onClick={handleRestart}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors shrink-0"
              title="Restart from beginning"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Chapter Skip Buttons */}
            <div className="flex items-center gap-1 border-l border-slate-200 dark:border-slate-800 pl-2">
              <button
                onClick={() => handleSkipChapter(currentSeconds - 20)}
                className="p-1 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded"
                title="Previous Chapter"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300 whitespace-nowrap">
                Scene {currentScene}/3
              </span>
              <button
                onClick={() => handleSkipChapter(currentSeconds + 20)}
                className="p-1 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded"
                title="Next Chapter"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <span className="font-mono text-slate-500 dark:text-slate-400 text-[11px] whitespace-nowrap">
              {formatTime(currentSeconds)} / {formatTime(TOTAL_DURATION)}
            </span>
          </div>

          {/* Right Controls: Sound Toggle, Fullscreen, Action Link */}
          <div className="flex items-center gap-1.5 ml-auto">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-1.5 rounded transition-colors shrink-0 ${
                isMuted
                  ? 'text-red-600 dark:text-red-400 hover:text-red-700 bg-red-100 dark:bg-red-950/40'
                  : 'text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 bg-emerald-100 dark:bg-emerald-950/40'
              }`}
              title={isMuted ? 'Unmute voiceover' : 'Mute voiceover'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <button
              onClick={handleToggleFullscreen}
              className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition-colors shrink-0"
              title="Toggle Fullscreen"
            >
              <Maximize2 className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                onClose();
                onNavigate(currentScene === 1 ? 'calculator' : currentScene === 2 ? 'vault' : 'watermark');
              }}
              className="btn btn-primary btn-sm h-7 px-2.5 text-[11px] whitespace-nowrap shrink-0"
            >
              <span>
                {currentScene === 1
                  ? 'Try Calculator'
                  : currentScene === 2
                  ? 'Try Vault'
                  : 'Try Watermarker'}
              </span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
