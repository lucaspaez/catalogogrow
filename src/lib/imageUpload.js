import { AppError } from './errors';

/**
 * Sube una imagen a Vercel Blob vía API route
 * @param {File} file - Archivo de imagen
 * @returns {Promise<string>} URL de la imagen subida
 */
export const uploadImage = async (file) => {
    if (!file) {
        throw new AppError('No se proporcionó archivo', 'NO_FILE');
    }

    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
        throw new AppError(
            'Tipo de archivo no permitido. Usa JPG, PNG, WEBP o GIF.',
            'INVALID_FILE_TYPE'
        );
    }

    // Validar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
        throw new AppError(
            'El archivo es demasiado grande. Máximo 5MB.',
            'FILE_TOO_LARGE'
        );
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const error = await response.json();
            throw new AppError(
                error.error || 'Error al subir imagen',
                'UPLOAD_ERROR'
            );
        }

        const data = await response.json();
        return data.url;
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError('Error de red al subir imagen', 'NETWORK_ERROR');
    }
};
