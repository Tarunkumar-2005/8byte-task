import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  hoverEffect = false,
  ...props
}) => {
  return (
    <div
      className={cn(
        'rounded-xl border border-gray-800/80 bg-gray-900/90 p-5 shadow-lg backdrop-blur-sm transition-all duration-200',
        hoverEffect && 'hover:border-gray-700/80 hover:bg-gray-900 hover:shadow-xl hover:shadow-black/30',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
