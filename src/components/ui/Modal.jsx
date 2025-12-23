import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

export const Modal = ({ isOpen, onClose, title, children, className }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-md animate-in fade-in duration-200"
        onClick={onClose}
      />
      <div className={cn(
        "relative w-full max-w-lg bg-surface/95 border border-white/10 rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 duration-200 p-6 md:p-8 max-h-[90vh] overflow-y-auto",
        className
      )}>
        <div className="flex items-start justify-between mb-6">
          {title && <h2 className="text-xl font-bold uppercase tracking-wide text-white">{title}</h2>}
          <button 
            onClick={onClose}
            className="p-2 -mr-2 -mt-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
};
