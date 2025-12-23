import DOMPurify from 'dompurify';

/**
 * Sanitiza texto plano para prevenir XSS
 * @param {string} text - Texto a sanitizar
 * @returns {string} Texto sanitizado
 */
export const sanitizeText = (text) => {
    if (typeof text !== 'string') return '';

    return text
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;')
        .trim();
};

/**
 * Sanitiza HTML permitiendo solo tags seguros
 * @param {string} dirty - HTML a sanitizar
 * @returns {string} HTML sanitizado
 */
export const sanitizeHTML = (dirty) => {
    return DOMPurify.sanitize(dirty, {
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong'],
        ALLOWED_ATTR: []
    });
};
