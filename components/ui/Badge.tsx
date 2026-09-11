import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'danger' | 'warning' | 'info' | 'outline' | 'exchange';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className,
}) => {
  const variantStyles = {
    default: 'bg-gray-800 text-gray-300 border-gray-700',
    success: 'bg-emerald-950/70 text-emerald-400 border-emerald-800/60',
    danger: 'bg-rose-950/70 text-rose-400 border-rose-800/60',
    warning: 'bg-amber-950/70 text-amber-400 border-amber-800/60',
    info: 'bg-blue-950/70 text-blue-400 border-blue-800/60',
    outline: 'bg-transparent text-gray-400 border-gray-700',
    exchange: 'bg-slate-800 text-cyan-400 border-cyan-800/40 font-mono font-semibold',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md border font-medium transition-colors',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {children}
    </span>
  );
};
