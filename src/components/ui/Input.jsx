import React from 'react';
import { cn } from '../../lib/utils';

export const Input = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        'glass-input w-full rounded-xl px-4 py-3 text-sm placeholder:text-slate-500',
        className
      )}
      {...props}
    />
  );
});

Input.displayName = "Input";

export const TextArea = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        'glass-input w-full rounded-xl px-4 py-3 text-sm placeholder:text-slate-500 min-h-[100px] resize-y',
        className
      )}
      {...props}
    />
  );
});

TextArea.displayName = "TextArea";
