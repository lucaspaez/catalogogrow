import { put } from '@vercel/blob';

// Node.js runtime (default) es compatible con @vercel/blob


export default async function handler(request) {
    // Verificar que sea POST
    if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        // Obtener el archivo del FormData
        const formData = await request.formData();
        const file = formData.get('file');

        if (!file) {
            return new Response(JSON.stringify({ error: 'No se proporcionó archivo' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Validaciones
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            return new Response(
                JSON.stringify({ error: 'Tipo de archivo no permitido. Usa JPG, PNG, WEBP o GIF.' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            return new Response(
                JSON.stringify({ error: 'El archivo es demasiado grande. Máximo 5MB.' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Generar nombre único para el archivo
        const timestamp = Date.now();
        const filename = `products/${timestamp}-${file.name}`;

        // Subir a Vercel Blob
        const blob = await put(filename, file, {
            access: 'public',
            token: process.env.BLOB_READ_WRITE_TOKEN,
        });

        return new Response(
            JSON.stringify({ url: blob.url }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Upload error:', error);
        return new Response(
            JSON.stringify({ error: 'Error al subir imagen' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
