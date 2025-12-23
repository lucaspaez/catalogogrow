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

    try {
        // Convertir archivo a base64 para enviar como JSON
        const base64 = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });

        const response = await fetch('/api/upload', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                file: base64,
                filename: file.name,
            }),
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
