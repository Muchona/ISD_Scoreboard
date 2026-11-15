import type { FC } from 'react';

/**
 * Onyx Badge — mandatory brand signature (Onyx Unified Protocol §4).
 * Ported from onyx-and-code/src/components/OnyxBadge.tsx.
 * Adaptation: logo is Onyx White in dark mode and Onyx Black in light mode
 * (the original white-only logo is invisible on this site's light footer).
 */
const OnyxBadge: FC = () => {
  return (
    <div className="group flex select-none flex-col items-center justify-center text-center font-sans md:items-end md:text-right">
      {/* Logo */}
      <a
        href="https://www.onyxandcode.com"
        target="_blank"
        rel="noopener noreferrer"
        className="mb-1.5 block transition-transform duration-300 md:hover:scale-105"
      >
        <span className="text-sm font-extrabold tracking-[0.2em] text-[#0f0f0f] dark:text-white">
          ONYX <span className="text-[#D4AF37]">&amp;</span> CODE
        </span>
      </a>

      {/* Subtext */}
      <div className="flex flex-col gap-0.5">
        <span className="text-xs font-medium uppercase tracking-widest text-slate-500 transition-colors duration-300 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-400">
          DESIGNED AND BUILT BY
        </span>
        <a
          href="https://www.onyxandcode.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-medium uppercase tracking-widest text-[#2563EB] transition-colors duration-300 hover:text-[#3B82F6] hover:underline hover:decoration-[#2563EB]/30 hover:underline-offset-4"
        >
          WWW.ONYXANDCODE.COM
        </a>
      </div>
    </div>
  );
};

export default OnyxBadge;

