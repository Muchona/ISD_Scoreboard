import React from 'react';
import { ExternalLink } from 'lucide-react';

interface IsdCitationProps {
  title: string;
  url: string;
  tag?: string;
  className?: string;
  variant?: 'blue' | 'orange' | 'emerald';
}

export const IsdCitation: React.FC<IsdCitationProps> = ({
  title,
  url,
  tag,
  className = '',
  variant = 'orange',
}) => {
  const isOrange = variant === 'orange';
  const isEmerald = variant === 'emerald';

  const containerStyles = isOrange
    ? 'bg-orange-50/90 hover:bg-orange-100 dark:bg-orange-500/10 dark:hover:bg-orange-500/20 text-orange-800 dark:text-orange-300 ring-1 ring-inset ring-orange-500/25 dark:ring-orange-400/25'
    : isEmerald
    ? 'bg-emerald-50/90 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 ring-1 ring-inset ring-emerald-600/20 dark:ring-emerald-400/25'
    : 'bg-blue-50/80 hover:bg-blue-100/90 dark:bg-blue-500/10 dark:hover:bg-blue-500/15 text-blue-700 dark:text-blue-300 ring-1 ring-inset ring-blue-600/20 dark:ring-blue-400/25';

  const tagColor = isOrange
    ? 'text-orange-900 dark:text-orange-200'
    : isEmerald
    ? 'text-emerald-900 dark:text-emerald-200'
    : 'text-blue-800 dark:text-blue-200';

  const dotColor = isOrange
    ? 'text-orange-400 dark:text-orange-600'
    : isEmerald
    ? 'text-emerald-400 dark:text-emerald-600'
    : 'text-blue-300 dark:text-blue-600/80';

  const iconColor = isOrange
    ? 'text-orange-600 dark:text-orange-400'
    : isEmerald
    ? 'text-emerald-600 dark:text-emerald-400'
    : 'text-blue-500 dark:text-blue-400';

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`group inline-flex items-center gap-1.5 px-3 h-7 text-xs font-medium rounded-full ${containerStyles} transition-all whitespace-nowrap shrink-0 select-none ${className}`}
      title="View official rule on Department of Justice / ISD website"
    >
      {tag && (
        <>
          <span className={`font-mono text-[10px] font-bold uppercase tracking-wider ${tagColor}`}>
            {tag}
          </span>
          <span className={`${dotColor} text-[10px]`}>•</span>
        </>
      )}
      <span className="truncate">{title}</span>
      <ExternalLink className={`w-3 h-3 ${iconColor} opacity-75 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0`} />
    </a>
  );
};
