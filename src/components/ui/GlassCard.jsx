import React from 'react';
import { cn } from '../../lib/utils';

export const GlassCard = React.forwardRef(({ className, children, hoverEffect = false, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'glass-panel rounded-[2rem] p-6 text-slate-100',
        hoverEffect && 'transition-all duration-300 hover:border-highlight/30 hover:shadow-highlight/10 hover:-translate-y-1',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

GlassCard.displayName = "GlassCard";
