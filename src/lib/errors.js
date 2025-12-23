export class AppError extends Error {
    constructor(message, code = 'UNKNOWN_ERROR', statusCode = 500) {
        super(message);
        this.code = code;
        this.statusCode = statusCode;
        this.name = 'AppError';
    }
}

export class ValidationError extends AppError {
    constructor(message) {
        super(message, 'VALIDATION_ERROR', 400);
        this.name = 'ValidationError';
    }
}

export class NotFoundError extends AppError {
    constructor(resource) {
        super(`${resource} no encontrado`, 'NOT_FOUND', 404);
        this.name = 'NotFoundError';
    }
}

export class AuthError extends AppError {
    constructor(message = 'No autorizado') {
        super(message, 'AUTH_ERROR', 401);
        this.name = 'AuthError';
    }
}
