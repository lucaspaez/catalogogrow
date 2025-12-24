import { describe, it, expect } from 'vitest';
import { sanitizeText, sanitizeHTML } from './sanitize.js';

describe('sanitizeText', () => {
    it('escapa caracteres HTML peligrosos', () => {
        const input = '<script>alert("XSS")</script>';
        const result = sanitizeText(input);
        expect(result).not.toContain('<script>');
        expect(result).toContain('&lt;script&gt;');
    });

    it('escapa comillas dobles', () => {
        const input = 'Producto "Premium"';
        const result = sanitizeText(input);
        expect(result).toContain('&quot;');
    });

    it('escapa comillas simples', () => {
        const input = "It's working";
        const result = sanitizeText(input);
        expect(result).toContain('&#x27;');
    });

    it('escapa barras', () => {
        const input = 'test/path';
        const result = sanitizeText(input);
        expect(result).toContain('&#x2F;');
    });

    it('hace trim del texto', () => {
        const input = '  texto con espacios  ';
        const result = sanitizeText(input);
        expect(result).toBe(sanitizeText('texto con espacios'));
    });

    it('retorna string vacío para non-strings', () => {
        expect(sanitizeText(null)).toBe('');
        expect(sanitizeText(undefined)).toBe('');
        expect(sanitizeText(123)).toBe('');
        expect(sanitizeText({})).toBe('');
    });

    it('no modifica texto seguro', () => {
        const input = 'Texto normal sin caracteres especiales';
        const result = sanitizeText(input);
        expect(result).toBe(input.trim());
    });
});

describe('sanitizeHTML', () => {
    it('permite tags seguros', () => {
        const input = '<b>negrita</b> y <i>cursiva</i>';
        const result = sanitizeHTML(input);
        expect(result).toContain('<b>');
        expect(result).toContain('<i>');
    });

    it('remueve scripts', () => {
        const input = '<script>alert("XSS")</script><b>safe</b>';
        const result = sanitizeHTML(input);
        expect(result).not.toContain('<script>');
        expect(result).toContain('<b>safe</b>');
    });

    it('remueve event handlers', () => {
        const input = '<div onclick="alert(1)">click</div>';
        const result = sanitizeHTML(input);
        expect(result).not.toContain('onclick');
    });

    it('remueve tags peligrosos', () => {
        const input = '<iframe src="evil.com"></iframe>';
        const result = sanitizeHTML(input);
        expect(result).not.toContain('<iframe>');
    });
});
