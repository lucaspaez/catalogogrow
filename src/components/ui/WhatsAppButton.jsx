import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const WhatsAppButton = () => {
    const { settings } = useStore();

    const handleClick = () => {
        const message = encodeURIComponent('¡Hola! Tengo una consulta sobre los productos del catálogo.');
        window.open(`https://wa.me/${settings.whatsappNumber}?text=${message}`, '_blank');
    };

    if (!settings.whatsappNumber) return null;

    return (
        <button
            onClick={handleClick}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-2xl hover:shadow-green-500/50 transition-all duration-300 group"
            aria-label="Contactar por WhatsApp"
        >
            {/* Icono siempre visible */}
            <div className="w-14 h-14 flex items-center justify-center">
                <MessageCircle className="w-7 h-7" />
            </div>

            {/* Texto que aparece en hover */}
            <span className="max-w-0 overflow-hidden group-hover:max-w-xs group-hover:pr-5 transition-all duration-300 whitespace-nowrap font-semibold text-sm">
                ¿Necesitas ayuda?
            </span>
        </button>
    );
};
