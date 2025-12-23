import { put } from '@vercel/blob';

// Node.js runtime (default) es compatible con @vercel/blob

export default async function handler(req, res) {
    // Verificar que sea POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // En Node.js runtime, el body viene como JSON
        const { file, filename } = req.body;

        if (!file) {
            return res.status(400).json({ error: 'No se proporcionó archivo' });
        }

        // El archivo viene como data URL (data:image/jpeg;base64,...)
        // Extraer el tipo y el base64
        const matches = file.match(/^data:(.+);base64,(.+)$/);
        if (!matches) {
            return res.status(400).json({ error: 'Formato de archivo inválido' });
        }

        const mimeType = matches[1];
        const base64Data = matches[2];

        // Validar tipo de archivo
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedTypes.includes(mimeType)) {
            return res.status(400).json({
                error: 'Tipo de archivo no permitido. Usa JPG, PNG, WEBP o GIF.'
            });
        }

        // Convertir base64 a Buffer
        const buffer = Buffer.from(base64Data, 'base64');

        // Validar tamaño (máximo 5MB)
        const maxSize = 5 * 1024 * 1024;
        if (buffer.length > maxSize) {
            return res.status(400).json({
                error: 'El archivo es demasiado grande. Máximo 5MB.'
            });
        }

        // Generar nombre único para el archivo
        const timestamp = Date.now();
        const extension = mimeType.split('/')[1];
        const finalFilename = `products/${timestamp}-${filename || `image.${extension}`}`;

        // Subir a Vercel Blob
        const blob = await put(finalFilename, buffer, {
            access: 'public',
            contentType: mimeType,
        });

        return res.status(200).json({ url: blob.url });
    } catch (error) {
        console.error('Upload error:', error);
        return res.status(500).json({
            error: 'Error al subir imagen',
            details: error.message
        });
    }
}
