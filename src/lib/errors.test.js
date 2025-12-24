import { describe, it, expect } from 'vitest';
import { AppError, ValidationError, NotFoundError, AuthError } from './errors.js';

describe('AppError', () => {
    it('crea un error con mensaje y código', () => {
        const error = new AppError('Test error', 'TEST_CODE');
        expect(error.message).toBe('Test error');
        expect(error.code).toBe('TEST_CODE');
        expect(error.statusCode).toBe(500);
        expect(error.name).toBe('AppError');
    });

    it('usa código por defecto si no se proporciona', () => {
        const error = new AppError('Test error');
        expect(error.code).toBe('UNKNOWN_ERROR');
    });

    it('permite código de estado personalizado', () => {
        const error = new AppError('Test error', 'CUSTOM', 400);
        expect(error.statusCode).toBe(400);
    });

    it('es una instancia de Error', () => {
        const error = new AppError('Test');
        expect(error instanceof Error).toBe(true);
    });
});

describe('ValidationError', () => {
    it('crea un error de validación con código 400', () => {
        const error = new ValidationError('Invalid input');
        expect(error.message).toBe('Invalid input');
        expect(error.code).toBe('VALIDATION_ERROR');
        expect(error.statusCode).toBe(400);
        expect(error.name).toBe('ValidationError');
    });

    it('extiende AppError', () => {
        const error = new ValidationError('Test');
        expect(error instanceof AppError).toBe(true);
    });
});

describe('NotFoundError', () => {
    it('crea un error 404 con recurso', () => {
        const error = new NotFoundError('Producto');
        expect(error.message).toBe('Producto no encontrado');
        expect(error.code).toBe('NOT_FOUND');
        expect(error.statusCode).toBe(404);
        expect(error.name).toBe('NotFoundError');
    });
});

describe('AuthError', () => {
    it('crea un error de autenticación con código 401', () => {
        const error = new AuthError('Unauthorized');
        expect(error.message).toBe('Unauthorized');
        expect(error.code).toBe('AUTH_ERROR');
        expect(error.statusCode).toBe(401);
        expect(error.name).toBe('AuthError');
    });

    it('usa mensaje por defecto si no se proporciona', () => {
        const error = new AuthError();
        expect(error.message).toBe('No autorizado');
    });
});
