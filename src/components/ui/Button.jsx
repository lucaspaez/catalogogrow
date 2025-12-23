import React from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

export const Button = React.forwardRef(({ 
  className, 
  variant = 'primary', 
  size = 'md', 
  isLoading, 
  children, 
  ...props 
}, ref) => {
  const variants = {
    primary: 'glass-button font-bold uppercase tracking-wide',
    secondary: 'bg-surface text-slate-200 border border-white/10 hover:bg-surface/80 hover:border-white/20 active:scale-95 transition-all font-medium',
    danger: 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all font-bold uppercase',
    ghost: 'bg-transparent text-slate-400 hover:text-white hover:bg-white/5 transition-all',
    icon: 'p-2 aspect-square flex items-center justify-center rounded-xl bg-surface border border-white/5 hover:border-highlight/50 hover:text-highlight transition-all'
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 rounded-lg',
    md: 'text-sm px-5 py-2.5 rounded-xl',
    lg: 'text-base px-8 py-4 rounded-2xl',
    icon: 'p-2'
  };

  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none',
        variants[variant],
        variant !== 'icon' && sizes[size],
        className
      )}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
});

Button.displayName = "Button";
