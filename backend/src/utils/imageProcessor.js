const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

/**
 * Compresses an image to be under a certain size limit if possible.
 * @param {string} inputPath 
 * @param {string} uploadDir 
 * @param {number} sizeLimitKB 
 * @returns {Promise<{filename: string, path: string, size: number}>}
 */
async function compressImage(inputPath, uploadDir, sizeLimitKB = 200) {
    try {
        const ext = path.extname(inputPath).toLowerCase();
        const filename = path.basename(inputPath, ext);
        // Clean filename and ensure lowercase
        const cleanBasename = filename.replace(/[^a-zA-Z0-9.-]/g, '_').toLowerCase();
        const outputFilename = `${cleanBasename}_compressed.webp`;
        const outputPath = path.join(uploadDir, outputFilename);

        console.log(`[PROCESSOR] Processing: ${path.basename(inputPath)} -> ${outputFilename}`);

        // Ensure we don't write to the same file
        if (inputPath === outputPath) {
            console.log('[PROCESSOR] Input and output paths are identical, using temporary path.');
            const tempPath = outputPath + '.tmp';
            await sharp(inputPath).webp({ quality: 80 }).toFile(tempPath);
            fs.renameSync(tempPath, outputPath);
            return { filename: outputFilename, path: outputPath, size: fs.statSync(outputPath).size / 1024 };
        }

        let quality = 80;
        let width = null;

        const metadata = await sharp(inputPath).metadata();
        console.log(`[PROCESSOR] Original: ${metadata.width}x${metadata.height}, ${metadata.format}`);
        
        if (metadata.width > 1600) width = 1600;

        // Initial compression
        await sharp(inputPath)
            .resize(width)
            .webp({ quality })
            .toFile(outputPath);

        let lastSize = fs.statSync(outputPath).size / 1024;
        console.log(`[PROCESSOR] Initial WebP size: ${lastSize.toFixed(2)} KB`);

        // Iterative compression if still over limit
        while (lastSize > sizeLimitKB && quality > 20) {
            quality -= 10;
            const tempBuffer = await sharp(inputPath)
                .resize(width)
                .webp({ quality })
                .toBuffer();
            
            fs.writeFileSync(outputPath, tempBuffer);
            lastSize = fs.statSync(outputPath).size / 1024;
            console.log(`[PROCESSOR] Iterating quality: ${quality}, size: ${lastSize.toFixed(2)} KB`);
        }

        return {
            filename: outputFilename,
            path: outputPath,
            size: lastSize
        };
    } catch (error) {
        console.error('[PROCESSOR] Fatal Error:', error);
        throw error;
    }
}

module.exports = { compressImage };
