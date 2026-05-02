/**
 * =============================================
 * googleDrive.js — Servicio de Google Drive
 * Sube Word → convierte a Google Docs → exporta HTML
 * =============================================
 */

const { google } = require('googleapis');
const { Readable } = require('stream');

// Autenticación con cuenta de servicio
function obtenerAuth() {
    return new google.auth.GoogleAuth({
        credentials: {
            client_email: process.env.GOOGLE_CLIENT_EMAIL,
            private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n')
        },
        scopes: ['https://www.googleapis.com/auth/drive']
    });
}

/**
 * Sube un archivo Word a Google Drive y lo convierte a Google Docs.
 * Luego exporta el contenido como HTML para el editor.
 * @param {Buffer} buffer - Contenido del archivo .docx
 * @param {string} nombre - Nombre del documento
 * @returns {{ googleDocId, htmlContent }}
 */
async function subirWordYConvertir(buffer, nombre) {
    const auth = obtenerAuth();
    const drive = google.drive({ version: 'v3', auth });

    // 1. Subir el Word y convertirlo automáticamente a Google Docs
    const archivoSubido = await drive.files.create({
        requestBody: {
            name: nombre,
            mimeType: 'application/vnd.google-apps.document', // conversión automática
            parents: [process.env.GOOGLE_DRIVE_FOLDER_ID]
        },
        media: {
            mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            body: Readable.from(buffer)
        },
        fields: 'id, name'
    });

    const googleDocId = archivoSubido.data.id;

    // 2. Exportar el Google Doc como HTML
    const exportado = await drive.files.export({
        fileId: googleDocId,
        mimeType: 'text/html'
    }, { responseType: 'text' });

    const htmlContent = exportado.data;

    return { googleDocId, htmlContent };
}

/**
 * Exporta el HTML actualizado de un Google Doc existente.
 * @param {string} googleDocId
 */
async function exportarHtml(googleDocId) {
    const auth = obtenerAuth();
    const drive = google.drive({ version: 'v3', auth });

    const exportado = await drive.files.export({
        fileId: googleDocId,
        mimeType: 'text/html'
    }, { responseType: 'text' });

    return exportado.data;
}

/**
 * Elimina un archivo de Google Drive.
 * @param {string} googleDocId
 */
async function eliminarArchivo(googleDocId) {
    try {
        const auth = obtenerAuth();
        const drive = google.drive({ version: 'v3', auth });
        await drive.files.delete({ fileId: googleDocId });
    } catch (error) {
        console.warn('No se pudo eliminar de Drive:', error.message);
    }
}

module.exports = { subirWordYConvertir, exportarHtml, eliminarArchivo };
