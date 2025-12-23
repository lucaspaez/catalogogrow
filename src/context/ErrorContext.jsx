import React, { createContext, useContext, useState, useCallback } from 'react';
import { AppError } from '../lib/errors';
import { X, AlertCircle } from 'lucide-react';

const ErrorContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useError = () => {
    const context = useContext(ErrorContext);
    if (!context) throw new Error('useError must be used within ErrorProvider');
    return context;
};

export const ErrorProvider = ({ children }) => {
    const [error, setError] = useState(null);

    const showError = useCallback((error) => {
        const appError = error instanceof AppError
            ? error
            : new AppError(error?.message || 'Error inesperado');

        setError(appError);

        // Auto-clear después de 5 segundos
        setTimeout(() => setError(null), 5000);
    }, []);

    const clearError = useCallback(() => setError(null), []);

    return (
        <ErrorContext.Provider value={{ error, showError, clearError }}>
            {children}

            {/* Toast de Error */}
            {error && (
                <div className="fixed bottom-4 right-4 z-[200] animate-in slide-in-from-bottom-5">
                    <div className="bg-red-500/90 backdrop-blur-xl border border-red-400/50 rounded-2xl p-4 shadow-2xl max-w-md">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                            <div className="flex-grow">
                                <p className="text-white font-bold text-sm">{error.message}</p>
                                {error.code && (
                                    <p className="text-red-200 text-xs mt-1">Código: {error.code}</p>
                                )}
                            </div>
                            <button
                                onClick={clearError}
                                className="text-white/80 hover:text-white transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </ErrorContext.Provider>
    );
};
