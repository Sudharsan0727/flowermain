const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, 'src', 'assets');
const files = fs.readdirSync(assetsDir);

async function compressAssets() {
    console.log('--- Starting Asset Shrinking ---');
    for (const file of files) {
        const ext = path.extname(file).toLowerCase();
        if (ext === '.jpg' || ext === '.png' || ext === '.jpeg') {
            const inputPath = path.join(assetsDir, file);
            const outputPath = path.join(assetsDir, file.replace(ext, '.webp'));
            
            console.log(`Processing: ${file}...`);
            await sharp(inputPath)
                .resize(1600, null, { withoutEnlargement: true })
                .webp({ quality: 80 })
                .toFile(outputPath);
            
            // If the original was huge, we might want to replace it or just keep the webp.
            // For React imports to work easily, it's better if we keep the names or update them.
            // Let's just compress the original files in place too but keep extensions for now 
            // OR create small versions.
            
            // Better strategy: Compress the PNG/JPG directly to a smaller version of itself
            const tempPath = inputPath + '.tmp';
            if (ext === '.png') {
                await sharp(inputPath)
                    .resize(1200, null, { withoutEnlargement: true })
                    .png({ quality: 80, compressionLevel: 9 })
                    .toFile(tempPath);
            } else {
                await sharp(inputPath)
                    .resize(1600, null, { withoutEnlargement: true })
                    .jpeg({ quality: 80 })
                    .toFile(tempPath);
            }
            
            const oldSize = fs.statSync(inputPath).size / (1024 * 1024);
            const newSize = fs.statSync(tempPath).size / (1024 * 1024);
            
            fs.renameSync(tempPath, inputPath);
            console.log(`✅ ${file}: ${oldSize.toFixed(2)}MB -> ${newSize.toFixed(2)}MB`);
        }
    }
    console.log('--- ALL ASSETS SHRUNK! ---');
}

compressAssets();
